'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import Link from 'next/link';

import {
  getProjectById,
  Project,
  downloadProjectCertificate,
} from '@/services/projectService';

import PolygonViewer from '@/components/maps/PolygonViewer';


export default function ProjectDetailsPage() {
  const params =
    useParams();

  const projectId =
    params.id as string;

  const [
    project,
    setProject,
  ] = useState<
    Project | null
  >(null);

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
              await getProjectById(
                projectId
              );

            setProject(
              data
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
                'Failed to load project.'
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
  }, [projectId]);

  const handleDownloadCertificate =
    async () => {
      try {
        const blob =
          await downloadProjectCertificate(
            projectId
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            'a'
          );

        link.href = url;

        link.download = `${project?.project_name || 'project'}_certificate.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );
      } catch (
        err: unknown
      ) {
        if (
          err instanceof Error
        ) {
          alert(
            err.message
          );
        } else {
          alert(
            'Certificate download failed.'
          );
        }
      }
    };

  if (loading) {
    return (
      <div className="p-6">
        Loading project...
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

  if (!project) {
    return (
      <div className="p-6">
        Project not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <Link
        href="/dashboard/projects"
        className="text-green-600 hover:underline"
      >
        ← Back to Projects
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            {
              project.project_name
            }
          </h1>

          <p className="text-gray-600 mt-2">
            {
              project.location
            }
            ,{' '}
            {
              project.country
            }
          </p>
        </div>

        <button
          onClick={
            handleDownloadCertificate
          }
          className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700"
        >
          Download Certificate
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* PROJECT OVERVIEW */}
        <div className="border rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">
            Project Overview
          </h2>

          <p>
            <strong>
              Type:
            </strong>{' '}
            {project.project_type ??
              '—'}
          </p>

          <p>
            <strong>
              Land Area:
            </strong>{' '}
            {
              project.land_area_acres
            }{' '}
            acres
          </p>

          <p>
            <strong>
              Status:
            </strong>{' '}
            {
              project.status
            }
          </p>

          <p>
            <strong>
              Satellite Status:
            </strong>{' '}
            {
              project.satellite_status
            }
          </p>

          <p>
            <strong>
              Audit Status:
            </strong>{' '}
            {
              project.audit_status
            }
          </p>

          <p>
            <strong>
              Tokenized:
            </strong>{' '}
            {project.tokenized
              ? 'Yes'
              : 'No'}
          </p>
        </div>

        {/* AI VERIFICATION */}
        <div className="border rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">
            AI Verification Metrics
          </h2>

          <p>
            <strong>
              NDVI Score:
            </strong>{' '}
            {project.ndvi_score ??
              0}
          </p>

          <p>
            <strong>
              Vegetation Health:
            </strong>{' '}
            {project.vegetation_health ??
              0}
          </p>

          <p>
            <strong>
              Fraud Risk:
            </strong>{' '}
            {project.fraud_risk_score ??
              0}
          </p>

          <p>
            <strong>
              Estimated Credits:
            </strong>{' '}
            {project.estimated_credits ??
              0}
          </p>

          <p>
            <strong>
              Annual Credits:
            </strong>{' '}
            {project.estimated_annual_credits ??
              0}
          </p>
        </div>

        {/* BIOMASS ANALYTICS */}
        <div className="border rounded-xl p-5 space-y-3">
          <h2 className="text-xl font-semibold">
            Biomass & Carbon Analytics
          </h2>

          <p>
            <strong>
              AGB per Hectare:
            </strong>{' '}
            {project.agb_per_hectare ??
              0}{' '}
            tons/ha
          </p>

          <p>
            <strong>
              Total Biomass:
            </strong>{' '}
            {project.total_biomass ??
              0}{' '}
            tons
          </p>

          <p>
            <strong>
              Carbon Stock:
            </strong>{' '}
            {project.carbon_stock ??
              0}{' '}
            tons
          </p>

          <p>
            <strong>
              CO₂e:
            </strong>{' '}
            {project.co2e ??
              0}{' '}
            tons
          </p>
        </div>
      </div>

      {/* POLYGON MAP */}
      {project.polygon_coordinates && (
        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="text-xl font-semibold">
            Project Boundary
          </h2>

          <PolygonViewer
            polygonCoordinates={
              project.polygon_coordinates
            }
          />
        </div>
      )}

      {/* VERIFICATION NOTES */}
      <div className="border rounded-xl p-5 space-y-4">
        <h2 className="text-xl font-semibold">
          Verification Notes
        </h2>

        <p className="text-gray-700 whitespace-pre-line">
          {project.verification_notes ||
            'No verification notes available yet.'}
        </p>
      </div>

      {/* BLOCKCHAIN */}
      {project.blockchain_tx_hash && (
        <div className="border rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-3">
            Blockchain
          </h2>

          <p className="break-all">
            <strong>
              Transaction Hash:
            </strong>{' '}
            {
              project.blockchain_tx_hash
            }
          </p>
        </div>
      )}
    </div>
  );
}