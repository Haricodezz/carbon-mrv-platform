'use client';

import { useEffect, useState } from 'react';
import {
  fetchMarketplaceProjects,
  type MarketplaceProject,
} from '@/services/marketplaceService';

import { deferEffectTask } from '@/lib/deferEffect';

export default function AdminMarketplaceDashboard() {
  const [projects, setProjects] =
    useState<MarketplaceProject[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    return deferEffectTask(() => {
      void (async () => {
        try {
          const data = await fetchMarketplaceProjects();

          setProjects(data);
        } finally {
          setLoading(false);
        }
      })();
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading admin marketplace...
      </div>
    );
  }

  const totalCredits =
    projects.reduce(
      (sum, project) =>
        sum +
        project.estimated_credits,
      0
    );

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Global Carbon Economy Control Center
          </h1>

          <p className="text-slate-600 text-lg">
            Oversee platform-wide sustainability,
            tokenization,
            and carbon market operations.
          </p>
        </div>


        <div className="grid md:grid-cols-3 gap-8 mb-12">

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-sm text-slate-500 mb-2">
              Marketplace Projects
            </h2>

            <p className="text-4xl font-bold text-blue-700">
              {projects.length}
            </p>
          </div>


          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-sm text-slate-500 mb-2">
              Total Credits Listed
            </h2>

            <p className="text-4xl font-bold text-green-700">
              {totalCredits}
            </p>
          </div>


          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h2 className="text-sm text-slate-500 mb-2">
              Estimated Market Value
            </h2>

            <p className="text-4xl font-bold text-purple-700">
              ₹
              {(
                totalCredits * 25
              ).toLocaleString()}
            </p>
          </div>

        </div>


        <div className="space-y-6">

          {projects.map(
            (project) => (
              <div
                key={project.id}
                className="rounded-3xl bg-white shadow-lg border border-slate-200 p-8"
              >
                <div className="grid md:grid-cols-5 gap-6">

                  <div>
                    <p className="text-sm text-slate-500">
                      Project
                    </p>

                    <p className="font-bold">
                      {
                        project.project_name
                      }
                    </p>
                  </div>


                  <div>
                    <p className="text-sm text-slate-500">
                      Type
                    </p>

                    <p className="font-semibold">
                      {
                        project.project_type
                      }
                    </p>
                  </div>


                  <div>
                    <p className="text-sm text-slate-500">
                      Credits
                    </p>

                    <p className="font-semibold text-blue-700">
                      {
                        project.estimated_credits
                      }
                    </p>
                  </div>


                  <div>
                    <p className="text-sm text-slate-500">
                      Price
                    </p>

                    <p className="font-semibold text-purple-700">
                      ₹
                      {
                        project.price_per_credit
                      }
                    </p>
                  </div>


                  <div>
                    <button className="w-full rounded-xl bg-blue-700 text-white py-3 font-semibold hover:bg-blue-800 transition">
                      Manage Listing
                    </button>
                  </div>

                </div>
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
}