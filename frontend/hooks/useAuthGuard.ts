'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';

export function useAuthGuard(requiredRole?: string) {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (requiredRole && user.role !== requiredRole) {
        router.push('/');
      }
    }
  }, [user, loading, requiredRole, router]);

  return { user, loading };
}