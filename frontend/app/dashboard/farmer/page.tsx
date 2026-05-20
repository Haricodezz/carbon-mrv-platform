'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Link from 'next/link';
import { getProjects, Project } from '@/services/projectService';
import { getMyKYCStatus, KYCStatus } from '@/services/kycService';

const LIFECYCLE_LABELS: Record<string, { label: string; color: string; step: number }> = {
  draft:                         { label: 'Draft',                      color: 'bg-slate-100 text-slate-600',   step: 0 },
  submitted:                     { label: 'Submitted',                   color: 'bg-blue-100 text-blue-700',     step: 1 },
  awaiting_land_verification:    { label: 'Awaiting Land Verification',  color: 'bg-yellow-100 text-yellow-700', step: 2 },
  land_verified:                 { label: 'Land Verified ✓',             color: 'bg-teal-100 text-teal-700',     step: 3 },
  ml_processing:                 { label: 'ML Processing…',              color: 'bg-purple-100 text-purple-700', step: 4 },
  satellite_verified:            { label: 'Satellite Verified ✓',        color: 'bg-cyan-100 text-cyan-700',     step: 5 },
  auditor_review:                { label: 'Auditor Review',              color: 'bg-orange-100 text-orange-700', step: 6 },
  approved_pending_credit_issue: { label: 'Approved — Awaiting Issuance', color: 'bg-lime-100 text-lime-700',   step: 7 },
  credits_issued:                { label: 'Credits Issued ✓',            color: 'bg-green-100 text-green-700',  step: 8 },
  marketplace_active:            { label: 'Live on Marketplace 🟢',      color: 'bg-green-200 text-green-800',  step: 9 },
  rejected:                      { label: 'Rejected',                    color: 'bg-red-100 text-red-700',      step: -1 },
  suspended:                     { label: 'Suspended',                   color: 'bg-red-200 text-red-800',      step: -1 },
};

const KYC_DOCUMENTS = [
  { type: 'govt_id',           label: 'Government ID',                 required: true },
  { type: 'selfie',            label: 'Selfie / Profile Photo',        required: true },
  { type: 'address_proof',     label: 'Address Proof',                 required: true },
  { type: 'org_registration',  label: 'Organization Registration',     required: false },
];

