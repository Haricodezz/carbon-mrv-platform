'use client';

import { useEffect, useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import Link from 'next/link';
// DashboardShell is now provided by the global layout
import { fetchWalletInfo, WalletResponse } from '@/services/walletService';

export default function CompanyDashboardPage() {
  const { user, loading } = useAuthGuard('company');
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'company') {
      fetchWalletInfo()
        .then(setWallet)
        .catch(console.error)
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

  return (
    <>

      {/* Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Purchased Credits</p>
          <h3 className="text-4xl font-bold mt-3">{wallet?.total_purchased || 0}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Retired Credits</p>
          <h3 className="text-4xl font-bold mt-3">{wallet?.total_retired || 0}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">ESG Offset Value</p>
          <h3 className="text-4xl font-bold mt-3">₹{(wallet?.total_retired || 0) * 1500}</h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Wallet Balance</p>
          <h3 className="text-4xl font-bold mt-3">₹{wallet?.fiat_balance?.toLocaleString() || 0}</h3>
        </div>

      </div>

      {/* Main */}
      <div className="grid lg:grid-cols-3 gap-8 mt-12">

        {/* Marketplace */}
        <div className="lg:col-span-2 rounded-[2rem] bg-white p-10 border border-slate-200 shadow-sm">
          <h2 className="text-3xl font-bold mb-6">
            Carbon Credit Marketplace
          </h2>

          <p className="text-slate-600 mb-8">
            Purchase verified carbon credits, offset emissions, and manage
            enterprise sustainability portfolios.
          </p>

          <Link
            href="/marketplace"
            className="inline-block rounded-full bg-green-700 px-8 py-4 text-white font-semibold hover:bg-green-800 transition"
          >
            Explore Marketplace
          </Link>
        </div>

        {/* Certificates */}
        <div className="rounded-[2rem] bg-white p-10 border border-slate-200 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">
            Retirement Certificates
          </h2>

          <p className="text-slate-600">
            No certificates retired yet.
          </p>
        </div>

      </div>

    </>
  );
}