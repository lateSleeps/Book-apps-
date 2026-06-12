/**
 * Authentication Types
 * User, role, and auth-related type definitions
 */

import type { Permission } from './permissions.types';

export type UserRole = 'OWNER' | 'MANAGER' | 'STYLIST' | 'STAFF';

/**
 * Access tier hierarchy (highest → lowest):
 * OWNER   = full access (salon owner, cannot be invited)
 * ADMIN   = full operational + settings access, cannot manage users
 * MANAGER = operational access: bookings, schedule, staff, services
 * STAFF   = own bookings and schedule only
 */
export type AccessRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF';

export type UserAccountStatus = 'ACTIVE' | 'INVITED' | 'INACTIVE' | 'REVOKED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: AccessRole;
  permissions: Permission[];
  salonId: string;
  /** @deprecated derive from status === 'ACTIVE' once Supabase Auth lands */
  isActive: boolean;
  status: UserAccountStatus;
  /** ISO date of account creation / invite send */
  joinDate: string;
  invitedAt?: string | null;
  lastLoginAt?: string | null;
  /** URL to uploaded avatar photo. Null falls back to initials. */
  avatarUrl?: string | null;
  /** @deprecated replaced by avatarUrl */
  avatar?: string;
  phone?: string;
  /** FK to StaffMember.id — null for OWNER accounts with no staff record */
  staffId?: string | null;
}

export type RolePermissionMap = Record<AccessRole, Permission[]>;

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  setCurrentUser: (user: User | null) => void;
  logout: () => Promise<void>;
  switchUser: (userId: string) => void; // For testing/demo purposes
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}
