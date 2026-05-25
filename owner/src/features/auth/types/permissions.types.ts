/**
 * Permission Types
 * Granular permission definitions for role-based access control
 */

export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_STATS = 'view_stats',

  // Bookings
  VIEW_BOOKINGS = 'view_bookings',
  CREATE_BOOKING = 'create_booking',
  EDIT_BOOKING = 'edit_booking',
  CANCEL_BOOKING = 'cancel_booking',
  MANAGE_PAYMENT = 'manage_payment',

  // Schedule
  VIEW_SCHEDULE = 'view_schedule',
  EDIT_SCHEDULE = 'edit_schedule',
  MANAGE_STAFF_SCHEDULE = 'manage_staff_schedule',
  APPROVE_SCHEDULE = 'approve_schedule',

  // Clients
  VIEW_CLIENTS = 'view_clients',
  CREATE_CLIENT = 'create_client',
  EDIT_CLIENT = 'edit_client',
  DELETE_CLIENT = 'delete_client',
  VIEW_CLIENT_HISTORY = 'view_client_history',

  // Settings
  VIEW_SETTINGS = 'view_settings',
  EDIT_BUSINESS_INFO = 'edit_business_info',
  MANAGE_SERVICES = 'manage_services',
  MANAGE_ADDONS = 'manage_addons',
  MANAGE_STAFF = 'manage_staff',
  MANAGE_WORKING_HOURS = 'manage_working_hours',
  MANAGE_POLICIES = 'manage_policies',

  // Admin
  MANAGE_USERS = 'manage_users',
  MANAGE_ROLES = 'manage_roles',
  VIEW_ANALYTICS = 'view_analytics',
  EXPORT_DATA = 'export_data',
}

export type PermissionString = `${Permission}`;

// Dashboard sections for easier permission checks
export enum DashboardSection {
  OVERVIEW = 'overview',
  BOOKINGS = 'bookings',
  SCHEDULE = 'schedule',
  CLIENTS = 'clients',
  SETTINGS = 'settings',
}
