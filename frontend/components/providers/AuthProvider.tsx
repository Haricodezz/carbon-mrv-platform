'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, getToken, logoutUser } from '@/services/authService';
import type { AuthUser } from '@/types/user';
import { deferEffectTask } from '@/lib/deferEffect';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  useEffect(() => {
    return deferEffectTask(() => {
      void refreshUser();
    });
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
