'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, saveToken } from '@/services/authService';
import { getDashboardRoute } from '@/lib/roleRedirect';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, refreshUser, loading: authLoading } = useAuth();

  useEffect(() => {
    if (user && !authLoading) {
      router.push(getDashboardRoute(user.role));
    }
  }, [user, authLoading, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const loginResponse = await loginUser({
        email,
        password,
      });

      saveToken(loginResponse.access_token);
      await refreshUser();
      
      const currentUser = await import('@/services/authService').then(m => m.getCurrentUser());
      if (currentUser) {
        window.location.href = getDashboardRoute(currentUser.role);
      } else {
        window.location.href = '/';
      }
    } catch {
      setError('Invalid login credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl border border-slate-200"
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          Login to Carbon MRV
        </h1>

        {error && (
          <p className="mb-4 text-red-600 text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 rounded-xl border px-4 py-3"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 rounded-xl border px-4 py-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-700 py-3 text-white font-semibold hover:bg-green-800"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}