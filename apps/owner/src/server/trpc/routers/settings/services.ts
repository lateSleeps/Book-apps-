import { z } from 'zod';
import { toTRPCError } from '../../../settings/lib/errors';
import { ok } from '../../../settings/lib/result';
import * as servicesService from '../../../settings/services/services.service';
import { protectedProcedure, router } from '../../trpc';

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const serviceFlowSchema = z.union([
  z.literal('STYLING_HAIR'),
  z.literal('STYLING_COLOUR'),
  z.literal('STYLING_NAIL'),
  z.literal('TREATMENT'),
]);

const priceTypeSchema = z.union([z.literal('fixed'), z.literal('starting_from')]);

const questionTypeSchema = z.union([z.literal('chips'), z.literal('photo'), z.literal('text')]);

const serviceQuestionSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  label: z.string().min(1).max(300),
  type: questionTypeSchema,
  required: z.boolean(),
  options: z.array(z.string()),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
});

// ── Input schemas ─────────────────────────────────────────────────────────────

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  iconName: z.string().min(1).max(60),
  color: z.string().min(1).max(60),
  blobColor: z.string().min(1).max(20),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});

const updateCategorySchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    iconName: z.string().min(1).max(60).optional(),
    color: z.string().min(1).max(60).optional(),
    blobColor: z.string().min(1).max(20).optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
  }),
});

const createServiceSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  price: z.number().int().min(0),
  duration: z.number().int().min(1),
  priceType: priceTypeSchema,
  serviceFlow: serviceFlowSchema,
  requiresSpecialist: z.boolean(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0),
});

const updateServiceSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    categoryId: z.string().uuid().optional(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    price: z.number().int().min(0).optional(),
    duration: z.number().int().min(1).optional(),
    priceType: priceTypeSchema.optional(),
    serviceFlow: serviceFlowSchema.optional(),
    requiresSpecialist: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().min(0).optional(),
    questions: z.array(serviceQuestionSchema).optional(),
  }),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const servicesRouter = router({
  /**
   * Fetch all categories and services for this salon in one round trip.
   * Controller uses this as the single source of truth.
   */
  getServicesDomain: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await servicesService.getServicesDomain(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  // ── Category mutations ──────────────────────────────────────────────────

  createCategory: protectedProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const created = await servicesService.createCategory(
          ctx.salonId,
          {
            name: input.name,
            description: input.description,
            iconName: input.iconName,
            color: input.color,
            blobColor: input.blobColor,
            isActive: input.isActive,
          },
          input.sortOrder
        );
        return ok(created);
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  updateCategory: protectedProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await servicesService.updateCategory(ctx.salonId, input.id, input.patch);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await servicesService.deleteCategory(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Service mutations ───────────────────────────────────────────────────

  createService: protectedProcedure.input(createServiceSchema).mutation(async ({ ctx, input }) => {
    try {
      const created = await servicesService.createService(
        ctx.salonId,
        {
          categoryId: input.categoryId,
          name: input.name,
          description: input.description,
          price: input.price,
          duration: input.duration,
          priceType: input.priceType,
          serviceFlow: input.serviceFlow,
          requiresSpecialist: input.requiresSpecialist,
          isActive: input.isActive,
        },
        input.sortOrder
      );
      return ok(created);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  updateService: protectedProcedure.input(updateServiceSchema).mutation(async ({ ctx, input }) => {
    try {
      await servicesService.updateService(ctx.salonId, input.id, input.patch);
      return ok();
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  deleteService: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await servicesService.deleteService(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),
});
