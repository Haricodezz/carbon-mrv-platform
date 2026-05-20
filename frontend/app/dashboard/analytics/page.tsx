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

export default function AnalyticsDashboardPage() {
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

            setProjects(
              Array.isArray(data) ? data : []
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
                'Failed to load analytics.'
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
        Loading analytics...
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

  const totalProjects =
    projects.length;

  const verifiedProjects =
    projects.filter(
      (
        project
      ) =>
        project.satellite_status ===
        'verified'
    ).length;

  const approvedProjects =
    projects.filter(
      (
        project
      ) =>
        project.audit_status ===
        'approved'
    ).length;

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

  const avgNDVI =
    totalProjects > 0
      ? (
          projects.reduce(
            (
              sum,
              project
            ) =>
              sum +
              (project.ndvi_score ??
                0),
            0
          ) /
          totalProjects
        ).toFixed(2)
      : '0';

  const avgFraudRisk =
    totalProjects > 0
      ? (
          projects.reduce(
            (
              sum,
              project
            ) =>
              sum +
              (project.fraud_risk_score ??
                0),
            0
          ) /
          totalProjects
        ).toFixed(2)
      : '0';

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Carbon MRV Analytics Center
        </h1>

        <p className="text-gray-600 mt-2">
          Institutional-grade oversight for project verification, biomass intelligence, and carbon market operations.
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Total Projects
          </h2>
          <p className="text-3xl font-bold mt-2">
            {
              totalProjects
            }
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Verified Projects
          </h2>
          <p className="text-3xl font-bold mt-2 text-green-600">
            {
              verifiedProjects
            }
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Approved Projects
          </h2>
          <p className="text-3xl font-bold mt-2 text-blue-600">
            {
              approvedProjects
            }
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Total Credits
          </h2>
          <p className="text-3xl font-bold mt-2 text-emerald-700">
            {
              totalCredits
            }
          </p>
        </div>

        <div className="border rounded-xl p-5">
          <h2 className="text-lg font-semibold">
            Total Biomass
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
            Total Carbon Stock
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
            Total CO₂e
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
            Avg NDVI
          </h2>
          <p className="text-3xl font-bold mt-2">
            {
              avgNDVI
            }
          </p>
        </div>
      </div>

      {/* RISK SECTION */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            Average Fraud Risk
          </h2>

          <p className="text-4xl font-bold mt-4 text-red-600">
            {
              avgFraudRisk
            }
          </p>
        </div>

        <div className="border rounded-xl p-6">
          <h2 className="text-xl font-semibold">
            System Intelligence
          </h2>

          <ul className="mt-4 space-y-2 text-gray-700">
            <li>
              ✔ Satellite verification active
            </li>

            <li>
              ✔ AI biomass prediction active
            </li>

            <li>
              ✔ Carbon stock registry active
            </li>

            <li>
              ✔ Blockchain tokenization active
            </li>
          </ul>
        </div>
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
                NDVI
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
                Credits
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

                  <td className="p-3">
                    {project.ndvi_score ??
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

                  <td className="p-3 font-semibold">
                    {project.estimated_credits ??
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