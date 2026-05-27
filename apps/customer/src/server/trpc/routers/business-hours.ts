import { supabase } from "@rara/database";
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

      if (error) throw error;
      return data || [];
    }),
});
