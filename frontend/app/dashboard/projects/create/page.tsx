'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PolygonMap from '@/components/maps/PolygonMap';

import {
  createProject,
} from '@/services/projectService';


export default function CreateProjectPage() {
  const router =
    useRouter();

  const [form, setForm] =
    useState({
      project_name: '',
      country: 'India',
      location: '',
      description: '',
      polygon_coordinates: '',
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !form.project_name ||
      !form.location ||
      !form.polygon_coordinates
    ) {
      setError(
        'Please complete required fields and draw your land boundary.'
      );
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createProject(
        form
      );

      router.push(
        '/dashboard/projects'
      );
    } catch (
      err: unknown
    ) {
      setError(
        err instanceof Error
          ? err.message
          : 'Project creation failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">
          Create Carbon Project
        </h1>

        <p className="text-gray-600 mt-2">
          Submit your land for AI-powered satellite verification and carbon credit generation.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Project Name"
            value={
              form.project_name
            }
            onChange={(
              e
            ) =>
              setForm({
                ...form,
                project_name:
                  e.target
                    .value,
              })
            }
            className="border rounded-lg p-3"
            required
          />

          <input
            type="text"
            placeholder="Country"
            value={
              form.country
            }
            onChange={(
              e
            ) =>
              setForm({
                ...form,
                country:
                  e.target
                    .value,
              })
            }
            className="border rounded-lg p-3"
          />
        </div>

        <input
          type="text"
          placeholder="State / City / District"
          value={
            form.location
          }
          onChange={(
            e
          ) =>
            setForm({
              ...form,
              location:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        <textarea
          placeholder="Project Description (Optional)"
          value={
            form.description
          }
          onChange={(
            e
          ) =>
            setForm({
              ...form,
              description:
                e.target
                  .value,
            })
          }
          className="w-full border rounded-lg p-3 min-h-[120px]"
        />

        <div className="space-y-3">
          <h2 className="text-xl font-semibold">
            Draw Project Boundary
          </h2>

          <p className="text-sm text-gray-600">
            Use polygon tool to outline your land area.
          </p>

          <PolygonMap
            onPolygonComplete={(
              polygon
            ) =>
              setForm({
                ...form,
                polygon_coordinates:
                  polygon,
              })
            }
          />
        </div>

        <button
          type="submit"
          disabled={
            loading
          }
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold"
        >
          {loading
            ? 'Creating Project...'
            : 'Create Project'}
        </button>
      </form>
    </div>
  );
}