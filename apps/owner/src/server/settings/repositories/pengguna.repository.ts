import { db } from '../../db';
import { handleDbError } from '../lib/errors';
import type { AccessRole, User, UserAccountStatus } from '@/features/auth/types/auth.types';
import { ROLE_PERMISSIONS_MAP } from '@/features/auth/utils/role-permissions';

// ── DB row shape ──────────────────────────────────────────────────────────────

interface SalonUserRow {
  id: string;
  salon_id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  staff_id: string | null;
  join_date: string | null;
  invited_at: string | null;
  last_login_at: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

// ── Column constant ───────────────────────────────────────────────────────────

const USER_COLUMNS =
  'id, salon_id, auth_user_id, name, email, role, status, staff_id, join_date, ' +
  'invited_at, last_login_at, avatar_url, phone, created_at, updated_at';

// ── Row mapper ────────────────────────────────────────────────────────────────

function rowToUser(row: SalonUserRow): User {
  const role = row.role as AccessRole;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    permissions: ROLE_PERMISSIONS_MAP[role] ?? [],
    salonId: row.salon_id,
    isActive: row.status === 'ACTIVE',
    status: row.status as UserAccountStatus,
    joinDate: row.join_date ?? row.created_at,
    invitedAt: row.invited_at,
    lastLoginAt: row.last_login_at,
    avatarUrl: row.avatar_url,
    phone: row.phone ?? undefined,
    staffId: row.staff_id,
  };
}

// ── Exported data shapes ──────────────────────────────────────────────────────

export interface CreateInviteData {
  authUserId: string;
  name: string;
  email: string;
  role: AccessRole;
}

// ── Queries ───────────────────────────────────────────────────────────────────

export async function getUsers(salonId: string): Promise<User[]> {
  const { data, error } = await db
    .from('salon_users')
    .select(USER_COLUMNS)
    .eq('salon_id', salonId)
    .order('created_at', { ascending: true });

  if (error) throw handleDbError(error);
  return (data as unknown as SalonUserRow[]).map(rowToUser);
}

export async function getUserByAuthId(authUserId: string): Promise<User | null> {
  const { data, error } = await db
    .from('salon_users')
    .select(USER_COLUMNS)
    .eq('auth_user_id', authUserId)
    .eq('status', 'ACTIVE')
    .maybeSingle();

  if (error) throw handleDbError(error);
  if (!data) return null;
  return rowToUser(data as unknown as SalonUserRow);
}

// ── Invite ────────────────────────────────────────────────────────────────────

export async function createInvite(salonId: string, data: CreateInviteData): Promise<User> {
  const now = new Date().toISOString();
  const { data: row, error } = await db
    .from('salon_users')
    .insert({
      salon_id: salonId,
      auth_user_id: data.authUserId,
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'INVITED',
      invited_at: now,
      join_date: now,
    })
    .select(USER_COLUMNS)
    .single();

  if (error) throw handleDbError(error);
  return rowToUser(row as unknown as SalonUserRow);
}

// ── Role ──────────────────────────────────────────────────────────────────────

export async function updateRole(salonId: string, userId: string, role: AccessRole): Promise<void> {
  const { error } = await db
    .from('salon_users')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

// ── Status ────────────────────────────────────────────────────────────────────

export async function setStatus(
  salonId: string,
  userId: string,
  status: UserAccountStatus
): Promise<void> {
  const { error } = await db
    .from('salon_users')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .eq('salon_id', salonId);

  if (error) throw handleDbError(error);
}

// ── Cancel invite ─────────────────────────────────────────────────────────────

export async function cancelInvite(salonId: string, userId: string): Promise<void> {
  const { error } = await db
    .from('salon_users')
    .delete()
    .eq('id', userId)
    .eq('salon_id', salonId)
    .eq('status', 'INVITED');

  if (error) throw handleDbError(error);
}

// ── Last login ────────────────────────────────────────────────────────────────

export async function updateLastLogin(userId: string): Promise<void> {
  const { error } = await db
    .from('salon_users')
    .update({ last_login_at: new Date().toISOString(), status: 'ACTIVE' })
    .eq('id', userId);

  if (error) throw handleDbError(error);
}

// ── Get user row for resend ───────────────────────────────────────────────────

export async function getUserById(salonId: string, userId: string): Promise<User | null> {
  const { data, error } = await db
    .from('salon_users')
    .select(USER_COLUMNS)
    .eq('id', userId)
    .eq('salon_id', salonId)
    .maybeSingle();

  if (error) throw handleDbError(error);
  if (!data) return null;
  return rowToUser(data as unknown as SalonUserRow);
}
