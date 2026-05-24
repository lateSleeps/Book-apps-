/**
 * Authentication Types
 * User, role, and auth-related type definitions
 */

import type { Permission } from './permissions.types';

export type UserRole = 'OWNER' | 'MANAGER' | 'STYLIST' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  salonId: string;
  isActive: boolean;
  joinDate: string;
  avatar?: string;
  phone?: string;
}

export type RolePermissionMap = Record<UserRole, Permission[]>;

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  switchUser: (userId: string) => void; // For testing/demo purposes
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}
