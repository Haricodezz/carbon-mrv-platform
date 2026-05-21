'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, saveToken, getCurrentUser } from '@/services/authService';
import { getDashboardRoute } from '@/lib/roleRedirect';
import { useAuth } from '@/components/providers/AuthProvider';

const ROLES = [
  { value: 'farmer', label: 'Farmer' },
  { value: 'ngo', label: 'NGO' },
  { value: 'nco', label: 'NCO (Non-Commercial Org.)' },
  { value: 'company', label: 'Company / Buyer' },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      router.push(getDashboardRoute(user.role));
    }
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'farmer',
    phone: '',
    country: 'India',
    organization_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const data = await registerUser(formData);
      // Save token returned from registration and redirect to dashboard
      if (data?.access_token) {
        saveToken(data.access_token);
        await refreshUser();
      }
      const currentUser = await getCurrentUser();
      window.location.href = getDashboardRoute(currentUser?.role ?? formData.role);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const showOrgField = ['company', 'ngo', 'nco'].includes(formData.role);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl border border-slate-200"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Register for Carbon MRV
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Already have an account?{' '}
          <a href="/auth/login" className="text-green-700 font-medium hover:underline">
            Sign in
          </a>
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
        <input
          type="text"
          placeholder="Your full name"
          required
          value={formData.full_name}
          onChange={(e) => updateField('full_name', e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
        <input
          type="email"
          placeholder="you@example.com"
          required
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
        <input
          type="password"
          placeholder="Min 8 characters"
          required
          minLength={8}
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
        <select
          value={formData.role}
          onChange={(e) => updateField('role', e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
        <input
          type="tel"
          placeholder="e.g. 9876543210"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Region / Location</label>
        <input
          type="text"
          placeholder="e.g. Bihar, India"
          value={formData.country}
          onChange={(e) => updateField('country', e.target.value)}
          className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {showOrgField && (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
            <input
              type="text"
              placeholder="Your organization"
              value={formData.organization_name}
              onChange={(e) =>
                updateField('organization_name', e.target.value)
              }
              className="w-full mb-4 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-xl bg-green-700 py-3 text-white font-semibold hover:bg-green-800 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}