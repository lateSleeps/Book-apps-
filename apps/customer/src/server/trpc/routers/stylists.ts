import { supabase } from "@rara/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const stylistsRouter = router({
  getBySalon: publicProcedure
    .input(z.object({ salonId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from("stylists")
        .select(
          `
          *,
          user:users (
            id,
            full_name,
            role
          )
        `,
        )
        .eq("salon_id", input.salonId)
        .eq("is_active", true);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });

      return (data ?? []).map(
        (
          s: Record<string, unknown> & {
            user?: { full_name?: string; role?: string };
          },
        ) => ({
          ...s,
          name: s.user?.full_name ?? s.full_name ?? "Stylist",
          role: s.user?.role ?? s.role ?? "Stylist",
        }),
      );
    }),
});
