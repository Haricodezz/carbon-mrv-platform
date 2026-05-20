'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { listPendingKYC, approveKYC, rejectKYC, PendingKYCItem } from '@/services/kycService';
import { listPendingLandDocs, approveLandDoc, rejectLandDoc, PendingLandItem } from '@/services/landVerificationService';
import { getDocumentViewUrl } from '@/services/auditorService';

// ─── Document Viewer Modal ──────────────────────────────────────────────────
function DocModal({ url, title, onClose }: { url: string; title: string; onClose: () => void }) {
  const isImage = /\.(png|jpg|jpeg|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">{title}</h3>
          <div className="flex gap-3">
            <a href={url} target="_blank" rel="noreferrer" className="rounded-full bg-slate-200 text-slate-700 px-4 py-1.5 text-sm font-semibold hover:bg-slate-300 transition">↗ Open</a>
            <a href={url} download className="rounded-full bg-green-700 text-white px-4 py-1.5 text-sm font-semibold hover:bg-green-800 transition">↓ Download</a>
            <button onClick={onClose} className="rounded-full w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 font-bold">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          {isImage && <img src={url} alt={title} className="max-w-full mx-auto rounded-xl shadow object-contain max-h-[70vh]" />}
          {isPdf && <iframe src={url} className="w-full rounded-xl border border-slate-200" style={{ height: '70vh' }} title={title} />}
          {!isImage && !isPdf && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-5xl mb-4">📄</p>
              <p>Preview unavailable.</p>
              <a href={url} download className="mt-4 inline-block text-green-700 font-semibold underline">Download</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── KYC Card ──────────────────────────────────────────────────────────────
function KYCCard({
  doc,
  onApprove,
  onReject,
  processing,
}: {
  doc: PendingKYCItem;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  processing: string | null;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [docModal, setDocModal] = useState<{ url: string; title: string } | null>(null);

  const docLabel = doc.document_type.replace(/_/g, ' ').toUpperCase();
  const viewUrl = doc.file_url ? getDocumentViewUrl(doc.file_url) : null;

  return (
    <>
      {docModal && <DocModal url={docModal.url} title={docModal.title} onClose={() => setDocModal(null)} />}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-5">
          {/* Identity Icon */}
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl flex-shrink-0">
            {doc.user_role === 'farmer' ? '🌾' : doc.user_role === 'ngo' || doc.user_role === 'nco' ? '🌿' : '🏢'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-slate-900 text-lg">{doc.user_name}</h3>
              <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-0.5 text-xs font-bold capitalize">{doc.user_role}</span>
              <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-0.5 text-xs font-bold">Pending Review</span>
            </div>
            <p className="text-sm text-slate-500 mt-1">{doc.user_email}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-700">
              <span><strong>Document:</strong> {docLabel}</span>
              <span><strong>Submitted:</strong> {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
            </div>

            {/* Document Viewer */}
            {viewUrl && (
              <button
                onClick={() => setDocModal({ url: viewUrl, title: docLabel })}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:border-green-400 transition"
              >
                <span>📎</span> View Document
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 min-w-[180px]">
            {rejecting ? (
              <div className="space-y-2">
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Rejection reason (required)…"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onReject(doc.kyc_id, reason); setRejecting(false); }}
                    disabled={!!processing || !reason.trim()}
                    className="flex-1 rounded-xl bg-red-600 text-white py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                  <button onClick={() => { setRejecting(false); setReason(''); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onApprove(doc.kyc_id)}
                  disabled={!!processing}
                  className="rounded-xl bg-green-700 text-white py-2.5 text-sm font-bold hover:bg-green-800 transition disabled:opacity-50"
                >
                  {processing === doc.kyc_id ? '…' : '✓ Approve KYC'}
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  className="rounded-xl border border-red-200 text-red-600 py-2.5 text-sm font-bold hover:bg-red-50 transition"
                >
                  ✕ Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Land Card ──────────────────────────────────────────────────────────────
function LandCard({
  doc,
  onApprove,
  onReject,
  processing,
}: {
  doc: PendingLandItem;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  processing: string | null;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [docModal, setDocModal] = useState<{ url: string; title: string } | null>(null);

  const docLabel = doc.document_type.replace(/_/g, ' ').toUpperCase();
  const viewUrl = doc.file_url ? getDocumentViewUrl(doc.file_url) : null;

  return (
    <>
      {docModal && <DocModal url={docModal.url} title={docModal.title} onClose={() => setDocModal(null)} />}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-xl flex-shrink-0">🗺️</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-bold text-slate-900 text-lg">{doc.project_name}</h3>
              <span className="rounded-full bg-yellow-100 text-yellow-700 px-3 py-0.5 text-xs font-bold">Land Pending</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-700">
              <span><strong>Document Type:</strong> {docLabel}</span>
              <span><strong>Submitted:</strong> {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
            </div>
            {viewUrl && (
              <button
                onClick={() => setDocModal({ url: viewUrl, title: docLabel })}
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white hover:border-green-400 transition"
              >
                <span>📎</span> View Document
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2 min-w-[180px]">
            {rejecting ? (
              <div className="space-y-2">
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Rejection reason (required)…"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm resize-none"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { onReject(doc.land_id, reason); setRejecting(false); }}
                    disabled={!!processing || !reason.trim()}
                    className="flex-1 rounded-xl bg-red-600 text-white py-2 text-sm font-bold disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                  <button onClick={() => { setRejecting(false); setReason(''); }} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onApprove(doc.land_id)}
                  disabled={!!processing}
                  className="rounded-xl bg-green-700 text-white py-2.5 text-sm font-bold hover:bg-green-800 transition disabled:opacity-50"
                >
                  {processing === doc.land_id ? '…' : '✓ Approve Land Doc'}
                </button>
                <button
                  onClick={() => setRejecting(true)}
                  className="rounded-xl border border-red-200 text-red-600 py-2.5 text-sm font-bold hover:bg-red-50 transition"
                >
                  ✕ Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AuditorVerificationRequestsPage() {
  const { user, loading: authLoading } = useAuthGuard('auditor');
  const [kycQueue, setKycQueue] = useState<PendingKYCItem[]>([]);
  const [landQueue, setLandQueue] = useState<PendingLandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'kyc' | 'land'>('kyc');
  const [processing, setProcessing] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const loadQueues = useCallback(async () => {
    setLoading(true);
    try {
      const [kyc, land] = await Promise.all([listPendingKYC(), listPendingLandDocs()]);
      setKycQueue(kyc);
      setLandQueue(land);
    } catch (err: any) {
      showToast(err.message || 'Failed to load review queues.', false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadQueues();
  }, [user, loadQueues]);

  const handleApproveKYC = async (kycId: string) => {
    setProcessing(kycId);
    try {
      await approveKYC(kycId);
      showToast('KYC document approved. User profile updated.', true);
      setKycQueue(prev => prev.filter(d => d.kyc_id !== kycId));
    } catch (err: any) { showToast(err.message, false); }
    finally { setProcessing(null); }
  };

  const handleRejectKYC = async (kycId: string, reason: string) => {
    setProcessing(kycId);
    try {
      await rejectKYC(kycId, reason);
      showToast('KYC document rejected. User notified.', true);
      setKycQueue(prev => prev.filter(d => d.kyc_id !== kycId));
    } catch (err: any) { showToast(err.message, false); }
    finally { setProcessing(null); }
  };

  const handleApproveLand = async (landId: string) => {
    setProcessing(landId);
    try {
      await approveLandDoc(landId);
      showToast('Land document approved. Project lifecycle advanced.', true);
      setLandQueue(prev => prev.filter(d => d.land_id !== landId));
    } catch (err: any) { showToast(err.message, false); }
    finally { setProcessing(null); }
  };

  const handleRejectLand = async (landId: string, reason: string) => {
    setProcessing(landId);
    try {
      await rejectLandDoc(landId, reason);
      showToast('Land document rejected.', true);
      setLandQueue(prev => prev.filter(d => d.land_id !== landId));
    } catch (err: any) { showToast(err.message, false); }
    finally { setProcessing(null); }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading review queues…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 rounded-2xl px-5 py-4 shadow-xl font-medium text-sm ${toast.ok ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.ok ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">KYC & Land Verification Queue</h1>
          <p className="text-slate-600">
            Review identity documents and land ownership proofs submitted by farmers, NGOs, and companies. Open documents to inspect them before approving.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveTab('kyc')}
            className={`rounded-full px-6 py-2.5 font-semibold text-sm transition ${activeTab === 'kyc' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Identity / KYC
            {kycQueue.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {kycQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('land')}
            className={`rounded-full px-6 py-2.5 font-semibold text-sm transition ${activeTab === 'land' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >
            Land Ownership Proofs
            {landQueue.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {landQueue.length}
              </span>
            )}
          </button>
          <button onClick={loadQueues} className="ml-auto rounded-full border border-slate-200 bg-white text-slate-600 px-4 py-2 text-sm hover:bg-slate-50 transition">
            ↻ Refresh
          </button>
        </div>

        {/* KYC Queue */}
        {activeTab === 'kyc' && (
          <div className="space-y-4">
            {kycQueue.length === 0 ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-16 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-slate-400 text-lg font-medium">No pending KYC documents.</p>
                <p className="text-slate-400 text-sm mt-1">All identity submissions have been reviewed.</p>
              </div>
            ) : (
              kycQueue.map(doc => (
                <KYCCard
                  key={doc.kyc_id}
                  doc={doc}
                  onApprove={handleApproveKYC}
                  onReject={handleRejectKYC}
                  processing={processing}
                />
              ))
            )}
          </div>
        )}

        {/* Land Queue */}
        {activeTab === 'land' && (
          <div className="space-y-4">
            {landQueue.length === 0 ? (
              <div className="rounded-3xl bg-white border border-slate-200 p-16 text-center">
                <p className="text-4xl mb-3">✅</p>
                <p className="text-slate-400 text-lg font-medium">No pending land documents.</p>
                <p className="text-slate-400 text-sm mt-1">All land ownership submissions have been reviewed.</p>
              </div>
            ) : (
              landQueue.map(doc => (
                <LandCard
                  key={doc.land_id}
                  doc={doc}
                  onApprove={handleApproveLand}
                  onReject={handleRejectLand}
                  processing={processing}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
