import { z } from 'zod';
import { toTRPCError } from '../../../settings/lib/errors';
import { ok } from '../../../settings/lib/result';
import * as penggunaService from '../../../settings/services/pengguna.service';
import { protectedProcedure, router } from '../../trpc';

// ── Input schemas ─────────────────────────────────────────────────────────────

const invitableRoleSchema = z.union([z.literal('ADMIN'), z.literal('MANAGER'), z.literal('STAFF')]);

// ── Router ────────────────────────────────────────────────────────────────────

export const penggunaRouter = router({
  // ── Query ───────────────────────────────────────────────────────────────────

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      return penggunaService.getUsers(ctx.salonId);
    } catch (err) {
      throw toTRPCError(err);
    }
  }),

  // ── Invite ──────────────────────────────────────────────────────────────────

  inviteUser: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2).max(200),
        email: z.string().email(),
        role: invitableRoleSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await penggunaService.inviteUser(ctx.salonId, input);
        return ok(user);
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Update role ─────────────────────────────────────────────────────────────

  updateRole: protectedProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        role: invitableRoleSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const actorId = ctx.userId ?? '';
        await penggunaService.updateRole(ctx.salonId, input.userId, input.role, actorId);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Deactivate ──────────────────────────────────────────────────────────────

  deactivateUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const actorId = ctx.userId ?? '';
        await penggunaService.deactivateUser(ctx.salonId, input.userId, actorId);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Reactivate ──────────────────────────────────────────────────────────────

  reactivateUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await penggunaService.reactivateUser(ctx.salonId, input.userId);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Revoke ──────────────────────────────────────────────────────────────────

  revokeUser: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const actorId = ctx.userId ?? '';
        await penggunaService.revokeUser(ctx.salonId, input.userId, actorId);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Resend invite ───────────────────────────────────────────────────────────

  resendInvite: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await penggunaService.resendInvite(ctx.salonId, input.userId);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),

  // ── Cancel invite ───────────────────────────────────────────────────────────

  cancelInvite: protectedProcedure
    .input(z.object({ userId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await penggunaService.cancelInvite(ctx.salonId, input.userId);
        return ok();
      } catch (err) {
        throw toTRPCError(err);
      }
    }),
});
