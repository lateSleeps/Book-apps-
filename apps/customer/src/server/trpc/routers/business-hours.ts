import { supabase } from "@rara/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const businessHoursRouter = router({
  getBySalon: publicProcedure
    .input(z.object({ salonId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from("business_hours")
        .select("*")
        .eq("salon_id", input.salonId)
        .order("day_of_week", { ascending: true });

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data || [];
    }),
});
