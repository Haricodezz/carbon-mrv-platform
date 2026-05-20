'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  getProjects,
  Project,
} from '@/services/projectService';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function PortfolioDashboardPage() {
  const { user, loading: authLoading } = useAuthGuard();
  const [
    projects,
    setProjects,
  ] = useState<
    Project[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  useEffect(() => {
    const timeout =
      setTimeout(
        async () => {
          try {
            const data =
              await getProjects();

            const portfolioProjects =
              data.filter(
                (
                  project
                ) =>
                  project.audit_status ===
                  'approved'
              );

            setProjects(
              portfolioProjects
            );
          } catch (
            err: unknown
          ) {
            if (
              err instanceof
              Error
            ) {
              setError(
                err.message
              );
            } else {
              setError(
                'Failed to load portfolio.'
              );
            }
          } finally {
            setLoading(
              false
            );
          }
        },
        0
      );

    return () =>
      clearTimeout(
        timeout
      );
  }, []);

  if (loading || authLoading || !user) {
    return (
      <div className="p-6">
        Loading portfolio...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-600">
        {error}
      </div>
    );
  }

  const totalCredits =
    projects.reduce(
      (
        sum,
        project
      ) =>
        sum +
        (project.estimated_credits ??
          0),
      0
    );

  const retiredCredits =
    projects
      .filter(
        (
          project
        ) =>
          project.status ===
          'retired'
      )
      .reduce(
        (
          sum,
          project
        ) =>
          sum +
          (project.estimated_credits ??
            0),
        0
      );

  const totalCarbonStock =
    projects.reduce(
      (
        sum,
        project
      ) =>
        sum +
        (project.carbon_stock ??
          0),
      0
    );

  const totalCO2e =
    projects.reduce(
      (
        sum,
        project
      ) =>
        sum +
        (project.co2e ??
          0),
      0
    );

  const totalBiomass =
    projects.reduce(
      (
        sum,
        project
      ) =>
        sum +
        (project.total_biomass ??
          0),
      0
    );

  const avgFraudRisk =
    projects.length > 0
      ? projects.reduce(
          (
            sum,
            project
          ) =>
            sum +
            (project.fraud_risk_score ??
              0),
          0
        ) /
        projects.length
      : 0;

  const avgNDVI =
    projects.length > 0
      ? projects.reduce(
          (
            sum,
            project
          ) =>
            sum +
            (project.ndvi_score ??
              0),
          0
        ) /
        projects.length
      : 0;

  // ESG SCORE MODEL
  const esgScore =
    Math.max(
      0,
      Math.min(
        100,
        (
          avgNDVI *
            50 +
          (100 -
            avgFraudRisk) *
            0.5
        )
      )
    ).toFixed(2);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          ESG Portfolio Dashboard
        </h1>

        <p className="text-gray-600 mt-2">
          Monitor enterprise-grade carbon offset performance, retirement strategy, and ESG intelligence.
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Purchased Credits
          </h2>
          <p className="text-3xl font-bold mt-2">
            {
              totalCredits
            }
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Retired Credits
          </h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {
              retiredCredits
            }
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Portfolio Carbon Stock
          </h2>
          <p className="text-3xl font-bold mt-2">
            {totalCarbonStock.toFixed(
              2
            )}{' '}
            t
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Portfolio CO₂e
          </h2>
          <p className="text-3xl font-bold mt-2">
            {totalCO2e.toFixed(
              2
            )}{' '}
            t
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Portfolio Biomass
          </h2>
          <p className="text-3xl font-bold mt-2">
            {totalBiomass.toFixed(
              2
            )}{' '}
            t
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Average NDVI
          </h2>
          <p className="text-3xl font-bold mt-2">
            {avgNDVI.toFixed(
              2
            )}
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Avg Fraud Risk
          </h2>
          <p className="text-3xl font-bold mt-2 text-red-600">
            {avgFraudRisk.toFixed(
              2
            )}
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            ESG Score
          </h2>
          <p className="text-3xl font-bold mt-2 text-emerald-700">
            {
              esgScore
            }
            /100
          </p>
        </div>
      </div>

      {/* ESG INSIGHTS */}
      <div className="border rounded-xl p-6">
        <h2 className="text-2xl font-semibold">
          ESG Intelligence Summary
        </h2>

        <ul className="mt-4 space-y-2 text-gray-700">
          <li>
            ✔ Biomass-backed carbon offsets active
          </li>

          <li>
            ✔ AI satellite verification integrated
          </li>

          <li>
            ✔ Blockchain retirement infrastructure active
          </li>

          <li>
            ✔ Portfolio ESG score: {esgScore}/100
          </li>
        </ul>
      </div>

      {/* PROJECT TABLE */}
      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">
                Project
              </th>

              <th className="p-3 text-left">
                Credits
              </th>

              <th className="p-3 text-left">
                Biomass
              </th>

              <th className="p-3 text-left">
                Carbon
              </th>

              <th className="p-3 text-left">
                CO₂e
              </th>

              <th className="p-3 text-left">
                NDVI
              </th>

              <th className="p-3 text-left">
                Fraud
              </th>

              <th className="p-3 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {projects.map(
              (
                project
              ) => (
                <tr
                  key={
                    project.id
                  }
                  className="border-t"
                >
                  <td className="p-3">
                    {
                      project.project_name
                    }
                  </td>

                  <td className="p-3 font-semibold">
                    {project.estimated_credits ??
                      0}
                  </td>

                  <td className="p-3">
                    {project.total_biomass ??
                      0}
                  </td>

                  <td className="p-3">
                    {project.carbon_stock ??
                      0}
                  </td>

                  <td className="p-3">
                    {project.co2e ??
                      0}
                  </td>

                  <td className="p-3">
                    {project.ndvi_score ??
                      0}
                  </td>

                  <td className="p-3">
                    {project.fraud_risk_score ??
                      0}
                  </td>

                  <td className="p-3 capitalize">
                    {
                      project.status
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}