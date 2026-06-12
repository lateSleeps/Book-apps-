import { TRPCError, initTRPC } from '@trpc/server';
import superjson from 'superjson';
import type { TRPCContext } from './context';

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;

/**
 * publicProcedure — no auth required.
 * Used by all existing routers (bookings, salons, services, etc.).
 * Kept untouched to avoid breaking changes.
 */
export const publicProcedure = t.procedure;

/**
 * protectedProcedure — requires salonId in context.
 *
 * Throws UNAUTHORIZED if salonId is missing.
 * Narrows ctx.salonId from string | null to string for downstream use.
 *
 * salonId is derived from the verified Supabase JWT in context.ts.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.salonId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing salon context. Authorization token missing or invalid.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      salonId: ctx.salonId, // narrowed: string (non-null)
    },
  });
});
