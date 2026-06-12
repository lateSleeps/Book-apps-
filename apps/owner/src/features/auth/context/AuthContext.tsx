'use client';

import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthContextType } from '../types/auth.types';
import type { Permission } from '../types/permissions.types';
import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
} from '../utils/permission.utils';
import { supabaseBrowser } from '@/lib/supabase-browser';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

async function fetchUserProfile(accessToken: string): Promise<User | null> {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return (await res.json()) as User;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    // Keep localStorage in sync so TRPCProvider can read the user data if needed
    try {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } else {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authAccessToken');
      }
    } catch {
      // localStorage unavailable in some environments — safe to ignore
    }
  }, []);

  useEffect(() => {
    // Load initial session
    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        // Store the raw access token so TRPCProvider can send it as Bearer header
        try {
          localStorage.setItem('authAccessToken', session.access_token);
        } catch {
          /* ignore */
        }
        const user = await fetchUserProfile(session.access_token);
        setCurrentUser(user);
      }
      setLoading(false);
    });

    // Subscribe to subsequent auth changes
    const {
      data: { subscription },
    } = supabaseBrowser.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        try {
          localStorage.setItem('authAccessToken', session.access_token);
        } catch {
          /* ignore */
        }
        const user = await fetchUserProfile(session.access_token);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  const logout = useCallback(async () => {
    await supabaseBrowser.auth.signOut();
    setCurrentUser(null);
  }, [setCurrentUser]);

  // switchUser kept for dev convenience — triggers only when explicitly called
  const switchUser = useCallback((_userId: string) => {
    // No-op in production. Use Supabase Auth sign-in flow.
  }, []);

  const hasPermissionFn = useCallback(
    (permission: Permission) => checkPermission(currentUser, permission),
    [currentUser]
  );

  const hasAnyPermissionFn = useCallback(
    (permissions: Permission[]) => checkAnyPermission(currentUser, permissions),
    [currentUser]
  );

  const hasAllPermissionsFn = useCallback(
    (permissions: Permission[]) => checkAllPermissions(currentUser, permissions),
    [currentUser]
  );

  const value: AuthContextType = {
    currentUser,
    loading,
    setCurrentUser,
    logout,
    switchUser,
    hasPermission: hasPermissionFn,
    hasAnyPermission: hasAnyPermissionFn,
    hasAllPermissions: hasAllPermissionsFn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
