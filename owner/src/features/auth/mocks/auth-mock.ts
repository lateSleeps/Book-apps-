/**
 * Mock Authentication Data
 * Mock users for testing and demonstration purposes
 * Replace with real database queries in production
 */

import type { User } from '../types/auth.types';
import { ROLE_PERMISSIONS_MAP } from '../utils/role-permissions';

/**
 * Mock users for Rara Beauty salon
 */
export const MOCK_USERS: User[] = [
  {
    id: 'owner-001',
    name: 'Rara Kusuma',
    email: 'rara@rarabeauty.com',
    role: 'OWNER',
    permissions: ROLE_PERMISSIONS_MAP.OWNER,
    salonId: 'salon-001',
    isActive: true,
    joinDate: '2023-01-15',
    avatar: '👑',
    phone: '+62812345678',
  },
  {
    id: 'manager-001',
    name: 'Rina Wijaya',
    email: 'rina@rarabeauty.com',
    role: 'MANAGER',
    permissions: ROLE_PERMISSIONS_MAP.MANAGER,
    salonId: 'salon-001',
    isActive: true,
    joinDate: '2023-06-10',
    avatar: '💼',
    phone: '+62812345679',
  },
  {
    id: 'stylist-001',
    name: 'Luna Sari',
    email: 'luna@rarabeauty.com',
    role: 'STYLIST',
    permissions: ROLE_PERMISSIONS_MAP.STYLIST,
    salonId: 'salon-001',
    isActive: true,
    joinDate: '2023-08-20',
    avatar: '✨',
    phone: '+62812345680',
  },
  {
    id: 'staff-001',
    name: 'Maya Indah',
    email: 'maya@rarabeauty.com',
    role: 'STAFF',
    permissions: ROLE_PERMISSIONS_MAP.STAFF,
    salonId: 'salon-001',
    isActive: true,
    joinDate: '2024-01-05',
    avatar: '🎨',
    phone: '+62812345681',
  },
];

/**
 * Default current user (Owner - for testing with full permissions)
 * Change this to test different roles
 */
export const DEFAULT_CURRENT_USER: User = MOCK_USERS[0]!;

/**
 * Get a mock user by ID
 */
export function getMockUserById(userId: string): User | undefined {
  return MOCK_USERS.find((user) => user.id === userId);
}

/**
 * Get a mock user by role
 */
export function getMockUserByRole(role: string): User | undefined {
  return MOCK_USERS.find((user) => user.role === role);
}

/**
 * Get all mock users (for user management UI)
 */
export function getAllMockUsers(): User[] {
  return MOCK_USERS;
}
