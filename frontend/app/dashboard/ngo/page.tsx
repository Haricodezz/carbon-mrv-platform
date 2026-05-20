'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Link from 'next/link';
// DashboardShell is now provided by the global layout
import { getProjects, Project } from '@/services/projectService';
import { fetchWalletInfo, WalletResponse } from '@/services/walletService';

export default function NGODashboardPage() {
  const { user, loading } = useAuthGuard('ngo');
  const [projects, setProjects] = useState<Project[]>([]);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'ngo' || user.role === 'nco')) {
      Promise.all([
        getProjects().catch(() => []),
        fetchWalletInfo().catch(() => null)
      ])
      .then(([projData, walletData]) => {
        setProjects(projData);
        setWallet(walletData);
      })
      .finally(() => setDataLoading(false));
    }
  }, [user]);

  if (loading || !user || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const activeCredits = projects.reduce((sum, p) => sum + (p.total_credits_generated || 0), 0);

  return (
    <>

      {/* Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Active Projects</p>
          <h3 className="text-4xl font-bold mt-3">{projects.length}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Generated Credits</p>
          <h3 className="text-4xl font-bold mt-3">{activeCredits.toLocaleString()}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Community Revenue</p>
          <h3 className="text-4xl font-bold mt-3">₹{(activeCredits * 1500).toLocaleString()}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Wallet Balance</p>
          <h3 className="text-4xl font-bold mt-3">₹{wallet?.fiat_balance?.toLocaleString() || 0}</h3>
        </div>

      </div>

      {/* Main */}
      <div className="grid lg:grid-cols-3 gap-8 mt-12">

        {/* Projects */}
        <div className="lg:col-span-2 rounded-[2rem] bg-white p-10 border border-slate-200 shadow-sm">
          <h2 className="text-3xl font-bold mb-6">
            Community Carbon Projects
          </h2>

          <p className="text-slate-600 mb-8">
            Manage NGO-led reforestation, land rehabilitation, and carbon
            generation initiatives.
          </p>

          <Link
            href="/dashboard/projects"
            className="inline-block rounded-full bg-green-700 px-8 py-4 text-white font-semibold hover:bg-green-800 transition"
          >
            Manage Projects
          </Link>
        </div>

        {/* Verification */}
        <div className="rounded-[2rem] bg-white p-10 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">
            Audit Status
          </h2>

          <p className="text-slate-600">
            No NGO projects under audit yet.
          </p>
        </div>

      </div>

    </>
  );
}