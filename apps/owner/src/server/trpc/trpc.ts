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
 * Phase 1: salonId comes from 'x-salon-id' header sent by TRPCProvider.
 * Phase 4: replace context.ts to derive salonId from Supabase session.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.salonId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing salon context. Ensure x-salon-id header is set.',
    });
  }

  return next({
    ctx: {
      ...ctx,
      salonId: ctx.salonId, // narrowed: string (non-null)
    },
  });
});
