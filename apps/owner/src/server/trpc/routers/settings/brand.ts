import { z } from 'zod';
import { toTRPCError } from '../../../settings/lib/errors';
import { ok } from '../../../settings/lib/result';
import * as brandService from '../../../settings/services/brand.service';
import { protectedProcedure, router } from '../../trpc';

// ── Input schemas ─────────────────────────────────────────────────────────────

// media.logoUrl / coverImageUrl accepted as null or https URL.
// Blob URLs are rejected here — the controller must strip them before calling.
const mediaUrlSchema = z
  .string()
  .url('URL media harus berformat URL yang valid.')
  .refine((v) => v.startsWith('https://'), 'URL media harus diawali https://')
  .nullable();

const brandProfileSchema = z.object({
  identity: z.object({
    salonName: z.string().min(1, 'Nama salon tidak boleh kosong.').max(100),
    tagline: z.string().max(200),
    description: z.string().max(1000),
  }),
  media: z.object({
    logoUrl: mediaUrlSchema,
    coverImageUrl: mediaUrlSchema,
  }),
  contact: z.object({
    phone: z.string().max(20),
    whatsapp: z.string().max(20),
    // email: valid address or empty string
    email: z.union([z.string().email('Format email tidak valid.'), z.literal('')]),
    // website: https URL or empty string
    website: z.union([
      z.string().regex(/^https:\/\//, 'Website harus diawali https://.'),
      z.literal(''),
    ]),
  }),
  social: z.object({
    instagram: z.string().max(100),
    tiktok: z.string().max(100),
    facebook: z.string().max(100),
  }),
  location: z.object({
    address: z.string().max(500),
    city: z.string().max(100),
    // mapsUrl: https URL or empty string
    mapsUrl: z.union([
      z.string().regex(/^https:\/\//, 'Google Maps URL harus diawali https://.'),
      z.literal(''),
    ]),
  }),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const brandRouter = router({
  /**
   * Fetch brand profile for the authenticated salon.
   * Returns empty defaults when no data exists yet (new salon).
   */
  getBrandProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await brandService.getBrandProfile(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  /**
   * Persist all brand profile fields in one UPDATE.
   * media.logoUrl and coverImageUrl must be null or an https:// URL.
   * Blob URLs (pending uploads) are rejected by Zod schema validation.
   */
  updateBrandProfile: protectedProcedure
    .input(brandProfileSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await brandService.updateBrandProfile(ctx.salonId, input);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  /**
   * Update only logo_url — called after upload completes (Sprint 4)
   * or when owner removes the logo (url = null).
   */
  updateLogoUrl: protectedProcedure
    .input(z.object({ url: mediaUrlSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        await brandService.updateLogoUrl(ctx.salonId, input.url);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  /**
   * Update only cover_image_url — called after upload completes (Sprint 4)
   * or when owner removes the cover (url = null).
   */
  updateCoverUrl: protectedProcedure
    .input(z.object({ url: mediaUrlSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        await brandService.updateCoverUrl(ctx.salonId, input.url);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),
});
