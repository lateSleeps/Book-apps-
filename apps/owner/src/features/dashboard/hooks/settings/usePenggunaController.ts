'use client';

import { useCallback, useState } from 'react';
import type { AccessRole, User, UserAccountStatus } from '@/features/auth/types/auth.types';
import { ROLE_PERMISSIONS_MAP } from '@/features/auth/utils/role-permissions';

// ── Mock seed ─────────────────────────────────────────────────────────────────

const CURRENT_USER_ID = 'owner-001';

const SEED_USERS: User[] = [
  {
    id: 'owner-001',
    name: 'Rara Kusuma',
    email: 'rara@rarabeauty.com',
    role: 'OWNER',
    permissions: ROLE_PERMISSIONS_MAP.OWNER,
    salonId: 'salon-001',
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
    salonId: 'salon-001',
    isActive: true,
    status: 'ACTIVE',
    joinDate: '2023-06-10',
    invitedAt: '2023-06-08T09:00:00.000Z',
    lastLoginAt: '2026-06-09T14:20:00.000Z',
    avatarUrl: null,
    staffId: 'sty-3',
    phone: '+62812345679',
  },
  {
    id: 'manager-001',
    name: 'Siti Aminah',
    email: 'siti@rarabeauty.com',
    role: 'MANAGER',
    permissions: ROLE_PERMISSIONS_MAP.MANAGER,
    salonId: 'salon-001',
    isActive: true,
    status: 'ACTIVE',
    joinDate: '2024-02-01',
    invitedAt: '2024-01-30T10:00:00.000Z',
    lastLoginAt: '2026-06-10T11:00:00.000Z',
    avatarUrl: null,
    staffId: 'sty-4',
    phone: '+62812345681',
  },
  {
    id: 'staff-002',
    name: 'Luna Sari',
    email: 'luna@rarabeauty.com',
    role: 'STAFF',
    permissions: ROLE_PERMISSIONS_MAP.STAFF,
    salonId: 'salon-001',
    isActive: true,
    status: 'ACTIVE',
    joinDate: '2023-08-20',
    invitedAt: '2023-08-18T10:00:00.000Z',
    lastLoginAt: '2026-06-08T09:45:00.000Z',
    avatarUrl: null,
    staffId: 'sty-1',
    phone: '+62812345680',
  },
  {
    id: 'invited-001',
    name: 'Dewi Rahayu',
    email: 'dewi@rarabeauty.com',
    role: 'STAFF',
    permissions: ROLE_PERMISSIONS_MAP.STAFF,
    salonId: 'salon-001',
    isActive: false,
    status: 'INVITED',
    joinDate: '2026-06-09',
    invitedAt: '2026-06-09T10:00:00.000Z',
    lastLoginAt: null,
    avatarUrl: null,
    staffId: 'sty-1',
  },
  {
    id: 'inactive-001',
    name: 'Budi Santoso',
    email: 'budi@rarabeauty.com',
    role: 'STAFF',
    permissions: ROLE_PERMISSIONS_MAP.STAFF,
    salonId: 'salon-001',
    isActive: false,
    status: 'INACTIVE',
    joinDate: '2022-11-01',
    invitedAt: '2022-10-30T08:00:00.000Z',
    lastLoginAt: '2025-12-15T10:00:00.000Z',
    avatarUrl: null,
    staffId: null,
  },
];

// ── Types ─────────────────────────────────────────────────────────────────────

export type InvitableRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface InviteUserDraft {
  name: string;
  email: string;
  role: InvitableRole;
}

export interface PenggunaController {
  users: User[];
  currentUserId: string;

  inviteUser: (draft: InviteUserDraft) => void;
  updateRole: (userId: string, role: AccessRole) => void;
  deactivateUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  revokeUser: (userId: string) => void;
  deleteUser: (userId: string) => void;
  resendInvite: (userId: string) => void;
  cancelInvite: (userId: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function usePenggunaController(): PenggunaController {
  const [users, setUsers] = useState<User[]>(SEED_USERS);

  function nextId() {
    return `user-${Date.now()}`;
  }

  function patchUser(id: string, patch: Partial<User>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function patchStatus(id: string, status: UserAccountStatus) {
    patchUser(id, { status, isActive: status === 'ACTIVE' });
  }

  const inviteUser = useCallback((draft: InviteUserDraft) => {
    const newUser: User = {
      id: nextId(),
      name: draft.name,
      email: draft.email,
      role: draft.role,
      permissions: ROLE_PERMISSIONS_MAP[draft.role],
      salonId: 'salon-001',
      isActive: false,
      status: 'INVITED',
      joinDate: new Date().toISOString().slice(0, 10),
      invitedAt: new Date().toISOString(),
      lastLoginAt: null,
      avatarUrl: null,
      staffId: null,
    };
    setUsers((prev) => [...prev, newUser]);
  }, []);

  const updateRole = useCallback((userId: string, role: AccessRole) => {
    patchUser(userId, { role, permissions: ROLE_PERMISSIONS_MAP[role] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deactivateUser = useCallback((userId: string) => {
    patchStatus(userId, 'INACTIVE');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reactivateUser = useCallback((userId: string) => {
    patchStatus(userId, 'ACTIVE');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revokeUser = useCallback((userId: string) => {
    patchStatus(userId, 'REVOKED');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const resendInvite = useCallback((userId: string) => {
    patchUser(userId, { invitedAt: new Date().toISOString() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancelInvite = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  return {
    users,
    currentUserId: CURRENT_USER_ID,
    inviteUser,
    updateRole,
    deactivateUser,
    reactivateUser,
    revokeUser,
    deleteUser,
    resendInvite,
    cancelInvite,
  };
}
