'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchMarketplaceProjects,
  MarketplaceProject,
} from '@/services/marketplaceService';

export default function MarketplacePage() {
  const [projects, setProjects] = useState<MarketplaceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchMarketplaceProjects();
        if (!cancelled) {
          setProjects(data);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load marketplace.'
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
    return <div className="p-6">Loading marketplace...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Carbon Credit Marketplace</h1>
        <p className="text-gray-600 mt-2">
          Discover verified carbon projects with blockchain-backed credits.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-gray-600">
          No marketplace projects available yet.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-2xl p-6 shadow-sm hover:shadow-lg transition space-y-4"
            >
              <div>
                <h2 className="text-2xl font-semibold">{project.project_name}</h2>
                <p className="text-gray-500 mt-1">
                  {project.location}, {project.country}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <strong>Available Credits:</strong> {project.available_credits}
                </p>
                <p>
                  <strong>Price per Credit:</strong> {project.price_per_credit}{' '}
                  {project.currency}
                </p>
                <p>
                  <strong>Status:</strong> {project.status}
                </p>
              </div>

              <div className="pt-3">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="inline-block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  View Full Project
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
