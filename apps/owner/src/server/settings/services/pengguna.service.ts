import { db } from '../../db';
import { ServiceError } from '../lib/errors';
import * as penggunaRepo from '../repositories/pengguna.repository';
import type { AccessRole, User } from '@/features/auth/types/auth.types';

// ── Re-exports ────────────────────────────────────────────────────────────────

export type InvitableRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface InviteUserInput {
  name: string;
  email: string;
  role: InvitableRole;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getUsers(salonId: string): Promise<User[]> {
  return penggunaRepo.getUsers(salonId);
}

// ── Invite ────────────────────────────────────────────────────────────────────

export async function inviteUser(salonId: string, input: InviteUserInput): Promise<User> {
  const name = input.name.trim();
  if (name.length < 2) {
    throw new ServiceError('Nama minimal 2 karakter.', 'INVITE_NAME_TOO_SHORT', 'name');
  }

  // Send Supabase Auth invite — requires service role key
  const { data: authData, error: authError } = await db.auth.admin.inviteUserByEmail(input.email, {
    data: { name, salonId, role: input.role },
  });

  if (authError) {
    throw new ServiceError(
      authError.message ?? 'Gagal mengirim undangan.',
      'INVITE_AUTH_FAILED',
      'email'
    );
  }

  // Insert salon_users row
  return penggunaRepo.createInvite(salonId, {
    authUserId: authData.user.id,
    name,
    email: input.email.trim().toLowerCase(),
    role: input.role as AccessRole,
  });
}

// ── Update role ───────────────────────────────────────────────────────────────

export async function updateRole(
  salonId: string,
  userId: string,
  role: InvitableRole,
  actorId: string
): Promise<void> {
  if (userId === actorId) {
    throw new ServiceError('Tidak dapat mengubah peran akun sendiri.', 'UPDATE_ROLE_SELF');
  }
  return penggunaRepo.updateRole(salonId, userId, role as AccessRole);
}

// ── Deactivate ────────────────────────────────────────────────────────────────

export async function deactivateUser(
  salonId: string,
  userId: string,
  actorId: string
): Promise<void> {
  if (userId === actorId) {
    throw new ServiceError('Tidak dapat menonaktifkan akun sendiri.', 'DEACTIVATE_SELF');
  }
  return penggunaRepo.setStatus(salonId, userId, 'INACTIVE');
}

// ── Reactivate ────────────────────────────────────────────────────────────────

export async function reactivateUser(salonId: string, userId: string): Promise<void> {
  return penggunaRepo.setStatus(salonId, userId, 'ACTIVE');
}

// ── Revoke ────────────────────────────────────────────────────────────────────

export async function revokeUser(salonId: string, userId: string, actorId: string): Promise<void> {
  if (userId === actorId) {
    throw new ServiceError('Tidak dapat mencabut akses akun sendiri.', 'REVOKE_SELF');
  }
  return penggunaRepo.setStatus(salonId, userId, 'REVOKED');
}

// ── Resend invite ─────────────────────────────────────────────────────────────

export async function resendInvite(salonId: string, userId: string): Promise<void> {
  const user = await penggunaRepo.getUserById(salonId, userId);
  if (!user) {
    throw new ServiceError('Pengguna tidak ditemukan.', 'RESEND_USER_NOT_FOUND');
  }
  if (user.status !== 'INVITED') {
    throw new ServiceError(
      'Hanya undangan yang belum diterima yang dapat dikirim ulang.',
      'RESEND_NOT_INVITED'
    );
  }

  const { error } = await db.auth.admin.inviteUserByEmail(user.email, {
    data: { name: user.name, salonId, role: user.role },
  });

  if (error) {
    throw new ServiceError(error.message ?? 'Gagal mengirim ulang undangan.', 'RESEND_AUTH_FAILED');
  }
}

// ── Cancel invite ─────────────────────────────────────────────────────────────

export async function cancelInvite(salonId: string, userId: string): Promise<void> {
  return penggunaRepo.cancelInvite(salonId, userId);
}
