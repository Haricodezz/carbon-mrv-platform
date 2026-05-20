'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import { getDashboardRoute } from '@/lib/roleRedirect';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else {
        router.replace(getDashboardRoute(user.role));
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-600">
      Redirecting to your dashboard…
    </div>
  );
}
