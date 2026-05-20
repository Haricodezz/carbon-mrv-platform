'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getMyKYCStatus, uploadKYCDocument, KYCStatus } from '@/services/kycService';

const DOCUMENT_TYPES = [
  { type: 'govt_id',          label: 'Government ID Proof',              description: 'Aadhaar, Passport, Voter ID, or PAN Card', required: true },
  { type: 'selfie',           label: 'Selfie / Profile Photo',           description: 'Clear photo of your face for identity verification', required: true },
  { type: 'address_proof',    label: 'Address Proof',                    description: 'Utility bill, bank statement, or rent agreement', required: true },
  { type: 'org_registration', label: 'Organization Registration (NGO/Company)', description: 'Company registration certificate or NGO registration number', required: false },
];

export default function KYCPage() {
  const { user, loading: authLoading } = useAuthGuard();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadStatus = async () => {
    try {
      const status = await getMyKYCStatus();
      setKycStatus(status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadStatus();
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading KYC status…</div>;
  }

  if (kycStatus?.is_trusted_role) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="text-6xl mb-6">🛡️</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">KYC Not Required</h1>
        <p className="text-slate-600">Your role ({user?.role}) is an internally trusted role. No identity verification is required.</p>
      </div>
    );
  }

  const handleUpload = async (documentType: string, file: File) => {
    setUploading(documentType);
    setMessage('');
    setError('');
    try {
      await uploadKYCDocument(documentType, file);
      setMessage(`${documentType.replace('_', ' ')} uploaded successfully. Pending review.`);
      await loadStatus();
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const overallStatus = kycStatus?.kyc_status;
  const statusConfig = ({
    not_submitted: { label: 'Not Started',     color: 'bg-slate-100 text-slate-600', icon: '📋' },
    pending:       { label: 'Under Review',    color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
    approved:      { label: 'Fully Verified',  color: 'bg-green-100 text-green-700', icon: '✅' },
    verified:      { label: 'Fully Verified',  color: 'bg-green-100 text-green-700', icon: '✅' },
    rejected:      { label: 'Action Required', color: 'bg-red-100 text-red-700', icon: '⚠️' },
  } as Record<string, { label: string; color: string; icon: string }>)[overallStatus || 'not_submitted'] || { label: 'Unknown', color: 'bg-slate-100 text-slate-600', icon: '?' };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-3">KYC Verification</h1>
        <p className="text-slate-600">Complete your identity verification to unlock project submissions and marketplace access.</p>
        <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 font-bold text-sm ${statusConfig.color}`}>
          <span>{statusConfig.icon}</span> {statusConfig.label}
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-4 text-green-700 font-medium">
          ✓ {message}
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {DOCUMENT_TYPES.map(doc => {
          const uploaded = kycStatus?.documents.find(d => d.document_type === doc.type);
          const isApproved = uploaded?.status === 'approved';
          const isRejected = uploaded?.status === 'rejected';
          const isPending = uploaded?.status === 'pending';

          return (
            <div
              key={doc.type}
              className={`rounded-2xl border p-6 ${isApproved ? 'border-green-200 bg-green-50' : isRejected ? 'border-red-200 bg-red-50' : isPending ? 'border-yellow-200 bg-yellow-50' : 'border-slate-200 bg-white'}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">{doc.label}</h3>
                    {doc.required && <span className="text-xs text-red-500 font-medium">Required</span>}
                    {!doc.required && <span className="text-xs text-slate-400">Optional</span>}
                  </div>
                  <p className="text-sm text-slate-500">{doc.description}</p>

                  {isApproved && (
                    <p className="mt-2 text-sm text-green-600 font-semibold">✓ Verified and approved</p>
                  )}
                  {isRejected && uploaded?.rejection_reason && (
                    <p className="mt-2 text-sm text-red-600">Rejected: {uploaded.rejection_reason}. Please re-upload.</p>
                  )}
                  {isPending && (
                    <p className="mt-2 text-sm text-yellow-600">⏳ Document submitted — awaiting review</p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 px-4 py-2 text-sm font-bold">
                      ✓ Approved
                    </span>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        className="hidden"
                        ref={el => { fileInputRefs.current[doc.type] = el; }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(doc.type, file);
                        }}
                      />
                      <button
                        disabled={uploading === doc.type}
                        onClick={() => fileInputRefs.current[doc.type]?.click()}
                        className="rounded-full bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-60"
                      >
                        {uploading === doc.type ? 'Uploading…' : isPending ? 'Re-Upload' : 'Upload'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl bg-slate-50 border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-2">What happens after KYC?</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• An auditor reviews your documents within 1-2 business days</li>
          <li>• Once approved, you can submit carbon projects and upload land ownership proofs</li>
          <li>• Your user profile is marked as verified across the platform</li>
        </ul>
      </div>
    </div>
  );
}
