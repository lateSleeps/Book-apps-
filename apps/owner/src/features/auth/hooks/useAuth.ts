'use client';

/**
 * useAuth Hook
 * Custom hook to access authentication context and permission checking
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import type { User } from '../types/auth.types';
import type { Permission } from '../types/permissions.types';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

/**
 * Hook to get current user
 */
export function useCurrentUser(): User | null {
  const { currentUser } = useAuth();
  return currentUser;
}

/**
 * Hook to get current user's role
 */
export function useUserRole(): string | null {
  const currentUser = useCurrentUser();
  return currentUser?.role || null;
}

/**
 * Hook to check if user has a specific permission
 */
export function useHasPermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

/**
 * Hook to check if user has ANY of the specified permissions
 */
export function useHasAnyPermission(permissions: Permission[]): boolean {
  const { hasAnyPermission } = useAuth();
  return hasAnyPermission(permissions);
}

/**
 * Hook to check if user has ALL of the specified permissions
 */
export function useHasAllPermissions(permissions: Permission[]): boolean {
  const { hasAllPermissions } = useAuth();
  return hasAllPermissions(permissions);
}

/**
 * Hook to check if user can access a section or perform an action
 * Usage: const canManageBookings = useCanAccess('manage_bookings');
 */
export function useCanAccess(permission: Permission): boolean {
  return useHasPermission(permission);
}

/**
 * Hook to get user's permissions
 */
export function usePermissions(): Permission[] {
  const currentUser = useCurrentUser();
  return currentUser?.permissions || [];
}

/**
 * Hook to check if user is logged in
 */
export function useIsAuthenticated(): boolean {
  const currentUser = useCurrentUser();
  return currentUser !== null && currentUser !== undefined;
}

/**
 * Hook to check if user has a specific role
 */
export function useIsRole(role: string): boolean {
  const userRole = useUserRole();
  return userRole === role;
}

/**
 * Hook to check if user is owner
 */
export function useIsOwner(): boolean {
  return useIsRole('OWNER');
}

/**
 * Hook to check if user is manager or owner
 */
export function useIsManagerOrOwner(): boolean {
  const userRole = useUserRole();
  return userRole === 'OWNER' || userRole === 'MANAGER';
}
