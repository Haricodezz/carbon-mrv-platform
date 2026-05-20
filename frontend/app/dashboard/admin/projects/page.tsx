'use client';

import { useEffect, useState } from 'react';
import { getToken } from '@/services/authService';
import { API_URL } from '@/lib/api';
import { deferEffectTask } from '@/lib/deferEffect';

interface Project {
  id: string;
  project_name: string;
  project_type: string;
  location: string;
  country: string;
  estimated_credits: number;
  status: string;
  tokenized: boolean;
  blockchain_tx_hash?: string;
}

export default function AdminProjectsDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function fetchProjects() {
    try {
      const token = getToken();

      if (!token) {
        throw new Error('Authentication required.');
      }

      const response = await fetch(
        `${API_URL}/api/projects/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to load projects.'
        );
      }

      const data = await response.json();

      setProjects(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to fetch projects.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function approveProject(projectId: string) {
    try {
      setError('');
      setMessage('');

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/projects/${projectId}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || 'Approval failed.'
        );
      }

      setMessage(
        `Project approved successfully.`
      );

      await fetchProjects();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Approval failed.';
      setError(msg);
    }
  }

  async function rejectProject(projectId: string) {
    try {
      setError('');
      setMessage('');

      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/projects/${projectId}/reject`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || 'Rejection failed.'
        );
      }

      setMessage(
        `Project rejected successfully.`
      );

      await fetchProjects();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Rejection failed.';
      setError(msg);
    }
  }

  useEffect(() => {
    return deferEffectTask(() => {
      void fetchProjects();
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold">
        Loading projects...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Project Verification & Tokenization Center
          </h1>

          <p className="text-slate-600 text-lg">
            Review sustainability projects, approve carbon issuance,
            and activate blockchain tokenization.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700 font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-6 py-4 text-green-700 font-medium">
            {message}
          </div>
        )}

        <div className="space-y-8">

          {projects.map((project) => (
            <div
              key={project.id}
              className="rounded-3xl bg-white shadow-xl border border-slate-200 p-8"
            >
              <div className="grid lg:grid-cols-3 gap-8">

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">
                    {project.project_name}
                  </h2>

                  <p className="text-slate-600 mb-2">
                    <strong>Type:</strong> {project.project_type}
                  </p>

                  <p className="text-slate-600 mb-2">
                    <strong>Location:</strong> {project.location}, {project.country}
                  </p>

                  <p className="text-slate-600">
                    <strong>Estimated Credits:</strong> {project.estimated_credits}
                  </p>
                </div>


                <div>
                  <p className="mb-4">
                    <strong>Status:</strong>{' '}
                    <span className="capitalize">
                      {project.status}
                    </span>
                  </p>

                  <p className="mb-4">
                    <strong>Tokenization:</strong>{' '}
                    <span
                      className={`font-semibold ${
                        project.tokenized
                          ? 'text-green-700'
                          : 'text-yellow-700'
                      }`}
                    >
                      {project.tokenized
                        ? 'Blockchain Active'
                        : 'Pending'}
                    </span>
                  </p>

                  {project.blockchain_tx_hash && (
                    <p className="break-all text-sm text-slate-500">
                      <strong>TX:</strong> {project.blockchain_tx_hash}
                    </p>
                  )}
                </div>


                <div className="flex flex-col gap-4">
                  <button
                    onClick={() =>
                      approveProject(project.id)
                    }
                    className="rounded-2xl bg-emerald-700 py-4 text-white font-semibold hover:bg-emerald-800 transition"
                  >
                    Approve & Tokenize
                  </button>

                  <button
                    onClick={() =>
                      rejectProject(project.id)
                    }
                    className="rounded-2xl bg-red-600 py-4 text-white font-semibold hover:bg-red-700 transition"
                  >
                    Reject Project
                  </button>
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}