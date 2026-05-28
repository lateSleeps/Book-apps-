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

      const sample = data?.[0];
      console.log("[services.getBySalon] sample row:", {
        id: sample?.id,
        name: sample?.name,
        price_type: (sample as Record<string, unknown>)?.price_type,
        requires_specialist: sample?.requires_specialist,
        service_questions: sample?.service_questions,
      });

      return data || [];
    }),
});
