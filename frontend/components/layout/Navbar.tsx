'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export default function Navbar() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push('/');
  }

  function getDashboardRoute() {
    if (!user) return '/';

    switch (user.role) {
      case 'farmer':
        return '/dashboard/farmer';
      case 'company':
        return '/dashboard/company';
      case 'auditor':
        return '/dashboard/auditor';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/';
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/85 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">

        {/* Logo */}
        <Link
          href="/"
          className="text-4xl font-bold tracking-tight text-green-800"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Carbon MRV
        </Link>

        {/* Navigation */}
        <div
          className="hidden lg:flex items-center gap-10 text-[15px] font-medium text-slate-700"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          <Link href="/">Home</Link>
          <Link href="/calculator">Calculator</Link>
          <Link href="/marketplace">Marketplace</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* Right Actions */}
        <div
          className="flex items-center gap-4"
          style={{ fontFamily: 'var(--font-inter)' }}
        >
          {loading ? (
            <div className="w-32 h-10 animate-pulse bg-slate-200 rounded-full" />
          ) : !user ? (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-700 hover:text-green-700"
              >
                Login
              </Link>

              <Link
                href="/auth/register"
                className="rounded-full bg-green-700 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-green-800"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                href={getDashboardRoute()}
                className="rounded-full border border-green-700 px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
              >
                Dashboard
              </Link>

              {user.role !== 'auditor' && (
                <Link
                  href="/wallet"
                  className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Connect Wallet
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}