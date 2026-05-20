'use client';

import { useEffect, useState } from 'react';
import {
  fetchWalletInfo,
  verifyWallet,
  type WalletResponse,
} from '@/services/walletService';
import { getToken } from '@/services/authService';
import {
  requestWalletAccounts,
} from '@/lib/ethereum';

import { deferEffectTask } from '@/lib/deferEffect';

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function shortenAddress(address: string) {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  function parseWalletError(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === -32002
    ) {
      return 'MetaMask already has a pending request. Please open MetaMask and complete it first.';
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error
    ) {
      return String((error as { message?: string }).message);
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Wallet verification failed.';
  }

  async function refreshWallet() {
    const token = getToken();

    if (!token) {
      throw new Error('Please log in to manage your wallet.');
    }

    const wallet = await fetchWalletInfo();
    setWalletData(wallet);
    setErrorMessage('');
  }

  async function handleConnectWallet() {
    try {
      setWalletLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (typeof window === 'undefined') {
        throw new Error('Wallet connection requires browser access.');
      }

      const token = getToken();

      if (!token) {
        throw new Error('Please log in before connecting your wallet.');
      }

      const [walletAddress] = await requestWalletAccounts();

      await verifyWallet({
        wallet_address: walletAddress,
      });

      await refreshWallet();

      setSuccessMessage('Wallet connected and verified successfully.');
    } catch (error) {
      console.error('Wallet verification error:', error);
      setErrorMessage(parseWalletError(error));
    } finally {
      setWalletLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    const cancelTimer = deferEffectTask(() => {
      void (async () => {
        try {
          await refreshWallet();
        } catch (error) {
          if (!cancelled) {
            console.error('Wallet fetch error:', error);
            setErrorMessage(parseWalletError(error));
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
    });

    return () => {
      cancelled = true;
      cancelTimer();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-lg font-semibold text-slate-700">
          Loading wallet...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Wallet Security Center
          </h1>

          <p className="text-slate-600 text-lg max-w-4xl">
            Secure your blockchain identity for carbon credit issuance,
            marketplace participation, and ESG retirement compliance.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium shadow-sm">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-8 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-700 font-medium shadow-sm">
            {successMessage}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl bg-white shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold mb-8 text-slate-900">
              Wallet Overview
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-500 mb-2">Wallet Address</p>
                <p className="text-lg font-semibold text-slate-900 break-all">
                  {walletData?.wallet_address
                    ? shortenAddress(walletData.wallet_address)
                    : 'Not Connected'}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">Carbon Balance</p>
                <p className="text-lg font-semibold text-green-700">
                  {walletData?.carbon_balance || 0} Credits
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">
                  Verification Status
                </p>
                <span
                  className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    walletData?.is_verified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {walletData?.is_verified
                    ? 'Verified'
                    : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold mb-8 text-slate-900">
              Security Standards
            </h2>

            <ul className="space-y-4 text-slate-700 text-base">
              <li>✔ Wallet ownership verified via blockchain signature</li>
              <li>✔ Prevents fraudulent carbon token claims</li>
              <li>✔ Required for token issuance & marketplace access</li>
              <li>✔ Supports retirement-grade ESG compliance</li>
              <li>✔ Production-grade Web3 identity authentication</li>
            </ul>

            <button
              type="button"
              onClick={handleConnectWallet}
              disabled={walletLoading}
              className="mt-10 w-full rounded-2xl bg-blue-600 py-4 text-white font-semibold text-lg shadow-md hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {walletLoading
                ? 'Verifying Wallet...'
                : walletData?.is_verified
                  ? 'Update Wallet'
                  : 'Connect & Verify Wallet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
