import { z } from 'zod';
import { toTRPCError } from '../../../settings/lib/errors';
import { ok } from '../../../settings/lib/result';
import * as bookingAppService from '../../../settings/services/booking-app.service';
import { protectedProcedure, router } from '../../trpc';

// ── Input schemas ─────────────────────────────────────────────────────────────

const paymentMethodSchema = z.union([z.literal('qris'), z.literal('transfer'), z.literal('cash')]);

const confirmationModeSchema = z.union([z.literal('auto'), z.literal('manual')]);

const bankAccountPatchSchema = z.object({
  bankName: z.string().min(1).max(100).optional(),
  accountNumber: z.string().min(1).max(50).optional(),
  accountHolderName: z.string().min(1).max(200).optional(),
  isActive: z.boolean().optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const bookingAppRouter = router({
  /**
   * Fetch all Booking App settings — salons columns + bank_accounts list.
   * Single query used by all four sections of the controller.
   */
  getBookingAppSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await bookingAppService.getBookingAppSettings(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  // ── Payment methods ─────────────────────────────────────────────────────

  setPaymentMethods: protectedProcedure
    .input(z.object({ methods: z.array(paymentMethodSchema).min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await bookingAppService.setPaymentMethods(ctx.salonId, input.methods);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  /**
   * Persist a QRIS image URL.
   * null = explicit removal.
   * https:// = valid URL from Sprint 4 upload flow.
   * Blob URLs must NOT be passed here — controller strips them before calling.
   */
  setQrisImageUrl: protectedProcedure
    .input(
      z.object({
        url: z
          .string()
          .url()
          .refine((v) => v.startsWith('https://'), 'URL harus diawali https://')
          .nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await bookingAppService.setQrisImageUrl(ctx.salonId, input.url);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Confirmation mode ───────────────────────────────────────────────────

  setConfirmationMode: protectedProcedure
    .input(z.object({ mode: confirmationModeSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        await bookingAppService.setConfirmationMode(ctx.salonId, input.mode);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Salon policy ────────────────────────────────────────────────────────

  setSalonPolicy: protectedProcedure
    .input(z.object({ policy: z.string().max(500).nullable() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await bookingAppService.setSalonPolicy(ctx.salonId, input.policy);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Bank accounts ────────────────────────────────────────────────────────

  addBankAccount: protectedProcedure
    .input(
      z.object({
        bankName: z.string().min(1).max(100),
        accountNumber: z.string().min(1).max(50),
        accountHolderName: z.string().min(1).max(200),
        isActive: z.boolean(),
        sortOrder: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const created = await bookingAppService.addBankAccount(
          ctx.salonId,
          {
            bankName: input.bankName,
            accountNumber: input.accountNumber,
            accountHolderName: input.accountHolderName,
            isActive: input.isActive,
          },
          input.sortOrder
        );
        return ok(created);
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  updateBankAccount: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: bankAccountPatchSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        await bookingAppService.updateBankAccount(ctx.salonId, input.id, input.patch);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  removeBankAccount: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await bookingAppService.removeBankAccount(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),
});
