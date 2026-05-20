'use client';

import { useState } from 'react';
import { mintCarbonCredits } from '@/services/blockchainService';

export default function AdminMintDashboard() {
  const [recipientWallet, setRecipientWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [projectId, setProjectId] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleMintCredits() {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await mintCarbonCredits(
        recipientWallet,
        Number(amount),
        projectId
      );

      setMessage(
        `Successfully minted ${amount} CMRV credits to ${recipientWallet}`
      );

      setRecipientWallet('');
      setAmount('');
      setProjectId('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Minting failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Carbon Credit Issuance Center
          </h1>

          <p className="text-slate-600 text-lg">
            Mint blockchain-verified carbon credits for approved
            environmental projects.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-700 font-medium">
            {message}
          </div>
        )}

        <div className="rounded-3xl bg-white shadow-xl border border-slate-200 p-10">

          <div className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Recipient Wallet Address
              </label>

              <input
                type="text"
                value={recipientWallet}
                onChange={(e) =>
                  setRecipientWallet(e.target.value)
                }
                placeholder="0x..."
                className="w-full rounded-2xl border border-slate-300 px-5 py-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Carbon Credit Amount
              </label>

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="1000"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Verified Project ID
              </label>

              <input
                type="text"
                value={projectId}
                onChange={(e) =>
                  setProjectId(e.target.value)
                }
                placeholder="PROJECT-001"
                className="w-full rounded-2xl border border-slate-300 px-5 py-4"
              />
            </div>

            <button
              onClick={handleMintCredits}
              disabled={loading}
              className="w-full rounded-2xl bg-emerald-700 py-5 text-white font-semibold text-lg hover:bg-emerald-800 transition disabled:opacity-60"
            >
              {loading
                ? 'Minting Credits...'
                : 'Mint Carbon Credits'}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}
