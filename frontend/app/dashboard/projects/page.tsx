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
import { useAuthGuard } from '@/hooks/useAuthGuard';
// DashboardShell is now provided by the global layout


export default function ProjectsDashboardPage() {
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
    if (!user) return;
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
                'Failed to load projects.'
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
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading projects...
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="p-6 text-red-600">
          {error}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Carbon Projects
            </h1>
            <p className="text-slate-600">Manage your project portfolio</p>
          </div>

          <Link
            href="/dashboard/projects/create"
            className="bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-full font-medium shadow-sm transition"
          >
            Submit New Project
          </Link>
        </div>

        {projects.length ===
        0 ? (
          <div className="border rounded-3xl p-12 text-center text-gray-500 bg-white shadow-sm">
            <p className="text-lg">No projects submitted yet.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map(
              (
                project
              ) => (
                <Link
                  key={
                    project.id
                  }
                  href={`/dashboard/projects/${project.id}`}
                  className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm hover:shadow-lg transition block"
                >
                  <h2 className="text-2xl font-bold mb-2 text-slate-900">
                    {
                      project.project_name
                    }
                  </h2>

                  <p className="text-slate-500 mb-6">
                    {
                      project.location
                    }
                    ,{' '}
                    {
                      project.country
                    }
                  </p>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Type</span>
                      <span className="font-semibold text-slate-800">
                        {project.project_type ?? '—'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Area</span>
                      <span className="font-semibold text-slate-800">
                        {project.land_area_acres} acres
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Satellite</span>
                      <span className="font-semibold capitalize text-slate-800">
                        {project.satellite_status}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-slate-500">Audit</span>
                      <span className="font-semibold capitalize text-slate-800">
                        {project.audit_status}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2">
                      <span className="text-slate-500">Estimated Credits</span>
                      <span className="font-bold text-green-700">
                        {project.estimated_credits ?? 0}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
}