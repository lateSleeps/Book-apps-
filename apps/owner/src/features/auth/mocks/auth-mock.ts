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
    salonId: '5cdb0848-1b43-44f6-be29-b2ead49ff65a',
    isActive: true,
    status: 'ACTIVE',
    joinDate: '2023-01-15',
    invitedAt: null,
    lastLoginAt: '2026-06-10T08:30:00.000Z',
    avatarUrl: null,
    staffId: null,
    phone: '+62812345678',
  },
  {
    id: 'admin-001',
    name: 'Rina Wijaya',
    email: 'rina@rarabeauty.com',
    role: 'ADMIN',
    permissions: ROLE_PERMISSIONS_MAP.ADMIN,
    salonId: '5cdb0848-1b43-44f6-be29-b2ead49ff65a',
    isActive: true,
    status: 'ACTIVE',
    joinDate: '2023-06-10',
    invitedAt: '2023-06-08T09:00:00.000Z',
    lastLoginAt: '2026-06-09T14:20:00.000Z',
    avatarUrl: null,
    staffId: null,
    phone: '+62812345679',
  },
  {
    id: 'staff-002',
    name: 'Luna Sari',
    email: 'luna@rarabeauty.com',
    role: 'STAFF',
    permissions: ROLE_PERMISSIONS_MAP.STAFF,
    salonId: '5cdb0848-1b43-44f6-be29-b2ead49ff65a',
    isActive: true,
    status: 'ACTIVE',
    joinDate: '2023-08-20',
    invitedAt: '2023-08-18T10:00:00.000Z',
    lastLoginAt: '2026-06-08T09:45:00.000Z',
    avatarUrl: null,
    staffId: null,
    phone: '+62812345680',
  },
  {
    id: 'staff-001',
    name: 'Maya Indah',
    email: 'maya@rarabeauty.com',
    role: 'STAFF',
    permissions: ROLE_PERMISSIONS_MAP.STAFF,
    salonId: '5cdb0848-1b43-44f6-be29-b2ead49ff65a',
    isActive: true,
    status: 'ACTIVE',
    joinDate: '2024-01-05',
    invitedAt: '2024-01-03T11:00:00.000Z',
    lastLoginAt: '2026-06-07T16:10:00.000Z',
    avatarUrl: null,
    staffId: null,
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
