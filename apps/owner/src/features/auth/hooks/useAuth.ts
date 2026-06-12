'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { AccessRole, User } from '../types/auth.types';
import type { Permission } from '../types/permissions.types';

export function useAuth() {
  const ctx = useContext(AuthContext);
  return {
    currentUser: ctx?.currentUser ?? null,
    isAuthenticated: !!ctx?.currentUser,
    isLoading: ctx?.loading ?? true,
    hasPermission: (permission: Permission) => ctx?.hasPermission(permission) ?? false,
    hasAnyPermission: (permissions: Permission[]) => ctx?.hasAnyPermission(permissions) ?? false,
    hasAllPermissions: (permissions: Permission[]) => ctx?.hasAllPermissions(permissions) ?? false,
    login: async () => {},
    logout: async () => {
      await ctx?.logout();
    },
  };
}

export function useCurrentUser(): User | null {
  return useContext(AuthContext)?.currentUser ?? null;
}

export function useUserRole(): AccessRole | null {
  return useContext(AuthContext)?.currentUser?.role ?? null;
}

export function useHasPermission(permission: Permission): boolean {
  return useContext(AuthContext)?.hasPermission(permission) ?? false;
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  return useContext(AuthContext)?.hasAnyPermission(permissions) ?? false;
}

export function useHasAllPermissions(permissions: Permission[]): boolean {
  return useContext(AuthContext)?.hasAllPermissions(permissions) ?? false;
}

export function useCanAccess(permission: Permission): boolean {
  return useContext(AuthContext)?.hasPermission(permission) ?? false;
}

export function usePermissions(): Permission[] {
  return useContext(AuthContext)?.currentUser?.permissions ?? [];
}

export function useIsAuthenticated(): boolean {
  return !!useContext(AuthContext)?.currentUser;
}

export function useIsRole(role: AccessRole): boolean {
  return useContext(AuthContext)?.currentUser?.role === role;
}

export function useIsOwner(): boolean {
  return useContext(AuthContext)?.currentUser?.role === 'OWNER';
}

export function useIsManagerOrOwner(): boolean {
  const role = useContext(AuthContext)?.currentUser?.role;
  return role === 'OWNER' || role === 'MANAGER';
}
