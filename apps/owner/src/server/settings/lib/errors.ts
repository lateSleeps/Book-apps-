import { TRPCError } from '@trpc/server';

// ── Repository Layer ──────────────────────────────────────────────────────────

/**
 * Thrown by repository functions when a Supabase query fails.
 * Wraps the raw Supabase error so upper layers don't import Supabase types.
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'RepositoryError';
  }
}

/**
 * Wrap a Supabase error object into a RepositoryError.
 * Use at the end of every repository function:
 *
 *   const { data, error } = await db.from('...').select();
 *   if (error) throw handleDbError(error);
 */
export function handleDbError(error: { code?: string; message: string }): RepositoryError {
  return new RepositoryError(error.message, error.code ?? 'UNKNOWN', error);
}

// ── Service Layer ─────────────────────────────────────────────────────────────

/**
 * Thrown by service functions when a business rule is violated.
 * Examples: "salon policy exceeds 500 characters", "payment methods cannot be empty".
 *
 * field — optional, names the invalid field for the UI to highlight.
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// ── tRPC conversion ───────────────────────────────────────────────────────────

// Postgres error codes → tRPC error codes
const PG_CODE_MAP: Record<string, ConstructorParameters<typeof TRPCError>[0]['code']> = {
  PGRST116: 'NOT_FOUND', // PostgREST: no rows returned
  '23505': 'CONFLICT', // unique violation
  '23503': 'BAD_REQUEST', // foreign key violation
  '42501': 'FORBIDDEN', // insufficient privilege
  '42P01': 'INTERNAL_SERVER_ERROR', // undefined table
};

/**
 * Convert any caught error into a TRPCError.
 * Use this in tRPC router procedures to provide consistent error shapes:
 *
 *   try {
 *     return await myService.doSomething();
 *   } catch (err) {
 *     throw toTRPCError(err);
 *   }
 */
export function toTRPCError(err: unknown): TRPCError {
  if (err instanceof TRPCError) return err;

  if (err instanceof ServiceError) {
    return new TRPCError({
      code: 'BAD_REQUEST',
      message: err.message,
    });
  }

  if (err instanceof RepositoryError) {
    const code = PG_CODE_MAP[err.code] ?? 'INTERNAL_SERVER_ERROR';
    return new TRPCError({ code, message: err.message, cause: err.cause });
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  return new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message });
}
