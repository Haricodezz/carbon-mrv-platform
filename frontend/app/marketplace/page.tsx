'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  fetchMarketplaceProjects,
  type MarketplaceProject,
} from '@/services/marketplaceService';
import { purchaseCredits } from '@/services/purchaseService';

import { deferEffectTask } from '@/lib/deferEffect';

type EnhancedMarketplaceProject =
  MarketplaceProject & {
    image: string;
    region: string;
  };

export default function MarketplacePage() {
  const [projects, setProjects] = useState<
    EnhancedMarketplaceProject[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  const [purchaseLoading, setPurchaseLoading] =
    useState<string | null>(null);

  const [projectType, setProjectType] =
    useState('All Types');

  const [region, setRegion] =
    useState('All Regions');

  useEffect(() => {
    return deferEffectTask(() => {
      void (async () => {
        try {
          const data =
            await fetchMarketplaceProjects();

          const enhancedProjects =
            (data || []).map((project) => ({
              ...project,
              image:
                '/images/marketplace-hero.jpg',
              region:
                project.country ||
                'Global',
            }));

          setProjects(
            enhancedProjects
          );

          setError('');
        } catch (
          err: unknown
        ) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Failed to load marketplace.';
          console.error(
            'Marketplace load error:',
            err
          );
          setError(msg);
        } finally {
          setLoading(false);
        }
      })();
    });
  }, []);

  async function handlePurchase(
    projectId: string
  ) {
    try {
      setPurchaseLoading(projectId);
      setError('');
      setSuccessMessage('');

      const result =
        await purchaseCredits(
          projectId,
          1
        );

      setSuccessMessage(
        `${result.credits_purchased} carbon credit purchased successfully.`
      );

      const updatedProjects =
        projects.map(
          (project) =>
            project.id === projectId
              ? {
                  ...project,
                  estimated_credits:
                    Math.max(0, project.estimated_credits - result.credits_purchased),
                }
              : project
        );

      setProjects(
        updatedProjects
      );
    } catch (
      err: unknown
    ) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Purchase failed.';
      setError(msg);
    } finally {
      setPurchaseLoading(null);
    }
  }

  const filteredProjects =
    useMemo(() => {
      return projects.filter(
        (project) => {
          const matchesType =
            projectType ===
              'All Types' ||
            project.project_type ===
              projectType;

          const matchesRegion =
            region ===
              'All Regions' ||
            project.region ===
              region;

          return (
            matchesType &&
            matchesRegion
          );
        }
      );
    }, [
      projects,
      projectType,
      region,
    ]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-lg font-semibold text-slate-700">
          Loading marketplace...
        </div>
      </div>
    );
  }

  return (
    <main className="bg-white text-slate-900">

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-8 py-24 grid lg:grid-cols-2 gap-16 items-center">

          <div>
            <p className="text-green-700 font-semibold uppercase tracking-[0.25em] mb-6">
              Carbon Marketplace
            </p>

            <h1
              className="text-6xl font-bold leading-tight"
              style={{
                fontFamily:
                  'var(--font-playfair)',
              }}
            >
              Buy and Support Verified Carbon Projects
            </h1>

            <p className="mt-8 text-lg text-slate-600 leading-relaxed max-w-2xl">
              Empower climate action by purchasing
              blockchain-backed verified carbon
              credits from real sustainability
              initiatives worldwide.
            </p>

            <div className="mt-10 flex flex-wrap gap-8 text-slate-700">
              <p>
                ✔ Verified Projects
              </p>
              <p>
                ✔ Secure ESG Investing
              </p>
              <p>
                ✔ Blockchain Transparency
              </p>
            </div>
          </div>

          <div>
            <img
              src="/images/marketplace-hero.jpg"
              alt="Carbon Marketplace"
              className="rounded-[2rem] shadow-2xl object-cover w-full h-[500px]"
            />
          </div>

        </div>
      </section>


      {/* MARKETPLACE */}
      <section className="max-w-7xl mx-auto px-8 py-24">

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-700 font-medium">
            {successMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-10">

          {/* FILTERS */}
          <aside className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 h-fit">

            <h3 className="text-2xl font-bold mb-8">
              Filters
            </h3>

            <div className="space-y-6">

              <div>
                <label className="block mb-2 font-medium">
                  Project Type
                </label>

                <select
                  value={projectType}
                  onChange={(e) =>
                    setProjectType(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option>
                    All Types
                  </option>

                  <option>
                    Farmer Project
                  </option>

                  <option>
                    NGO Project
                  </option>

                  <option>
                    Reforestation
                  </option>

                  <option>
                    Renewable Energy
                  </option>
                </select>
              </div>


              <div>
                <label className="block mb-2 font-medium">
                  Region
                </label>

                <select
                  value={region}
                  onChange={(e) =>
                    setRegion(
                      e.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                >
                  <option>
                    All Regions
                  </option>

                  {[
                    ...new Set(
                      projects.map(
                        (
                          project
                        ) =>
                          project.region
                      )
                    ),
                  ].map(
                    (
                      regionOption
                    ) => (
                      <option
                        key={
                          regionOption
                        }
                      >
                        {
                          regionOption
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

          </aside>


          {/* PROJECTS */}
          <div className="lg:col-span-3">

            <h2 className="text-4xl font-bold mb-10">
              Available Carbon Credits
            </h2>

            <div className="grid md:grid-cols-2 gap-8">

              {filteredProjects.map(
                (project) => (
                  <div
                    key={project.id}
                    className="rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden bg-white"
                  >

                    <img
                      src={
                        project.image
                      }
                      alt={
                        project.project_name
                      }
                      className="w-full h-56 object-cover"
                    />

                    <div className="p-8">

                      <span className="inline-block rounded-full px-4 py-2 text-sm font-medium mb-4 bg-green-100 text-green-700">
                        {
                          project.project_type
                        }
                      </span>

                      <h3 className="text-3xl font-bold mb-4">
                        {
                          project.project_name
                        }
                      </h3>

                      <p className="text-slate-600 leading-relaxed">
                        {project.description ||
                          'Verified sustainability initiative.'}
                      </p>

                      <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-slate-700">
                        <p>
                          {
                            project.estimated_credits
                          }{' '}
                          Credits
                        </p>

                        <p>
                          ₹
                          {project.price_per_credit.toLocaleString()}
                          /Credit
                        </p>

                        <p>
                          {
                            project.country
                          }
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handlePurchase(
                            project.id
                          )
                        }
                        disabled={
                          purchaseLoading ===
                          project.id
                        }
                        className="mt-8 w-full rounded-full bg-green-700 text-white py-4 font-semibold hover:bg-green-800 transition disabled:opacity-60"
                      >
                        {purchaseLoading ===
                        project.id
                          ? 'Processing...'
                          : 'Buy 1 Credit'}
                      </button>

                    </div>
                  </div>
                )
              )}

            </div>

            {filteredProjects.length ===
              0 && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center mt-8">
                <p className="text-slate-600 text-lg">
                  No projects match your
                  selected filters.
                </p>
              </div>
            )}

          </div>

        </div>
      </section>
    </main>
  );
}