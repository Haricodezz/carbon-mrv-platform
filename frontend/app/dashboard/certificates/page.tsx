'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import {
  getProjects,
  Project,
} from '@/services/projectService';
import { DocumentPreviewModal } from '@/components/DocumentPreviewModal';

export default function CertificatesDashboardPage() {
  const [
    projects,
    setProjects,
  ] = useState<Project[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  const [
    previewModal,
    setPreviewModal,
  ] = useState<{isOpen: boolean; projectId: string; projectName: string}>({
    isOpen: false,
    projectId: '',
    projectName: ''
  });

  useEffect(() => {
    const timeout =
      setTimeout(
        async () => {
          try {
            const data =
              await getProjects();

            const approvedProjects =
              (Array.isArray(data) ? data : []).filter(
                (
                  project
                ) =>
                  project.audit_status ===
                  'approved'
              );

            setProjects(
              approvedProjects
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
                'Failed to load certificates dashboard.'
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

  if (loading) {
    return (
      <div className="p-6">
        Loading certificates...
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <DocumentPreviewModal 
        isOpen={previewModal.isOpen} 
        onClose={() => setPreviewModal({ ...previewModal, isOpen: false })} 
        documentType="certificate" 
        documentTitle={`Institutional Certificate: ${previewModal.projectName}`} 
        projectId={previewModal.projectId} 
      />

      <div>
        <h1 className="text-4xl font-bold">
          Carbon Certificates Registry
        </h1>

        <p className="text-gray-600 mt-2">
          Access institutional-grade verification certificates, blockchain registry data, and biomass-backed project intelligence.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="text-gray-600">
          No approved certificates available yet.
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">
                  Project
                </th>

                <th className="p-3 text-left">
                  Location
                </th>

                <th className="p-3 text-left">
                  Status
                </th>

                <th className="p-3 text-left">
                  Credits
                </th>

                <th className="p-3 text-left">
                  Biomass
                </th>

                <th className="p-3 text-left">
                  Carbon Stock
                </th>

                <th className="p-3 text-left">
                  CO₂e
                </th>

                <th className="p-3 text-left">
                  Tokenized
                </th>

                <th className="p-3 text-left">
                  Blockchain Hash
                </th>

                <th className="p-3 text-left">
                  Actions
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
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="text-emerald-600 hover:underline font-medium"
                      >
                        {
                          project.project_name
                        }
                      </Link>

                      <div className="text-xs text-gray-500">
                        {project.project_type ??
                          '—'}
                      </div>
                    </td>

                    <td className="p-3">
                      {
                        project.location
                      }
                      ,{' '}
                      {
                        project.country
                      }
                    </td>

                    <td className="p-3 capitalize">
                      {
                        project.status
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
                      {project.tokenized
                        ? 'Yes'
                        : 'No'}
                    </td>

                    <td className="p-3 max-w-xs break-all text-xs">
                      {project.blockchain_tx_hash ||
                        'N/A'}
                    </td>

                    <td className="p-3 space-y-2">
                      <button
                        onClick={() =>
                          setPreviewModal({ isOpen: true, projectId: project.id, projectName: project.project_name })
                        }
                        className="w-full px-3 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 font-semibold"
                      >
                        View Report
                      </button>

                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="block w-full text-center px-3 py-2 bg-slate-100 rounded hover:bg-slate-200 text-slate-700"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}