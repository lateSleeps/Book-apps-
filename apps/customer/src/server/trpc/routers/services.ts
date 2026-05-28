import { supabase } from "@rara/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const servicesRouter = router({
  getBySalon: publicProcedure
    .input(z.object({ salonId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from("services")
        .select(
          "*, category:categories(id, name, slug, description, icon, color)",
        )
        .eq("salon_id", input.salonId);

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data || [];
    }),
});
