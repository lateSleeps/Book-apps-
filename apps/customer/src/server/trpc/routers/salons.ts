import { supabase } from "@rara/database";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure } from "../trpc";

export const salonsRouter = router({
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      console.log("=== SALONS QUERY ===");
      console.log("slug:", input.slug);

      const { data, error } = await supabase
        .from("salons")
        .select("*")
        .eq("slug", input.slug)
        .maybeSingle();

      console.log("data:", JSON.stringify(data));
      console.log("error:", JSON.stringify(error));

      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      if (!data)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Salon not found: ${input.slug}`,
        });
      return data;
    }),
});
