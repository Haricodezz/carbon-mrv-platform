'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
// DashboardShell is now provided by the global layout
import { getProjects, Project } from '@/services/projectService';
import { useAuthGuard } from '@/hooks/useAuthGuard';

export default function FarmerProjectsDashboardPage() {
  const { user, loading: authLoading } = useAuthGuard('farmer');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === 'farmer') {
      getProjects()
        .then(data => setProjects(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const totalProjects = projects.length;
  const registeredAcres = projects.reduce((sum, p) => sum + (p.land_area_acres || 0), 0);
  const estimatedCredits = projects.reduce((sum, p) => sum + (p.estimated_credits || 0), 0);
  // Assuming a static price per credit of ₹1500 for potential revenue estimation
  const revenuePotential = estimatedCredits * 1500;

  return (
    <>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-8">

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Total Projects</p>
          <h3 className="text-4xl font-bold mt-3">
            {totalProjects}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Registered Acres</p>
          <h3 className="text-4xl font-bold mt-3">
            {registeredAcres}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Estimated Credits</p>
          <h3 className="text-4xl font-bold mt-3">
            {estimatedCredits}
          </h3>
        </div>

        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500">Revenue Potential</p>
          <h3 className="text-4xl font-bold mt-3">
            ₹{(revenuePotential / 100000).toFixed(1)}L+
          </h3>
        </div>

      </div>

      {/* Projects */}
      <div className="mt-12 rounded-[2rem] bg-white border border-slate-200 shadow-sm p-10">

        <h2 className="text-3xl font-bold mb-8">
          Active Projects
        </h2>

        <div className="space-y-8">

          {projects.length === 0 ? (
            <p className="text-slate-500">No active projects found.</p>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                className="rounded-3xl border border-slate-200 p-8 flex flex-col lg:flex-row justify-between gap-8"
              >

                <div>
                  <h3 className="text-2xl font-bold">
                    {project.project_name}
                  </h3>

                  <p className="text-slate-600 mt-3">
                    {project.land_area_acres} Acres • {project.estimated_credits || 0} Estimated Credits
                  </p>
                  
                  <p className="text-sm text-slate-500 mt-2">
                    Created: {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                <div className="flex items-center gap-4">

                  <span className={`rounded-full px-4 py-2 font-medium capitalize ${
                    project.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {project.status}
                  </span>
                  
                  <span className={`rounded-full px-4 py-2 font-medium capitalize ${
                    project.satellite_status === 'verified' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    Sat: {project.satellite_status}
                  </span>

                  <Link href={`/dashboard/projects/${project.id}`} className="rounded-full bg-green-700 text-white px-6 py-3 font-semibold hover:bg-green-800 transition">
                    View Project
                  </Link>

                </div>

              </div>
            ))
          )}

        </div>

      </div>

    </>
  );
}