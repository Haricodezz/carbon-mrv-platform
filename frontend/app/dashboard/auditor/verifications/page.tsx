'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import {
  fetchPendingProjects,
  verifyProject,
  flagProjectFraud,
  getDocumentViewUrl,
  PendingProject,
} from '@/services/auditorService';

// ─── Document Viewer Modal ──────────────────────────────────────────────────
function DocumentModal({
  url,
  title,
  onClose,
}: {
  url: string;
  title: string;
  onClose: () => void;
}) {
  const isImage = /\.(png|jpg|jpeg|webp)$/i.test(url);
  const isPdf = /\.pdf$/i.test(url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <div className="flex gap-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-slate-100 text-slate-700 px-4 py-1.5 text-sm font-semibold hover:bg-slate-200 transition"
            >
              ↗ Open Full
            </a>
            <a
              href={url}
              download
              className="rounded-full bg-green-700 text-white px-4 py-1.5 text-sm font-semibold hover:bg-green-800 transition"
            >
              ↓ Download
            </a>
            <button
              onClick={onClose}
              className="rounded-full w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 transition font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-slate-50">
          {isImage && (
            <img
              src={url}
              alt={title}
              className="max-w-full mx-auto rounded-xl shadow object-contain max-h-[70vh]"
            />
          )}
          {isPdf && (
            <iframe
              src={url}
              className="w-full rounded-xl border border-slate-200"
              style={{ height: '70vh' }}
              title={title}
            />
          )}
          {!isImage && !isPdf && (
            <div className="text-center py-16 text-slate-500">
              <p className="text-5xl mb-4">📄</p>
              <p>Preview not available for this file type.</p>
              <a href={url} download className="mt-4 inline-block text-green-700 font-semibold underline">
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Fraud Risk Badge ───────────────────────────────────────────────────────
function FraudBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined)
    return <span className="text-slate-400 text-xs">N/A</span>;
  if (score >= 70) return <span className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-bold">🚨 High {score.toFixed(0)}%</span>;
  if (score >= 40) return <span className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-bold">⚠ Medium {score.toFixed(0)}%</span>;
  return <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-bold">✓ Low {score.toFixed(0)}%</span>;
}

// ─── NDVI Meter ─────────────────────────────────────────────────────────────
function NDVIBar({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400 text-xs">No data</span>;
  const pct = Math.min(100, Math.max(0, ((value + 1) / 2) * 100));
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-600">{value.toFixed(3)}</span>
    </div>
  );
}

// ─── Project Review Card ─────────────────────────────────────────────────────
function ProjectCard({
  project,
  onAction,
}: {
  project: PendingProject;
  onAction: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState('');
  const [riskScore, setRiskScore] = useState(project.fraud_risk_score ?? 0);
  const [action, setAction] = useState<'approve' | 'reject' | 'fraud' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [localMsg, setLocalMsg] = useState('');
  const [docModal, setDocModal] = useState<{ url: string; title: string } | null>(null);

  const handleSubmit = async () => {
    if (!notes.trim()) {
      setLocalMsg('Please enter notes before submitting a decision.');
      return;
    }
    setProcessing(true);
    setLocalMsg('');
    try {
      if (action === 'fraud') {
        await flagProjectFraud(project.project_id, notes, riskScore);
        setLocalMsg('Project flagged for fraud. Audit log created.');
      } else if (action === 'approve' || action === 'reject') {
        const status = action === 'approve' ? 'approved' : 'rejected';
        await verifyProject(project.project_id, status, notes, riskScore);
        setLocalMsg(`Project ${status}.`);
        setTimeout(onAction, 1200);
      }
      setAction(null);
    } catch (err: any) {
      setLocalMsg(err.message || 'Action failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {docModal && (
        <DocumentModal
          url={docModal.url}
          title={docModal.title}
          onClose={() => setDocModal(null)}
        />
      )}

      <div className={`rounded-3xl border bg-white shadow-sm overflow-hidden transition ${expanded ? 'border-green-300' : 'border-slate-200'}`}>
        {/* Card Header */}
        <div
          className="p-6 cursor-pointer hover:bg-slate-50 transition"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-slate-900">{project.project_name}</h3>
                <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-0.5 text-xs font-bold capitalize">
                  {project.lifecycle_status?.replace(/_/g, ' ')}
                </span>
                <FraudBadge score={project.fraud_risk_score} />
              </div>
              <p className="text-sm text-slate-500 mt-1">
                👤 {project.owner_name} · {project.owner_email} · 📍 {project.location}, {project.country}
              </p>
            </div>
            <div className="text-slate-400 text-xl flex-shrink-0">{expanded ? '▲' : '▼'}</div>
          </div>

          {/* Quick metrics row */}
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-600">
            <span>🌿 NDVI: <strong>{project.ndvi_score?.toFixed(3) ?? '—'}</strong></span>
            <span>🌳 Biomass: <strong>{project.total_biomass?.toFixed(1) ?? '—'} t</strong></span>
            <span>💨 Carbon: <strong>{project.carbon_stock?.toFixed(1) ?? '—'} tCO₂e</strong></span>
            <span>🏷 Credits: <strong>{project.estimated_annual_credits?.toLocaleString() ?? '—'}/yr</strong></span>
            <span>📐 Area: <strong>{project.land_area_acres} acres</strong></span>
            <span>🛰 Satellite: <strong>{project.satellite_status}</strong></span>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t border-slate-100 p-6">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* LEFT: ML Evidence */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Satellite & ML Evidence</h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-slate-600 mb-1">
                      <span>NDVI Score (vegetation density)</span>
                      <span className="font-mono">{project.ndvi_score?.toFixed(3) ?? '—'}</span>
                    </div>
                    <NDVIBar value={project.ndvi_score} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Vegetation Health', value: project.vegetation_health?.toFixed(2), unit: '%' },
                      { label: 'Total Biomass',     value: project.total_biomass?.toFixed(2),     unit: 'tonnes' },
                      { label: 'Carbon Stock',      value: project.carbon_stock?.toFixed(2),      unit: 'tCO₂e' },
                      { label: 'CO₂ Equivalent',    value: project.co2e?.toFixed(2),              unit: 'tCO₂e' },
                    ].map(m => (
                      <div key={m.label} className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                        <p className="text-xs text-slate-500">{m.label}</p>
                        <p className="text-lg font-bold text-slate-800 mt-1">
                          {m.value ?? '—'} <span className="text-xs font-normal text-slate-400">{m.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-2">Fraud Risk Assessment</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-3 rounded-full ${(project.fraud_risk_score ?? 0) >= 70 ? 'bg-red-500' : (project.fraud_risk_score ?? 0) >= 40 ? 'bg-orange-400' : 'bg-green-500'}`}
                          style={{ width: `${project.fraud_risk_score ?? 0}%` }}
                        />
                      </div>
                      <span className="font-bold text-sm">{project.fraud_risk_score?.toFixed(0) ?? 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Previous notes */}
                {project.verification_notes && (
                  <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Previous Notes</p>
                    <p className="text-sm text-blue-900">{project.verification_notes}</p>
                  </div>
                )}
              </div>

              {/* RIGHT: Land Documents */}
              <div>
                <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Land Ownership Documents</h4>
                {project.land_docs.length === 0 ? (
                  <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-700 text-sm">
                    No land documents uploaded yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.land_docs.map(doc => (
                      <div
                        key={doc.id}
                        className={`rounded-xl border p-4 flex items-center justify-between ${
                          doc.verification_status === 'approved'
                            ? 'border-green-200 bg-green-50'
                            : doc.verification_status === 'rejected'
                            ? 'border-red-200 bg-red-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800 text-sm capitalize">
                            {doc.document_type.replace(/_/g, ' ')}
                          </p>
                          <p className={`text-xs mt-0.5 font-medium ${
                            doc.verification_status === 'approved' ? 'text-green-600' :
                            doc.verification_status === 'rejected' ? 'text-red-600' : 'text-slate-500'
                          }`}>
                            {doc.verification_status === 'approved' ? '✓ Approved' :
                             doc.verification_status === 'rejected' ? '✕ Rejected' : '⏳ Pending'}
                          </p>
                        </div>
                        <button
                          onClick={() => setDocModal({
                            url: getDocumentViewUrl(doc.document_url),
                            title: doc.document_type.replace(/_/g, ' ').toUpperCase(),
                          })}
                          className="rounded-full bg-slate-900 text-white px-4 py-1.5 text-xs font-semibold hover:bg-slate-700 transition"
                        >
                          View Doc
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* DECISION PANEL */}
                <div className="mt-6">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Auditor Decision</h4>

                  <div className="space-y-3">
                    {/* Audit Notes */}
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Enter your verification notes, findings, or rejection reason…"
                      rows={3}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-green-400 resize-none"
                    />

                    {/* Risk Score Slider */}
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Risk Score Override</span>
                        <span className="font-bold">{Math.round(riskScore)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={riskScore}
                        onChange={e => setRiskScore(Number(e.target.value))}
                        className="w-full accent-green-600"
                      />
                    </div>

                    {localMsg && (
                      <p className={`text-sm font-medium ${localMsg.toLowerCase().includes('fail') || localMsg.toLowerCase().includes('error') ? 'text-red-600' : 'text-green-700'}`}>
                        {localMsg}
                      </p>
                    )}

                    {/* Action Buttons */}
                    {action ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSubmit}
                          disabled={processing}
                          className={`flex-1 rounded-xl py-3 font-bold text-white transition disabled:opacity-60 ${
                            action === 'approve' ? 'bg-green-700 hover:bg-green-800' :
                            action === 'reject'  ? 'bg-red-600 hover:bg-red-700' :
                            'bg-orange-600 hover:bg-orange-700'
                          }`}
                        >
                          {processing ? 'Submitting…' :
                           action === 'approve' ? '✓ Confirm Approval' :
                           action === 'reject'  ? '✕ Confirm Rejection' :
                           '🚨 Confirm Fraud Flag'}
                        </button>
                        <button
                          onClick={() => { setAction(null); setLocalMsg(''); }}
                          className="rounded-xl border border-slate-200 px-4 py-3 text-sm hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => setAction('approve')}
                          className="rounded-xl bg-green-700 text-white py-3 text-sm font-bold hover:bg-green-800 transition"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => setAction('reject')}
                          className="rounded-xl bg-red-600 text-white py-3 text-sm font-bold hover:bg-red-700 transition"
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => setAction('fraud')}
                          className="rounded-xl bg-orange-500 text-white py-3 text-sm font-bold hover:bg-orange-600 transition"
                        >
                          🚨 Flag
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AuditorVerificationsPage() {
  const { user, loading: authLoading } = useAuthGuard('auditor');
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPendingProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading project compliance queue…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Project Compliance Review</h1>
              <p className="text-slate-600">
                Projects that have passed land verification and satellite processing. Review ML evidence, biomass data, and land documents.
              </p>
            </div>
            <span className="rounded-full bg-green-100 text-green-800 px-5 py-2 font-bold text-sm">
              {projects.length} project{projects.length !== 1 ? 's' : ''} to review
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 font-medium">{error}</div>
        )}

        {projects.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 p-20 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">No Projects Awaiting Review</h2>
            <p className="text-slate-500">All project compliance reviews are complete. New projects will appear here after land verification.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map(project => (
              <ProjectCard
                key={project.project_id}
                project={project}
                onAction={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
