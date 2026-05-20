'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// DashboardShell is now provided by the global layout
import {
  fetchAdminDashboard,
  fetchFraudReports,
  DashboardMetrics,
} from '@/services/adminService';

import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuthGuard('admin');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [fraudCount, setFraudCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [dashboard, fraud] = await Promise.all([
          fetchAdminDashboard(),
          fetchFraudReports(),
        ]);
        if (!cancelled) {
          setMetrics(dashboard);
          setFraudCount(fraud.length);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Failed to load admin metrics.'
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      {error && (
        <p className="mb-6 text-red-600 text-sm">{error}</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total Users</p>
          <h3 className="text-4xl font-bold mt-3">
            {metrics?.total_users ?? '—'}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Platform Revenue</p>
          <h3 className="text-4xl font-bold mt-3">
            ₹{metrics?.total_revenue_inr?.toLocaleString() ?? '—'}
          </h3>
        </div>

          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">NGOs / NCOs</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-900">{metrics?.active_ngos ?? '—'}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 text-xl">
              🤝
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 font-medium">Auditors</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-900">{metrics?.active_auditors ?? '—'}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 text-xl">
              📋
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex items-center justify-between border-l-4 border-l-yellow-500">
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Approvals</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-900">{metrics?.pending_verifications ?? '—'}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 text-xl">
              ⏳
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm flex items-center justify-between border-l-4 border-l-red-500">
            <div>
              <p className="text-sm text-slate-500 font-medium">Rejected Projects</p>
              <h3 className="text-3xl font-bold mt-2 text-slate-900">{metrics?.rejected_projects ?? '—'}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 text-xl">
              ❌
            </div>
          </div>

          <div className="rounded-3xl bg-red-50 p-8 border border-red-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Active Fraud Alerts</p>
              <h3 className="text-3xl font-bold mt-2 text-red-800">{fraudCount}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xl animate-pulse">
              🚨
            </div>
          </div>
        </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-12">
        <div className="lg:col-span-2 rounded-[2rem] bg-white p-10 border border-slate-200 shadow-sm">
          <h2 className="text-3xl font-bold mb-6">Platform Governance</h2>
          <p className="text-slate-600 mb-8">
            Manage users, pricing systems, escrow infrastructure, marketplace
            governance, and enterprise growth.
          </p>
          <div className="flex gap-4">
            <Link
              href="/dashboard/admin/projects"
              className="inline-block rounded-full bg-green-700 px-8 py-4 text-white font-semibold hover:bg-green-800 transition"
            >
              Open Admin Controls
            </Link>
            <Link
              href="/dashboard/admin/users"
              className="inline-block rounded-full border border-green-700 text-green-700 px-8 py-4 font-semibold hover:bg-green-50 transition"
            >
              Manage Users
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-10 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Operations Hub</h2>
          <ul className="space-y-4 text-slate-600">
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span>Verified Projects</span>
              <span className="font-semibold text-slate-900">{metrics?.verified_projects ?? '—'}</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span>Total Credits Sold</span>
              <span className="font-semibold text-slate-900">{metrics?.total_credits_sold?.toLocaleString() ?? '—'}</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span>Satellite Verified</span>
              <span className="font-semibold text-slate-900">{metrics?.satellite_verified ?? '—'}</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span>Total Carbon Stock</span>
              <span className="font-semibold text-slate-900">{metrics?.total_carbon_stock?.toLocaleString() ?? '—'} tCO₂e</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span>Avg NDVI Score</span>
              <span className="font-semibold text-slate-900">{metrics?.avg_ndvi?.toFixed(2) ?? '—'}</span>
            </li>
            <li className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span>Active Companies</span>
              <span className="font-semibold text-slate-900">{metrics?.active_companies ?? '—'}</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Active Farmers</span>
              <span className="font-semibold text-slate-900">{metrics?.active_farmers ?? '—'}</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
