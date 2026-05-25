/**
 * Permission Utilities
 * Helper functions for permission checking
 */

import type { User } from '../types/auth.types';
import type { Permission, DashboardSection } from '../types/permissions.types';
import { Permission as PermissionEnum } from '../types/permissions.types';

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
  if (!user) return false;
  return user.permissions.includes(permission);
}

/**
 * Check if a user has ANY of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
  if (!user || permissions.length === 0) return false;
  return permissions.some((permission) => user.permissions.includes(permission));
}

/**
 * Check if a user has ALL of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
  if (!user || permissions.length === 0) return true;
  return permissions.every((permission) => user.permissions.includes(permission));
}

/**
 * Check if a user can access a specific dashboard section
 * Useful for sidebar and route-level access control
 */
export function canAccessSection(user: User | null, section: DashboardSection | string): boolean {
  if (!user) return false;

  const sectionPermissions: Record<string, Permission[]> = {
    overview: [PermissionEnum.VIEW_DASHBOARD],
    bookings: [PermissionEnum.VIEW_BOOKINGS],
    schedule: [PermissionEnum.VIEW_SCHEDULE],
    clients: [PermissionEnum.VIEW_CLIENTS],
    settings: [PermissionEnum.VIEW_SETTINGS],
  };

  const requiredPermissions = sectionPermissions[section];
  if (!requiredPermissions) return false;

  return hasAnyPermission(user, requiredPermissions);
}

/**
 * Check if user can perform an action on a booking
 */
export function canManageBooking(
  user: User | null,
  action: 'view' | 'create' | 'edit' | 'cancel' | 'manage_payment'
): boolean {
  if (!user) return false;

  const actionPermissions: Record<string, Permission> = {
    view: PermissionEnum.VIEW_BOOKINGS,
    create: PermissionEnum.CREATE_BOOKING,
    edit: PermissionEnum.EDIT_BOOKING,
    cancel: PermissionEnum.CANCEL_BOOKING,
    manage_payment: PermissionEnum.MANAGE_PAYMENT,
  };

  const permission = actionPermissions[action];
  if (!permission) return false;
  return hasPermission(user, permission);
}

/**
 * Check if user can perform an action on schedule
 */
export function canManageSchedule(
  user: User | null,
  action: 'view' | 'edit' | 'manage_staff' | 'approve'
): boolean {
  if (!user) return false;

  const actionPermissions: Record<string, Permission> = {
    view: PermissionEnum.VIEW_SCHEDULE,
    edit: PermissionEnum.EDIT_SCHEDULE,
    manage_staff: PermissionEnum.MANAGE_STAFF_SCHEDULE,
    approve: PermissionEnum.APPROVE_SCHEDULE,
  };

  const permission = actionPermissions[action];
  if (!permission) return false;
  return hasPermission(user, permission);
}

/**
 * Check if user can perform an action on clients
 */
export function canManageClient(
  user: User | null,
  action: 'view' | 'create' | 'edit' | 'delete' | 'view_history'
): boolean {
  if (!user) return false;

  const actionPermissions: Record<string, Permission> = {
    view: PermissionEnum.VIEW_CLIENTS,
    create: PermissionEnum.CREATE_CLIENT,
    edit: PermissionEnum.EDIT_CLIENT,
    delete: PermissionEnum.DELETE_CLIENT,
    view_history: PermissionEnum.VIEW_CLIENT_HISTORY,
  };

  const permission = actionPermissions[action];
  if (!permission) return false;
  return hasPermission(user, permission);
}

/**
 * Check if user can perform an action on settings
 */
export function canManageSetting(
  user: User | null,
  action:
    | 'view'
    | 'edit_business_info'
    | 'manage_services'
    | 'manage_addons'
    | 'manage_staff'
    | 'manage_working_hours'
    | 'manage_policies'
    | 'manage_users'
    | 'manage_roles'
): boolean {
  if (!user) return false;

  const actionPermissions: Record<string, Permission> = {
    view: PermissionEnum.VIEW_SETTINGS,
    edit_business_info: PermissionEnum.EDIT_BUSINESS_INFO,
    manage_services: PermissionEnum.MANAGE_SERVICES,
    manage_addons: PermissionEnum.MANAGE_ADDONS,
    manage_staff: PermissionEnum.MANAGE_STAFF,
    manage_working_hours: PermissionEnum.MANAGE_WORKING_HOURS,
    manage_policies: PermissionEnum.MANAGE_POLICIES,
    manage_users: PermissionEnum.MANAGE_USERS,
    manage_roles: PermissionEnum.MANAGE_ROLES,
  };

  const permission = actionPermissions[action];
  if (!permission) return false;
  return hasPermission(user, permission);
}

/**
 * Get permission display name in Indonesian
 */
export function getPermissionDisplayName(permission: Permission): string {
  const permissionNames: Record<string, string> = {
    // Dashboard
    view_dashboard: 'Lihat Dashboard',
    view_stats: 'Lihat Statistik',

    // Bookings
    view_bookings: 'Lihat Pemesanan',
    create_booking: 'Buat Pemesanan',
    edit_booking: 'Edit Pemesanan',
    cancel_booking: 'Batalkan Pemesanan',
    manage_payment: 'Kelola Pembayaran',

    // Schedule
    view_schedule: 'Lihat Jadwal',
    edit_schedule: 'Edit Jadwal',
    manage_staff_schedule: 'Kelola Jadwal Staf',
    approve_schedule: 'Setujui Jadwal',

    // Clients
    view_clients: 'Lihat Klien',
    create_client: 'Buat Klien',
    edit_client: 'Edit Klien',
    delete_client: 'Hapus Klien',
    view_client_history: 'Lihat Riwayat Klien',

    // Settings
    view_settings: 'Lihat Pengaturan',
    edit_business_info: 'Edit Info Bisnis',
    manage_services: 'Kelola Layanan',
    manage_addons: 'Kelola Add-On',
    manage_staff: 'Kelola Staf',
    manage_working_hours: 'Kelola Jam Kerja',
    manage_policies: 'Kelola Kebijakan',

    // Admin
    manage_users: 'Kelola Pengguna',
    manage_roles: 'Kelola Peran',
    view_analytics: 'Lihat Analitik',
    export_data: 'Ekspor Data',
  };

  return permissionNames[permission] || permission;
}