export default function FarmerDashboardPage() {
  const { user, loading } = useAuthGuard('farmer');
  const [projects, setProjects] = useState<Project[]>([]);
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([getProjects(), getMyKYCStatus()])
        .then(([proj, kyc]) => {
          setProjects(Array.isArray(proj) ? proj : []);
          setKycStatus(kyc);
        })
        .catch(console.error)
        .finally(() => setDataLoading(false));
    }
  }, [user]);

  if (loading || !user || dataLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading your dashboard…</div>;
  }

  const activeCredits = projects.reduce((sum, p) => sum + (p.total_credits_generated || 0), 0);
  const marketplaceProjects = projects.filter(p => p.lifecycle_status === 'marketplace_active' || p.status === 'marketplace');
  const pendingProjects = projects.filter(p => !['marketplace_active', 'rejected', 'suspended'].includes(p.lifecycle_status || p.status));
  const marketplaceEarnings = marketplaceProjects.reduce((sum, p) => sum + ((p.credits_sold || 0) * (p.price_per_credit || 0)), 0);

  const kycBadge = () => {
    if (!kycStatus) return { label: 'Unknown', color: 'bg-slate-100 text-slate-600' };
    switch (kycStatus.kyc_status) {
      case 'approved': return { label: 'KYC Approved ✓', color: 'bg-green-100 text-green-700' };
      case 'pending':  return { label: 'KYC Pending Review', color: 'bg-yellow-100 text-yellow-700' };
      case 'rejected': return { label: 'KYC Rejected — Resubmit', color: 'bg-red-100 text-red-700' };
      default:         return { label: 'KYC Not Submitted', color: 'bg-slate-100 text-slate-600' };
    }
  };

  const badge = kycBadge();

  return (
    <>
      {/* HEADER METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Registered Projects</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{projects.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total Credits Generated</p>
          <p className="text-3xl font-bold text-green-700 mt-2">{activeCredits.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Marketplace Earnings</p>
          <p className="text-3xl font-bold text-purple-700 mt-2">₹{marketplaceEarnings.toLocaleString()}</p>
        </div>
        <div className={`rounded-2xl p-6 shadow-sm border ${badge.color.includes('green') ? 'border-green-200 bg-green-50' : badge.color.includes('yellow') ? 'border-yellow-200 bg-yellow-50' : badge.color.includes('red') ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-sm font-medium text-slate-600">KYC Status</p>
          <span className={`inline-block mt-2 rounded-full px-3 py-1 text-sm font-bold ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* KYC SECTION */}
        {kycStatus?.kyc_status !== 'approved' && (
          <div className="lg:col-span-3 rounded-[2rem] bg-white border border-yellow-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">KYC Verification Required</h2>
                <p className="text-slate-500 mt-1">Upload documents to unlock credit generation and marketplace access.</p>
              </div>
              <Link
                href="/dashboard/kyc"
                className="rounded-full bg-green-700 text-white px-6 py-3 font-semibold hover:bg-green-800 transition text-sm"
              >
                Complete KYC →
              </Link>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {KYC_DOCUMENTS.map(doc => {
                const uploaded = kycStatus?.documents.find(d => d.document_type === doc.type);
                return (
                  <div key={doc.type} className={`rounded-xl p-4 border ${uploaded?.status === 'approved' ? 'border-green-200 bg-green-50' : uploaded ? 'border-yellow-200 bg-yellow-50' : 'border-slate-200 bg-slate-50'}`}>
                    <p className="text-sm font-semibold text-slate-700">{doc.label}</p>
                    <p className={`text-xs mt-1 font-medium ${uploaded?.status === 'approved' ? 'text-green-600' : uploaded ? 'text-yellow-600' : 'text-slate-400'}`}>
                      {uploaded?.status === 'approved' ? '✓ Approved' : uploaded ? `⏳ ${uploaded.status}` : doc.required ? '⚠ Required' : 'Optional'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROJECTS LIFECYCLE TRACKER */}
        <div className="lg:col-span-2 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Project Governance Pipeline</h2>
            <Link
              href="/dashboard/projects/create"
              className="rounded-full bg-green-700 text-white px-5 py-2 text-sm font-semibold hover:bg-green-800 transition"
            >
              + New Project
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg">No projects yet.</p>
              <p className="text-sm mt-2">Submit your first land project to begin generating carbon credits.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => {
                const lifecycle = LIFECYCLE_LABELS[project.lifecycle_status || project.status] || LIFECYCLE_LABELS['draft'];
                return (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className="block rounded-2xl border border-slate-200 p-5 hover:border-green-300 hover:shadow-sm transition"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{project.project_name}</p>
                        <p className="text-sm text-slate-500 mt-1">{project.location}, {project.country}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${lifecycle.color}`}>
                        {lifecycle.label}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-4 text-xs text-slate-500">
                      <span>🌿 {project.total_credits_generated?.toLocaleString() || 0} credits</span>
                      <span>📡 Satellite: {project.satellite_status}</span>
                      <span>🏷️ ₹{project.price_per_credit}/credit</span>
                    </div>
                    {/* Lifecycle progress bar */}
                    {lifecycle.step >= 0 && (
                      <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${(lifecycle.step / 9) * 100}%` }}
                        />
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/projects/create" className="block rounded-xl bg-green-700 text-white text-center py-3 font-semibold hover:bg-green-800 transition">
              Submit New Project
            </Link>
            <Link href="/dashboard/kyc" className="block rounded-xl border border-green-700 text-green-700 text-center py-3 font-semibold hover:bg-green-50 transition">
              Manage KYC Documents
            </Link>
            <Link href="/dashboard/farmer/projects" className="block rounded-xl border border-slate-200 text-slate-700 text-center py-3 font-semibold hover:bg-slate-50 transition">
              View All Projects
            </Link>
            <Link href="/marketplace" className="block rounded-xl border border-slate-200 text-slate-700 text-center py-3 font-semibold hover:bg-slate-50 transition">
              Browse Marketplace
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Governance Pipeline</h3>
            <ol className="space-y-2 text-xs text-slate-500">
              {[
                'Submit Project',
                'Upload Land Proof',
                'Auditor Land Review',
                'Satellite Verification',
                'ML Carbon Analysis',
                'Auditor Approval',
                'Admin Credit Issuance',
                'Marketplace Active',
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </>
  );
}