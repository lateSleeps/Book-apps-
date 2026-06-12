import { z } from 'zod';
import { toTRPCError } from '../../../settings/lib/errors';
import { ok } from '../../../settings/lib/result';
import * as produkPaketService from '../../../settings/services/produkpaket.service';
import { protectedProcedure, router } from '../../trpc';

// ── Input schemas ─────────────────────────────────────────────────────────────

const addonInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  price: z.number().int().min(0),
  imageUrl: z.string().nullable(),
  isActive: z.boolean().default(true),
});

const addonPatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  price: z.number().int().min(0).optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const bundleInputSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  serviceIds: z.array(z.string().uuid()).min(2),
  bundlePrice: z.number().int().min(1),
  imageUrl: z.string().nullable(),
  isActive: z.boolean().default(true),
});

const bundlePatchSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  serviceIds: z.array(z.string().uuid()).min(2).optional(),
  bundlePrice: z.number().int().min(1).optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const produkPaketRouter = router({
  getDomain: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await produkPaketService.getDomain(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  createAddOn: protectedProcedure.input(addonInputSchema).mutation(async ({ input, ctx }) => {
    try {
      const addon = await produkPaketService.createAddOn(ctx.salonId, input);
      return ok(addon);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  updateAddOn: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: addonPatchSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        await produkPaketService.updateAddOn(ctx.salonId, input.id, input.patch);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  deleteAddOn: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await produkPaketService.deleteAddOn(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  createBundle: protectedProcedure.input(bundleInputSchema).mutation(async ({ input, ctx }) => {
    try {
      const bundle = await produkPaketService.createBundle(ctx.salonId, input);
      return ok(bundle);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  updateBundle: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: bundlePatchSchema }))
    .mutation(async ({ input, ctx }) => {
      try {
        await produkPaketService.updateBundle(ctx.salonId, input.id, input.patch);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  deleteBundle: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await produkPaketService.deleteBundle(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),
});
