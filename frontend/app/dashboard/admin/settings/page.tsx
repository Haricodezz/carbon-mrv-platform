'use client';

import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAuthGuard('admin');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading settings...</div>;
  }

  const handleSave = () => {
    setSaving(true);
    setMessage('');
    setTimeout(() => {
      setSaving(false);
      setMessage('Platform configurations saved successfully.');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        <div className="mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Platform Configuration
            </h1>
            <p className="text-slate-600 text-lg">
              Manage enterprise fees, ML thresholds, and blockchain connectivity.
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition disabled:opacity-70"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {message && (
          <div className="mb-8 rounded-2xl bg-green-50 border border-green-200 p-4 text-green-700 font-medium">
            {message}
          </div>
        )}

        <div className="space-y-8">
          
          {/* Economy Settings */}
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Marketplace & Economy</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Platform Fee (%)</label>
                <input type="number" defaultValue={2.5} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                <p className="text-xs text-slate-500 mt-2">Percentage fee taken from marketplace transactions.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Minimum Credit Price (₹)</label>
                <input type="number" defaultValue={500} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
              </div>
            </div>
          </div>

          {/* ML & Fraud Settings */}
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">AI & Verification Thresholds</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Auto-Approval NDVI Threshold</label>
                <input type="number" defaultValue={0.65} step={0.05} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                <p className="text-xs text-slate-500 mt-2">Projects with NDVI above this score can bypass manual verification.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Critical Fraud Threshold (%)</label>
                <input type="number" defaultValue={80} className="w-full rounded-xl border border-slate-300 px-4 py-3" />
                <p className="text-xs text-slate-500 mt-2">Score at which projects are automatically frozen.</p>
              </div>
            </div>
          </div>

          {/* Blockchain Settings */}
          <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Blockchain & Escrow Infrastructure</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Treasury Wallet Address</label>
                <input type="text" defaultValue="0x8B...3A9f" className="w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 font-mono text-slate-500" readOnly />
                <p className="text-xs text-slate-500 mt-2">Cannot be changed here. Requires multi-sig approval.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Network RPC URL</label>
                <input type="text" defaultValue="https://polygon-mainnet.infura.io/v3/..." className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
