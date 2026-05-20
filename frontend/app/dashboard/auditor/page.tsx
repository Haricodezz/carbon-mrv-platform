'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { fetchAuditorMetrics, AuditorMetrics } from '@/services/auditorService';

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  approved:     { label: 'Approved',       color: 'bg-green-100 text-green-700' },
  rejected:     { label: 'Rejected',       color: 'bg-red-100 text-red-700' },
  kyc_approve:  { label: 'KYC Approved',   color: 'bg-teal-100 text-teal-700' },
  kyc_reject:   { label: 'KYC Rejected',   color: 'bg-orange-100 text-orange-700' },
  land_approve: { label: 'Land Approved',  color: 'bg-blue-100 text-blue-700' },
  land_reject:  { label: 'Land Rejected',  color: 'bg-red-100 text-red-700' },
  fraud_flag:   { label: 'Fraud Flagged',  color: 'bg-red-200 text-red-800' },
  credit_issuance: { label: 'Credits Issued', color: 'bg-purple-100 text-purple-700' },
};

export default function AuditorDashboardPage() {
  const { user, loading: authLoading } = useAuthGuard('auditor');
  const [metrics, setMetrics] = useState<AuditorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchAuditorMetrics()
      .then(setMetrics)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading compliance dashboard…</div>;
  }

  const m = metrics;

  return (
    <>
      {/* LIVE METRICS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Link href="/dashboard/auditor/verification-requests" className="block rounded-3xl bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition hover:border-yellow-300">
          <p className="text-sm text-slate-500 font-medium">Pending KYC Reviews</p>
          <h3 className="text-5xl font-bold mt-3 text-yellow-600">{m?.pending_kyc ?? 0}</h3>
          {(m?.pending_kyc ?? 0) > 0 && <p className="text-xs text-yellow-600 mt-2 font-medium">⚠ Action required</p>}
        </Link>

        <Link href="/dashboard/auditor/verification-requests" className="block rounded-3xl bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition hover:border-blue-300">
          <p className="text-sm text-slate-500 font-medium">Pending Land Proofs</p>
          <h3 className="text-5xl font-bold mt-3 text-blue-600">{m?.pending_land ?? 0}</h3>
          {(m?.pending_land ?? 0) > 0 && <p className="text-xs text-blue-600 mt-2 font-medium">⚠ Awaiting review</p>}
        </Link>

        <Link href="/dashboard/auditor/verifications" className="block rounded-3xl bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition hover:border-green-300">
          <p className="text-sm text-slate-500 font-medium">Projects to Audit</p>
          <h3 className="text-5xl font-bold mt-3 text-green-700">{m?.pending_projects ?? 0}</h3>
          {(m?.approved_projects ?? 0) > 0 && <p className="text-xs text-slate-500 mt-2">{m?.approved_projects} approved total</p>}
        </Link>

        <div className={`rounded-3xl p-8 border shadow-sm ${(m?.fraud_alerts ?? 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
          <p className="text-sm text-slate-500 font-medium">Fraud Alerts</p>
          <h3 className={`text-5xl font-bold mt-3 ${(m?.fraud_alerts ?? 0) > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {m?.fraud_alerts ?? 0}
          </h3>
          {(m?.fraud_alerts ?? 0) > 0 && <p className="text-xs text-red-600 mt-2 font-medium">🚨 High-risk projects</p>}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* QUICK ACTIONS */}
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-sm p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Verification Center</h2>
          <div className="space-y-3">
            <Link
              href="/dashboard/auditor/verification-requests"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-yellow-400 hover:bg-yellow-50 transition"
            >
              <div>
                <p className="font-semibold text-slate-900">KYC & Land Reviews</p>
                <p className="text-xs text-slate-500 mt-0.5">Identity and ownership documents</p>
              </div>
              {(m?.pending_kyc ?? 0) + (m?.pending_land ?? 0) > 0 && (
                <span className="rounded-full bg-red-500 text-white text-xs font-bold px-2 py-1">
                  {(m?.pending_kyc ?? 0) + (m?.pending_land ?? 0)}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/auditor/verifications"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-green-400 hover:bg-green-50 transition"
            >
              <div>
                <p className="font-semibold text-slate-900">Project Compliance Review</p>
                <p className="text-xs text-slate-500 mt-0.5">Satellite, ML, biomass evidence</p>
              </div>
              {(m?.pending_projects ?? 0) > 0 && (
                <span className="rounded-full bg-green-600 text-white text-xs font-bold px-2 py-1">
                  {m?.pending_projects}
                </span>
              )}
            </Link>

            <Link
              href="/dashboard/auditor/compliance-reports"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition"
            >
              <div>
                <p className="font-semibold text-slate-900">Compliance Reports</p>
                <p className="text-xs text-slate-500 mt-0.5">Audit trails and decisions</p>
              </div>
            </Link>

            <Link
              href="/dashboard/projects"
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-semibold text-slate-900">Field Reviews</p>
                <p className="text-xs text-slate-500 mt-0.5">Browse all projects</p>
              </div>
            </Link>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-xl bg-green-50 p-3">
                <p className="text-2xl font-bold text-green-700">{m?.approved_projects ?? 0}</p>
                <p className="text-xs text-green-600 mt-1">Approved</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-2xl font-bold text-red-600">{m?.rejected_projects ?? 0}</p>
                <p className="text-xs text-red-600 mt-1">Rejected</p>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="lg:col-span-2 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Audit Activity</h2>
            <Link href="/dashboard/auditor/compliance-reports" className="text-sm text-green-700 font-semibold hover:underline">
              View all logs →
            </Link>
          </div>

          {!m?.recent_reviews?.length ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No review activity yet. Start reviewing KYC and land documents.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {m.recent_reviews.map(review => {
                const badge = ACTION_LABELS[review.action_type] || { label: review.action_type, color: 'bg-slate-100 text-slate-600' };
                return (
                  <div key={review.id} className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold flex-shrink-0 ${badge.color}`}>
                      {badge.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{review.notes || 'No notes'}</p>
                      <p className="text-xs text-slate-400 mt-0.5 capitalize">{review.target_type}</p>
                    </div>
                    {review.risk_score > 0 && (
                      <span className={`text-xs font-bold flex-shrink-0 ${review.risk_score > 70 ? 'text-red-600' : 'text-orange-600'}`}>
                        Risk: {review.risk_score}%
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString() : '—'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-slate-100 rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">System Status</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-slate-600">
                {(m?.total_pending ?? 0) === 0
                  ? 'All queues clear — no pending reviews.'
                  : `${m?.total_pending} item${(m?.total_pending ?? 0) !== 1 ? 's' : ''} require attention across all queues.`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}