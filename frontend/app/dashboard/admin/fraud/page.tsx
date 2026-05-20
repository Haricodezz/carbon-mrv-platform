'use client';

import { useEffect, useState } from 'react';
import { fetchFraudReports, FraudReportResponse } from '@/services/adminService';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Link from 'next/link';

export default function FraudMonitoringPage() {
  const { user, loading: authLoading } = useAuthGuard('admin');
  const [reports, setReports] = useState<FraudReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchFraudReports()
        .then((data) => setReports(Array.isArray(data) ? data : []))
        .catch((err) => setError(err.message || 'Failed to load fraud reports.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading fraud reports...</div>;
  }

  const highRiskCount = reports.filter(r => r.fraud_risk_score > 80).length;
  const mediumRiskCount = reports.filter(r => r.fraud_risk_score > 50 && r.fraud_risk_score <= 80).length;

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Fraud Monitoring Center
          </h1>

          <p className="text-slate-600 text-lg">
            Investigate suspicious projects, review abnormal carbon estimates, and escalate verification conflicts.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Risk Overview */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="rounded-3xl bg-white p-8 shadow-xl border-l-4 border-red-600">
            <h2 className="text-sm text-slate-500 mb-2 font-semibold uppercase tracking-wider">Critical Risk (&gt;80%)</h2>
            <p className="text-4xl font-bold text-red-600">{highRiskCount}</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl border-l-4 border-yellow-500">
            <h2 className="text-sm text-slate-500 mb-2 font-semibold uppercase tracking-wider">Medium Risk (50-80%)</h2>
            <p className="text-4xl font-bold text-yellow-600">{mediumRiskCount}</p>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl border-l-4 border-slate-300">
            <h2 className="text-sm text-slate-500 mb-2 font-semibold uppercase tracking-wider">Total Flagged</h2>
            <p className="text-4xl font-bold text-slate-800">{reports.length}</p>
          </div>
        </div>

        {/* Reports Table */}
        <div className="space-y-6">
          {reports.length === 0 ? (
            <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-10 text-center">
              <p className="text-slate-500 text-lg">No fraud reports found at this time.</p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.project_id}
                className="rounded-3xl bg-white shadow-lg border border-slate-200 p-8 flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {report.project_name}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      report.fraud_risk_score > 80 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {report.fraud_risk_score}% RISK
                    </span>
                  </div>

                  <p className="text-slate-600">
                    <strong>Status:</strong> <span className="capitalize">{report.status}</span>
                  </p>
                  
                  {report.verification_notes && (
                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-700">
                      <strong>AI/Auditor Notes:</strong> {report.verification_notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                  <Link
                    href={`/dashboard/projects/${report.project_id}`}
                    className="w-full text-center rounded-2xl bg-slate-900 py-3 text-white font-semibold hover:bg-slate-800 transition"
                  >
                    Investigate Project
                  </Link>
                  <button className="w-full rounded-2xl bg-red-50 text-red-600 border border-red-200 py-3 font-semibold hover:bg-red-100 transition">
                    Freeze Account
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
