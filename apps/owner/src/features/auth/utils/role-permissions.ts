/**
 * Role Permissions Mapping
 * Defines which permissions each role has
 */

import type { Permission, RolePermissionMap } from '../types';
import { Permission as PermissionEnum } from '../types/permissions.types';

/**
 * Master role-to-permissions mapping
 * OWNER has all permissions
 * MANAGER has all except user/role management
 * STYLIST has limited permissions (own schedule, bookings, clients)
 * STAFF has view-only permissions
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

  MANAGER: [
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

    // Admin (MANAGER cannot manage users/roles)
    PermissionEnum.VIEW_ANALYTICS,
    PermissionEnum.EXPORT_DATA,
  ],

  STYLIST: [
    // Dashboard (view only)
    PermissionEnum.VIEW_DASHBOARD,

    // Bookings (own only)
    PermissionEnum.VIEW_BOOKINGS,
    PermissionEnum.CREATE_BOOKING,
    PermissionEnum.EDIT_BOOKING,

    // Schedule (own only)
    PermissionEnum.VIEW_SCHEDULE,
    PermissionEnum.EDIT_SCHEDULE,

    // Clients (view and limited edit)
    PermissionEnum.VIEW_CLIENTS,
    PermissionEnum.VIEW_CLIENT_HISTORY,
  ],

  STAFF: [
    // Dashboard (view only)
    PermissionEnum.VIEW_DASHBOARD,

    // Bookings (view only)
    PermissionEnum.VIEW_BOOKINGS,

    // Schedule (view only, own)
    PermissionEnum.VIEW_SCHEDULE,

    // Clients (view only)
    PermissionEnum.VIEW_CLIENTS,
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
    MANAGER: 'Manajer',
    STYLIST: 'Stylist',
    STAFF: 'Staf',
  };
  return roleDisplayNames[role] || role;
}

/**
 * Get role color for UI display
 */
export function getRoleColor(role: string): string {
  const roleColors: Record<string, string> = {
    OWNER: '#2563eb', // blue
    MANAGER: '#9333ea', // purple
    STYLIST: '#16a34a', // green
    STAFF: '#6b7280', // gray
  };
  return roleColors[role] || '#6b7280';
}

/**
 * Get role background color for badges
 */
export function getRoleBackgroundColor(role: string): string {
  const roleBgColors: Record<string, string> = {
    OWNER: '#eff6ff',
    MANAGER: '#faf5ff',
    STYLIST: '#f0fdf4',
    STAFF: '#f9fafb',
  };
  return roleBgColors[role] || '#f9fafb';
}
