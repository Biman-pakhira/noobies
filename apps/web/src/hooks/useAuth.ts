'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    // Ensure auth is checked on mount
    checkAuth().catch(() => {});
  }, [checkAuth]);

  return { user, isLoading, isAuthenticated, logout, checkAuth };
}
