'use client';

import { useEffect, useState } from 'react';
import {
  fetchWalletInfo,
  fetchWalletCredits,
  fetchWalletTransactions,
  WalletResponse,
  CreditOwnershipResponse,
  WalletTransactionResponse,
} from '@/services/walletService';

export default function CompanyWalletDashboardPage() {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [credits, setCredits] = useState<CreditOwnershipResponse[]>([]);
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [walletData, creditData, txData] = await Promise.all([
          fetchWalletInfo(),
          fetchWalletCredits(),
          fetchWalletTransactions(),
        ]);
        if (!cancelled) {
          setWallet(walletData);
          setCredits(creditData);
          setTransactions(txData);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load wallet dashboard.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-6">Loading wallet...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  const totalHoldings = wallet?.carbon_balance ?? 0;
  const totalRetired = wallet?.total_retired ?? 0;
  const totalPurchased = wallet?.total_purchased ?? 0;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Enterprise Carbon Wallet</h1>
        <p className="text-gray-600 mt-2">
          Blockchain-backed institutional carbon asset management dashboard.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">Carbon Balance</h2>
          <p className="text-3xl font-bold mt-2">{totalHoldings}</p>
        </div>
        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">Total Purchased</h2>
          <p className="text-3xl font-bold mt-2">{totalPurchased}</p>
        </div>
        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">Total Retired</h2>
          <p className="text-3xl font-bold mt-2 text-green-600">{totalRetired}</p>
        </div>
        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">Linked Wallet</h2>
          <p className="text-sm mt-2 break-all font-mono">
            {wallet?.wallet_address || 'Not connected'}
          </p>
        </div>
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Credit Holdings by Project</h2>
        {credits.length === 0 ? (
          <p className="text-gray-600">No credit holdings yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-left">Owned</th>
                  <th className="p-3 text-left">Retired</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3">{row.project_name}</td>
                    <td className="p-3 font-semibold">{row.total_credits_owned}</td>
                    <td className="p-3">{row.credits_retired}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-600">No transactions yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <div key={tx.id} className="border rounded-lg p-3 text-sm">
                <p>
                  <strong>Type:</strong> {tx.transaction_type}
                </p>
                <p>
                  <strong>Credits:</strong> {tx.credits} · <strong>Amount:</strong>{' '}
                  {tx.amount} {tx.currency}
                </p>
                <p>
                  <strong>Status:</strong> {tx.status}
                </p>
                {tx.blockchain_tx_hash && (
                  <p className="break-all mt-1">
                    <strong>TX:</strong> {tx.blockchain_tx_hash}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
