import { z } from 'zod';
import { toTRPCError } from '../../../settings/lib/errors';
import { ok } from '../../../settings/lib/result';
import * as teamService from '../../../settings/services/team.service';
import { protectedProcedure, router } from '../../trpc';

// ── Input schemas ─────────────────────────────────────────────────────────────

const staffRoleSchema = z.union([
  z.literal('MANAGER'),
  z.literal('STYLIST'),
  z.literal('COLORIST'),
  z.literal('NAIL_ARTIST'),
  z.literal('THERAPIST'),
  z.literal('RECEPTIONIST'),
]);

const staffSpecialtySchema = z.union([
  z.literal('HAIR_STYLIST'),
  z.literal('COLORIST'),
  z.literal('NAIL_ARTIST'),
  z.literal('THERAPIST'),
]);

const leaveTypeSchema = z.union([
  z.literal('LEAVE'),
  z.literal('SICK'),
  z.literal('HOLIDAY'),
  z.literal('UNAVAILABLE'),
]);

const weekDaySchema = z.union([
  z.literal('MON'),
  z.literal('TUE'),
  z.literal('WED'),
  z.literal('THU'),
  z.literal('FRI'),
  z.literal('SAT'),
  z.literal('SUN'),
]);

const dayScheduleSchema = z.object({
  day: weekDaySchema,
  enabled: z.boolean(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const weeklyScheduleSchema = z.object({
  staffId: z.string().uuid(),
  days: z.array(dayScheduleSchema).length(7),
});

const staffInputSchema = z.object({
  fullName: z.string().min(1).max(200),
  phone: z.string().max(20).default(''),
  role: staffRoleSchema,
  specialty: staffSpecialtySchema.nullable(),
  avatarUrl: z.string().url().nullable(),
  avatarColor: z.string().min(1).max(20),
  isActive: z.boolean(),
});

const staffPatchSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  phone: z.string().max(20).optional(),
  role: staffRoleSchema.optional(),
  specialty: staffSpecialtySchema.nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  avatarColor: z.string().min(1).max(20).optional(),
  isActive: z.boolean().optional(),
});

// ── Router ────────────────────────────────────────────────────────────────────

export const teamRouter = router({
  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * Staff, assignments, schedules — bounded in size, loaded on mount.
   * Does NOT include leaves (loaded separately via getStaffLeaves).
   */
  getTeamDomain: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await teamService.getTeamDomain(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  /**
   * Leaves for one staff member. Enabled only when staffId is known.
   * Separate from getTeamDomain because leave history is unbounded.
   */
  getStaffLeaves: protectedProcedure
    .input(z.object({ staffId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      try {
        return await teamService.getStaffLeaves(ctx.salonId, input.staffId);
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Staff mutations ───────────────────────────────────────────────────────

  createStaff: protectedProcedure.input(staffInputSchema).mutation(async ({ ctx, input }) => {
    try {
      const created = await teamService.createStaff(ctx.salonId, {
        fullName: input.fullName,
        phone: input.phone,
        role: input.role,
        specialty: input.specialty,
        avatarUrl: input.avatarUrl,
        avatarColor: input.avatarColor,
        isActive: input.isActive,
      });
      return ok(created);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  updateStaff: protectedProcedure
    .input(z.object({ id: z.string().uuid(), patch: staffPatchSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        await teamService.updateStaff(ctx.salonId, input.id, input.patch);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  deactivateStaff: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await teamService.deactivateStaff(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  deleteStaff: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await teamService.deleteStaff(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Assignment mutations ──────────────────────────────────────────────────

  setAssignment: protectedProcedure
    .input(z.object({ staffId: z.string().uuid(), serviceIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        await teamService.setAssignment(ctx.salonId, input.staffId, input.serviceIds);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Schedule mutations ────────────────────────────────────────────────────

  saveScheduleForStaff: protectedProcedure
    .input(weeklyScheduleSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        await teamService.saveScheduleForStaff(ctx.salonId, input.staffId, {
          staffId: input.staffId,
          days: input.days,
        });
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Leave mutations ───────────────────────────────────────────────────────

  createLeave: protectedProcedure
    .input(
      z.object({
        staffId: z.string().uuid(),
        type: leaveTypeSchema,
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD'),
        note: z.string().max(500).default(''),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const created = await teamService.createLeave(ctx.salonId, {
          staffId: input.staffId,
          type: input.type,
          date: input.date,
          note: input.note,
        });
        return ok(created);
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  deleteLeave: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await teamService.deleteLeave(ctx.salonId, input.id);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),
});
