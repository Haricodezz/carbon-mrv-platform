'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { getProjects, Project } from '@/services/projectService';
import { adminIssueCredits } from '@/services/landVerificationService';

export default function AdminCreditIssuancePage() {
  const { user, loading: authLoading } = useAuthGuard('admin');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadProjects = async () => {
    try {
      const data = await getProjects();
      const issuanceQueue = (Array.isArray(data) ? data : []).filter(
        p => p.lifecycle_status === 'approved_pending_credit_issue'
      );
      setProjects(issuanceQueue);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadProjects();
  }, [user]);

  const handleIssue = async (projectId: string, projectName: string) => {
    if (!confirm(`Confirm credit issuance for "${projectName}"? This will mint tokens and activate the marketplace listing.`)) return;
    setIssuing(projectId);
    setMessage('');
    setError('');
    try {
      const result = await adminIssueCredits(projectId);
      setMessage(`✓ Credits issued successfully for "${projectName}". Project is now live on the marketplace.`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err: any) {
      setError(err.message || 'Credit issuance failed.');
    } finally {
      setIssuing(null);
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading issuance queue…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-5xl font-bold text-slate-900 mb-3">Credit Issuance Control</h1>
          <p className="text-slate-600 text-lg">
            Projects listed here have been auditor-approved and are awaiting final admin credit issuance.
            Issuing credits will mint tokens on the blockchain and activate the marketplace listing.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-100 text-lime-800 px-4 py-2 text-sm font-bold">
              {projects.length} project{projects.length !== 1 ? 's' : ''} awaiting issuance
            </span>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-5 text-green-700 font-medium">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-5 text-red-700 font-medium">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-20 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Issuance Queue Empty</h2>
            <p className="text-slate-500">No projects are currently awaiting credit issuance.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map(project => (
              <div
                key={project.id}
                className="rounded-3xl bg-white shadow-lg border border-slate-200 p-8"
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Project Overview */}
                  <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-bold text-slate-900">{project.project_name}</h2>
                      <span className="rounded-full bg-lime-100 text-lime-700 px-3 py-1 text-xs font-bold">
                        Auditor Approved
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
                      <div><strong>Location:</strong> {project.location}, {project.country}</div>
                      <div><strong>Type:</strong> {project.project_type}</div>
                      <div><strong>Land Area:</strong> {project.land_area_acres} acres</div>
                      <div><strong>Price/Credit:</strong> ₹{project.price_per_credit}</div>
                    </div>

                    {/* ML & Satellite Evidence */}
                    <div className="mt-6 grid md:grid-cols-4 gap-3">
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">NDVI Score</p>
                        <p className="text-xl font-bold text-green-700 mt-1">{project.ndvi_score?.toFixed(3) || '—'}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Carbon Stock</p>
                        <p className="text-xl font-bold text-slate-800 mt-1">{project.carbon_stock?.toFixed(1) || '—'} tCO₂e</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Credits to Issue</p>
                        <p className="text-xl font-bold text-blue-700 mt-1">{(project.total_credits_generated || project.estimated_credits || 0).toLocaleString()}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <p className="text-xs text-slate-500 font-medium">Fraud Risk</p>
                        <p className={`text-xl font-bold mt-1 ${(project.fraud_risk_score || 0) > 50 ? 'text-red-600' : 'text-green-600'}`}>
                          {project.fraud_risk_score?.toFixed(0) || 0}%
                        </p>
                      </div>
                    </div>

                    {project.verification_notes && (
                      <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                        <strong>Auditor Notes:</strong> {project.verification_notes}
                      </div>
                    )}
                  </div>

                  {/* Issuance Action */}
                  <div className="flex flex-col gap-4 justify-center">
                    <div className="rounded-2xl bg-lime-50 border border-lime-200 p-5 text-center">
                      <p className="text-3xl font-black text-lime-800">
                        {(project.total_credits_generated || project.estimated_credits || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-lime-700 font-medium mt-1">Carbon Credits Ready</p>
                      <p className="text-xs text-lime-600 mt-1">
                        Est. Value: ₹{((project.total_credits_generated || project.estimated_credits || 0) * (project.price_per_credit || 0)).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleIssue(project.id, project.project_name)}
                      disabled={issuing === project.id}
                      className="w-full rounded-2xl bg-emerald-700 py-4 text-white font-bold text-lg hover:bg-emerald-800 transition disabled:opacity-60"
                    >
                      {issuing === project.id ? 'Issuing Credits…' : '✦ Approve & Issue Credits'}
                    </button>
                    <p className="text-xs text-center text-slate-400">
                      This mints tokens, activates marketplace listing, and logs the event to the audit ledger.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
