'use client';

import { useEffect, useState } from 'react';

import { deferEffectTask } from '@/lib/deferEffect';

import { fetchWalletTransactions, WalletTransactionResponse } from '@/services/walletService';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function TransactionsDashboard() {
  const { user, loading: authLoading } = useAuthGuard();
  const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return deferEffectTask(() => {
      void (async () => {
        try {
          const data = await fetchWalletTransactions();
          setTransactions(data);
        } catch (error) {
          console.error('Failed to load transactions:', error);
        } finally {
          setLoading(false);
        }
      })();
    });
  }, []);

  if (loading || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading transactions...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Blockchain Transaction Ledger
          </h1>

          <p className="text-slate-600 text-lg">
            Transparent blockchain audit trail for all carbon
            issuance, transfers, and retirement events.
          </p>
        </div>

        <div className="space-y-6">

          {transactions.map((tx, index) => (
            <div
              key={index}
              className="rounded-3xl bg-white shadow-lg border border-slate-200 p-8"
            >
              <div className="grid md:grid-cols-5 gap-6">

                <div>
                  <p className="text-sm text-slate-500">
                    Transaction Type
                  </p>

                  <p className="font-semibold text-slate-900">
                    {tx.transaction_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Amount
                  </p>

                  <p className="font-semibold text-slate-900">
                    {tx.credits} CMRV
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <p className="font-semibold text-green-700 capitalize">
                    {tx.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Timestamp
                  </p>

                  <p className="font-semibold text-slate-900">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    TX Hash
                  </p>

                  <p className="font-semibold text-blue-700 break-all">
                    {tx.blockchain_tx_hash || 'Pending'}
                  </p>
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </>
  );
}