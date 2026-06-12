import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { db } from '../db';

/**
 * tRPC request context.
 *
 * salonId and userId are derived from the verified Supabase JWT in the
 * Authorization header. The x-salon-id / x-user-id headers are no longer
 * trusted — any client can forge them.
 *
 * Flow:
 *   1. Read Authorization: Bearer <token>
 *   2. db.auth.getUser(token) — verify JWT server-side (service role)
 *   3. SELECT salon_users WHERE auth_user_id = authUser.id AND status IN ('ACTIVE','INVITED')
 *   4. Return real salonId + salon_users.id as userId
 *
 * Both fields are null when the token is missing, invalid, or the user has
 * no active salon_users row. protectedProcedure throws UNAUTHORIZED in that case.
 */
export interface TRPCContext {
  salonId: string | null;
  userId: string | null;
}

interface SalonUserIdRow {
  id: string;
  salon_id: string;
}

export async function createContext(opts: CreateNextContextOptions): Promise<TRPCContext> {
  const authHeader = (opts.req.headers['authorization'] as string | undefined) ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    return { salonId: null, userId: null };
  }

  const token = authHeader.slice(7);

  const {
    data: { user: authUser },
    error: authError,
  } = await db.auth.getUser(token);
  if (authError || !authUser) {
    return { salonId: null, userId: null };
  }

  const { data, error: dbError } = await db
    .from('salon_users')
    .select('id, salon_id')
    .eq('auth_user_id', authUser.id)
    .in('status', ['ACTIVE', 'INVITED'])
    .limit(1)
    .maybeSingle();

  if (dbError || !data) {
    return { salonId: null, userId: null };
  }

  const row = data as unknown as SalonUserIdRow;
  return {
    salonId: row.salon_id,
    userId: row.id,
  };
}
