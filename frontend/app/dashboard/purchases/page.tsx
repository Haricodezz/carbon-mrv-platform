'use client';

import { useEffect, useState } from 'react';
import {
  getPurchaseHistory,
  PurchaseHistory,
} from '@/services/purchaseService';

import { deferEffectTask } from '@/lib/deferEffect';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function PurchasesDashboard() {
  const { user, loading: authLoading } = useAuthGuard();
  const [purchases, setPurchases] =
    useState<PurchaseHistory[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  async function loadPurchases() {
    try {
      const data =
        await getPurchaseHistory();

      setPurchases(data);

      setError('');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to load purchases.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return deferEffectTask(() => {
      void loadPurchases();
    });
  }, []);

  const totalCredits =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        purchase.credits_purchased,
      0
    );

  const totalInvestment =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        purchase.total_price,
      0
    );

  if (loading || authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading purchase history...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Carbon Credit Portfolio
          </h1>

          <p className="text-slate-600 text-lg">
            Track all purchased carbon assets,
            ESG investments,
            and sustainability ownership.
          </p>
        </div>


        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}


        <div className="grid md:grid-cols-2 gap-8 mb-12">

          <div className="rounded-3xl bg-white shadow-xl border border-slate-200 p-8">
            <h2 className="text-sm text-slate-500 mb-2">
              Total Credits Owned
            </h2>

            <p className="text-5xl font-bold text-blue-700">
              {totalCredits}
            </p>
          </div>


          <div className="rounded-3xl bg-white shadow-xl border border-slate-200 p-8">
            <h2 className="text-sm text-slate-500 mb-2">
              Total ESG Investment
            </h2>

            <p className="text-5xl font-bold text-purple-700">
              ₹{totalInvestment.toLocaleString()}
            </p>
          </div>

        </div>


        {purchases.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-lg border border-slate-200 p-10 text-center">
            <p className="text-slate-600 text-lg">
              No carbon credit purchases yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            {purchases.map(
              (purchase) => (
                <div
                  key={
                    purchase.purchase_id
                  }
                  className="rounded-3xl bg-white shadow-lg border border-slate-200 p-8"
                >
                  <div className="grid md:grid-cols-5 gap-6">

                    <div>
                      <p className="text-sm text-slate-500">
                        Project
                      </p>

                      <p className="font-bold text-slate-900">
                        {
                          purchase.project_name
                        }
                      </p>
                    </div>


                    <div>
                      <p className="text-sm text-slate-500">
                        Credits
                      </p>

                      <p className="font-bold text-blue-700">
                        {
                          purchase.credits_purchased
                        }
                      </p>
                    </div>


                    <div>
                      <p className="text-sm text-slate-500">
                        Price / Credit
                      </p>

                      <p className="font-bold text-slate-900">
                        ₹
                        {
                          purchase.price_per_credit
                        }
                      </p>
                    </div>


                    <div>
                      <p className="text-sm text-slate-500">
                        Total
                      </p>

                      <p className="font-bold text-purple-700">
                        ₹
                        {purchase.total_price}
                      </p>
                    </div>


                    <div>
                      <p className="text-sm text-slate-500">
                        Date
                      </p>

                      <p className="font-semibold text-slate-900">
                        {new Date(
                          purchase.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>

                  </div>
                </div>
              )
            )}

          </div>
        )}

      </div>
    </>
  );
}