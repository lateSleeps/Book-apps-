'use client';

/**
 * Auth Context
 * Provides global authentication state and permission checking
 */

import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { User, AuthContextType } from '../types/auth.types';
import type { Permission } from '../types/permissions.types';
import { DEFAULT_CURRENT_USER, getMockUserById } from '../mocks/auth-mock';
import {
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
} from '../utils/permission.utils';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser = DEFAULT_CURRENT_USER }: AuthProviderProps) {
  const [currentUser, setCurrentUserState] = useState<User | null>(initialUser);

  // Initialize from localStorage if available
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Failed to load user from localStorage:', error);
    }
  }, []);

  const setCurrentUser = useCallback((user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      try {
        localStorage.setItem('currentUser', JSON.stringify(user));
      } catch (error) {
        console.error('Failed to save user to localStorage:', error);
      }
    } else {
      try {
        localStorage.removeItem('currentUser');
      } catch (error) {
        console.error('Failed to remove user from localStorage:', error);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, [setCurrentUser]);

  const switchUser = useCallback(
    (userId: string) => {
      const user = getMockUserById(userId);
      if (user) {
        setCurrentUser(user);
      }
    },
    [setCurrentUser]
  );

  const hasPermissionFn = useCallback(
    (permission: Permission) => {
      return checkPermission(currentUser, permission);
    },
    [currentUser]
  );

  const hasAnyPermissionFn = useCallback(
    (permissions: Permission[]) => {
      return checkAnyPermission(currentUser, permissions);
    },
    [currentUser]
  );

  const hasAllPermissionsFn = useCallback(
    (permissions: Permission[]) => {
      return checkAllPermissions(currentUser, permissions);
    },
    [currentUser]
  );

  const value: AuthContextType = {
    currentUser,
    loading: false,
    setCurrentUser,
    logout,
    switchUser,
    hasPermission: hasPermissionFn,
    hasAnyPermission: hasAnyPermissionFn,
    hasAllPermissions: hasAllPermissionsFn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
