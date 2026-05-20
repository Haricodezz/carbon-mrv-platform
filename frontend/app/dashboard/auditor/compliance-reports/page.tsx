'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { fetchAuditLogs, AuditLogResponse } from '@/services/auditorService';
import { getProjects, Project } from '@/services/projectService';

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  approved:        { label: 'Project Approved',    color: 'bg-green-100 text-green-700',   icon: '✓' },
  rejected:        { label: 'Project Rejected',    color: 'bg-red-100 text-red-700',       icon: '✕' },
  kyc_approve:     { label: 'KYC Approved',        color: 'bg-teal-100 text-teal-700',     icon: '🪪' },
  kyc_reject:      { label: 'KYC Rejected',        color: 'bg-orange-100 text-orange-700', icon: '🪪' },
  land_approve:    { label: 'Land Verified',        color: 'bg-blue-100 text-blue-700',     icon: '🗺️' },
  land_reject:     { label: 'Land Rejected',        color: 'bg-red-100 text-red-700',       icon: '🗺️' },
  fraud_flag:      { label: 'Fraud Flagged',        color: 'bg-red-200 text-red-800',       icon: '🚨' },
  credit_issuance: { label: 'Credits Issued',       color: 'bg-purple-100 text-purple-700', icon: '🪙' },
  verified:        { label: 'Verified',             color: 'bg-green-100 text-green-700',   icon: '✓' },
};

const TARGET_LABELS: Record<string, string> = {
  project: '📋 Project',
  kyc:     '🪪 KYC',
  land:    '🗺️ Land',
  credit:  '🪙 Credit',
};

type FilterType = 'all' | 'project' | 'kyc' | 'land' | 'fraud';

export default function AuditorComplianceReportsPage() {
  const { user, loading: authLoading } = useAuthGuard('auditor');
  const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    Promise.all([fetchAuditLogs(), getProjects()])
      .then(([logs, proj]) => {
        setAuditLogs(Array.isArray(logs) ? logs : []);
        setProjects(Array.isArray(proj) ? proj : []);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const projectMap = useMemo(() => {
    const map: Record<string, Project> = {};
    projects.forEach(p => { map[p.id] = p; });
    return map;
  }, [projects]);

  const filteredLogs = useMemo(() => {
    let logs = auditLogs;

    if (filter === 'project') logs = logs.filter(l => l.target_type === 'project');
    else if (filter === 'kyc')  logs = logs.filter(l => l.target_type === 'kyc' || l.action_type.startsWith('kyc'));
    else if (filter === 'land') logs = logs.filter(l => l.target_type === 'land' || l.action_type.startsWith('land'));
    else if (filter === 'fraud') logs = logs.filter(l => l.action_type === 'fraud_flag' || (l.risk_score > 50));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(l =>
        l.notes?.toLowerCase().includes(q) ||
        l.action_type.toLowerCase().includes(q) ||
        l.target_type.toLowerCase().includes(q)
      );
    }

    return logs;
  }, [auditLogs, filter, searchQuery]);

  // Stats
  const totalApproved = auditLogs.filter(l => l.action_type === 'approved').length;
  const totalRejected = auditLogs.filter(l => l.action_type === 'rejected').length;
  const totalFraud    = auditLogs.filter(l => l.action_type === 'fraud_flag').length;
  const totalKYC      = auditLogs.filter(l => l.action_type.startsWith('kyc')).length;

  // Compliant projects (approved, not flagged)
  const compliantProjects = projects.filter(p => p.audit_status === 'approved' && (p.fraud_risk_score ?? 0) <= 50);
  const flaggedProjects   = projects.filter(p => (p.fraud_risk_score ?? 0) > 50);

  const exportCSV = () => {
    const header = ['Date', 'Action', 'Target Type', 'Notes', 'Risk Score'].join(',');
    const rows = filteredLogs.map(l =>
      [
        l.created_at ? new Date(l.created_at).toLocaleDateString() : '',
        l.action_type,
        l.target_type,
        `"${(l.notes || '').replace(/"/g, '""')}"`,
        l.risk_score,
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading compliance records…</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Compliance & Audit Reports</h1>
            <p className="text-slate-600">
              Complete audit trail of all verification decisions, KYC approvals, land validations, and fraud flags.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="rounded-full border border-slate-300 bg-white text-slate-700 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 transition flex items-center gap-2"
          >
            ↓ Export CSV
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Projects Approved', value: totalApproved, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
            { label: 'Projects Rejected', value: totalRejected, color: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
            { label: 'Fraud Flags',       value: totalFraud,    color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
            { label: 'KYC Decisions',     value: totalKYC,      color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
          ].map(card => (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.bg}`}>
              <p className="text-xs text-slate-500 font-medium">{card.label}</p>
              <p className={`text-4xl font-bold mt-2 ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Compliant Projects Summary */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">✅ Compliant Projects ({compliantProjects.length})</h3>
            {compliantProjects.length === 0 ? (
              <p className="text-slate-400 text-sm">No approved compliant projects yet.</p>
            ) : (
              <div className="space-y-2">
                {compliantProjects.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-green-50 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.project_name}</p>
                      <p className="text-xs text-slate-500">{p.location}, {p.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-700">{(p.total_credits_generated || p.estimated_credits || 0).toLocaleString()} credits</p>
                      <p className="text-xs text-slate-400">Risk: {(p.fraud_risk_score ?? 0).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
                {compliantProjects.length > 5 && (
                  <p className="text-xs text-slate-400 text-center pt-1">+{compliantProjects.length - 5} more</p>
                )}
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">🚨 High-Risk / Flagged Projects ({flaggedProjects.length})</h3>
            {flaggedProjects.length === 0 ? (
              <p className="text-slate-400 text-sm">No high-risk projects detected.</p>
            ) : (
              <div className="space-y-2">
                {flaggedProjects.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{p.project_name}</p>
                      <p className="text-xs text-slate-500">{p.location}, {p.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-red-600">Risk: {(p.fraud_risk_score ?? 0).toFixed(0)}%</p>
                      <span className={`text-xs font-medium capitalize ${p.audit_status === 'approved' ? 'text-green-600' : p.audit_status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                        {p.audit_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-4 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900 flex-1">Audit Log ({filteredLogs.length} entries)</h2>

            {/* Search */}
            <input
              type="text"
              placeholder="Search by notes, action, type…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm w-56 focus:outline-none focus:border-green-400"
            />

            {/* Filters */}
            <div className="flex gap-2">
              {(['all', 'project', 'kyc', 'land', 'fraud'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition capitalize ${
                    filter === f ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs text-slate-500 font-semibold uppercase tracking-wider">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      <p className="text-3xl mb-3">📋</p>
                      <p>No audit log entries match your filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => {
                    const cfg = ACTION_CONFIG[log.action_type] || {
                      label: log.action_type,
                      color: 'bg-slate-100 text-slate-600',
                      icon: '•',
                    };
                    const targetLabel = TARGET_LABELS[log.target_type] || log.target_type;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${cfg.color}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">{targetLabel}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 max-w-xs">
                          <span className="line-clamp-2">{log.notes || <span className="text-slate-400">—</span>}</span>
                        </td>
                        <td className="px-6 py-4">
                          {log.risk_score > 0 ? (
                            <span className={`font-bold text-sm ${log.risk_score >= 70 ? 'text-red-600' : log.risk_score >= 40 ? 'text-orange-500' : 'text-slate-600'}`}>
                              {log.risk_score.toFixed(0)}%
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
