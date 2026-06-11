/**
 * Role Permissions Mapping
 * Defines which permissions each role has
 */

import type { Permission, RolePermissionMap } from '../types';
import { Permission as PermissionEnum } from '../types/permissions.types';

/**
 * Master access-role-to-permissions mapping.
 * OWNER   — full access including user/role management
 * ADMIN   — full operational + settings; cannot manage users/roles
 * MANAGER — bookings, schedule, clients, services, staff; no settings/users
 * STAFF   — own bookings, schedule, client history only
 */
export const ROLE_PERMISSIONS_MAP: RolePermissionMap = {
  OWNER: [
    // Dashboard
    PermissionEnum.VIEW_DASHBOARD,
    PermissionEnum.VIEW_STATS,

    // Bookings
    PermissionEnum.VIEW_BOOKINGS,
    PermissionEnum.CREATE_BOOKING,
    PermissionEnum.EDIT_BOOKING,
    PermissionEnum.CANCEL_BOOKING,
    PermissionEnum.MANAGE_PAYMENT,

    // Schedule
    PermissionEnum.VIEW_SCHEDULE,
    PermissionEnum.EDIT_SCHEDULE,
    PermissionEnum.MANAGE_STAFF_SCHEDULE,
    PermissionEnum.APPROVE_SCHEDULE,

    // Clients
    PermissionEnum.VIEW_CLIENTS,
    PermissionEnum.CREATE_CLIENT,
    PermissionEnum.EDIT_CLIENT,
    PermissionEnum.DELETE_CLIENT,
    PermissionEnum.VIEW_CLIENT_HISTORY,

    // Settings
    PermissionEnum.VIEW_SETTINGS,
    PermissionEnum.EDIT_BUSINESS_INFO,
    PermissionEnum.MANAGE_SERVICES,
    PermissionEnum.MANAGE_ADDONS,
    PermissionEnum.MANAGE_STAFF,
    PermissionEnum.MANAGE_WORKING_HOURS,
    PermissionEnum.MANAGE_POLICIES,

    // Admin
    PermissionEnum.MANAGE_USERS,
    PermissionEnum.MANAGE_ROLES,
    PermissionEnum.VIEW_ANALYTICS,
    PermissionEnum.EXPORT_DATA,
  ],

  ADMIN: [
    // Dashboard
    PermissionEnum.VIEW_DASHBOARD,
    PermissionEnum.VIEW_STATS,

    // Bookings
    PermissionEnum.VIEW_BOOKINGS,
    PermissionEnum.CREATE_BOOKING,
    PermissionEnum.EDIT_BOOKING,
    PermissionEnum.CANCEL_BOOKING,
    PermissionEnum.MANAGE_PAYMENT,

    // Schedule
    PermissionEnum.VIEW_SCHEDULE,
    PermissionEnum.EDIT_SCHEDULE,
    PermissionEnum.MANAGE_STAFF_SCHEDULE,
    PermissionEnum.APPROVE_SCHEDULE,

    // Clients
    PermissionEnum.VIEW_CLIENTS,
    PermissionEnum.CREATE_CLIENT,
    PermissionEnum.EDIT_CLIENT,
    PermissionEnum.DELETE_CLIENT,
    PermissionEnum.VIEW_CLIENT_HISTORY,

    // Settings (cannot manage users/roles)
    PermissionEnum.VIEW_SETTINGS,
    PermissionEnum.EDIT_BUSINESS_INFO,
    PermissionEnum.MANAGE_SERVICES,
    PermissionEnum.MANAGE_ADDONS,
    PermissionEnum.MANAGE_STAFF,
    PermissionEnum.MANAGE_WORKING_HOURS,
    PermissionEnum.MANAGE_POLICIES,

    PermissionEnum.VIEW_ANALYTICS,
    PermissionEnum.EXPORT_DATA,
  ],

  MANAGER: [
    // Dashboard
    PermissionEnum.VIEW_DASHBOARD,
    PermissionEnum.VIEW_STATS,

    // Bookings (full)
    PermissionEnum.VIEW_BOOKINGS,
    PermissionEnum.CREATE_BOOKING,
    PermissionEnum.EDIT_BOOKING,
    PermissionEnum.CANCEL_BOOKING,
    PermissionEnum.MANAGE_PAYMENT,

    // Schedule (full — all staff)
    PermissionEnum.VIEW_SCHEDULE,
    PermissionEnum.EDIT_SCHEDULE,
    PermissionEnum.MANAGE_STAFF_SCHEDULE,
    PermissionEnum.APPROVE_SCHEDULE,

    // Clients (full)
    PermissionEnum.VIEW_CLIENTS,
    PermissionEnum.CREATE_CLIENT,
    PermissionEnum.EDIT_CLIENT,
    PermissionEnum.DELETE_CLIENT,
    PermissionEnum.VIEW_CLIENT_HISTORY,

    // Services & staff (no salon-level settings)
    PermissionEnum.VIEW_SETTINGS,
    PermissionEnum.MANAGE_SERVICES,
    PermissionEnum.MANAGE_ADDONS,
    PermissionEnum.MANAGE_STAFF,
  ],

  STAFF: [
    // Dashboard
    PermissionEnum.VIEW_DASHBOARD,

    // Bookings (own)
    PermissionEnum.VIEW_BOOKINGS,
    PermissionEnum.CREATE_BOOKING,
    PermissionEnum.EDIT_BOOKING,

    // Schedule (own)
    PermissionEnum.VIEW_SCHEDULE,
    PermissionEnum.EDIT_SCHEDULE,

    // Clients (view)
    PermissionEnum.VIEW_CLIENTS,
    PermissionEnum.VIEW_CLIENT_HISTORY,
  ],
};

/**
 * Get all permissions for a specific role
 */
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS_MAP[role as keyof RolePermissionMap] || [];
}

/**
 * Get role display name in Indonesian
 */
export function getRoleDisplayName(role: string): string {
  const roleDisplayNames: Record<string, string> = {
    OWNER: 'Pemilik',
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    STAFF: 'Staf',
  };
  return roleDisplayNames[role] || role;
}

/**
 * Get Tailwind badge classes for a given AccessRole.
 * Returns a combined `bg-* text-*` class string using design system tokens.
 *
 * Usage: <span className={`inline-flex ... ${getRoleTokenClasses(role)}`}>
 */
export function getRoleTokenClasses(role: string): string {
  const roleClasses: Record<string, string> = {
    OWNER: 'bg-st-confirmed-bg text-st-confirmed',
    ADMIN: 'bg-st-upcoming-bg text-st-upcoming',
    MANAGER: 'bg-st-in-progress-bg text-st-in-progress',
    STAFF: 'bg-bg-control text-tx-subtle',
  };
  return roleClasses[role] ?? 'bg-bg-control text-tx-subtle';
}

/**
 * @deprecated Use getRoleTokenClasses() for badge styling.
 * Kept for DashboardSidebar avatar circle until that component is refactored.
 */
export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    OWNER: '#2563eb',
    ADMIN: '#9333ea',
    STAFF: '#6b7280',
  };
  return roleColors[role] ?? '#6b7280';
}

/**
 * @deprecated Use getRoleTokenClasses() for badge styling.
 */
export function getRoleBackgroundColor(role: string): string {
  const roleBgColors: Record<string, string> = {
    OWNER: '#eff6ff',
    ADMIN: '#faf5ff',
    STAFF: '#f9fafb',
  };
  return roleBgColors[role] ?? '#f9fafb';
}
