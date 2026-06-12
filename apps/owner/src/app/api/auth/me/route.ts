import { NextResponse } from 'next/server';
import type { AccessRole, User, UserAccountStatus } from '@/features/auth/types/auth.types';
import { ROLE_PERMISSIONS_MAP } from '@/features/auth/utils/role-permissions';
import { db } from '@/server/db';

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
}

const USER_COLUMNS =
  'id, salon_id, auth_user_id, name, email, role, status, staff_id, join_date, ' +
  'invited_at, last_login_at, avatar_url, phone, created_at';

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.slice(7);

  // Verify the JWT and get the auth user
  const {
    data: { user: authUser },
    error: authError,
  } = await db.auth.getUser(token);

  if (authError || !authUser) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // Fetch the salon_users row by auth_user_id
  const { data, error: dbError } = await db
    .from('salon_users')
    .select(USER_COLUMNS)
    .eq('auth_user_id', authUser.id)
    .in('status', ['ACTIVE', 'INVITED'])
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (dbError || !data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const row = data as unknown as SalonUserRow;
  const role = row.role as AccessRole;

  const currentUser: User = {
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

  // Update last_login_at without blocking the response
  void db
    .from('salon_users')
    .update({ last_login_at: new Date().toISOString(), status: 'ACTIVE' })
    .eq('id', row.id);

  return NextResponse.json(currentUser);
}
