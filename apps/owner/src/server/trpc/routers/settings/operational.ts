import { z } from 'zod';
import { toTRPCError } from '../../../settings/lib/errors';
import { ok } from '../../../settings/lib/result';
import * as operationalService from '../../../settings/services/operational.service';
import { protectedProcedure, router } from '../../trpc';

// ── Input schemas ─────────────────────────────────────────────────────────────

const dayOfWeekSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

const timeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Format waktu harus HH:mm')
  .nullable();

const businessHoursDaySchema = z.object({
  dayOfWeek: dayOfWeekSchema,
  isClosed: z.boolean(),
  openTime: timeSchema,
  closeTime: timeSchema,
});

// ── Router ────────────────────────────────────────────────────────────────────

export const operationalRouter = router({
  /**
   * Fetch business hours for the authenticated salon.
   * Returns DEFAULT_BUSINESS_HOURS when no rows exist (first-time setup).
   */
  getBusinessHours: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await operationalService.getBusinessHours(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  /**
   * Persist all 7 business hours rows for the authenticated salon.
   * Validates times before writing (service layer).
   */
  upsertBusinessHours: protectedProcedure
    .input(
      z.object({
        hours: z.array(businessHoursDaySchema).length(7, 'Harus ada tepat 7 hari'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await operationalService.upsertBusinessHours(ctx.salonId, input.hours);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),
});
