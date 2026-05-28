import { supabase } from '@rara/database';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

const serviceQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['chips', 'photo']),
  required: z.boolean(),
  options: z.array(z.string()),
});

export const servicesRouter = router({
  getBySalon: publicProcedure.input(z.object({ salonId: z.string() })).query(async ({ input }) => {
    const { data: rawData, error } = await supabase
      .from('services')
      .select(
        `
        *,
        category:categories(id, name, icon, color)
      `
      )
      .eq('salon_id', input.salonId)
      .eq('is_active', true);

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    return rawData || [];
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        price: z.number().min(0),
        duration: z.number().min(1),
        price_type: z.enum(['fixed', 'starting_from']),
        requires_specialist: z.boolean(),
        service_questions: z.array(serviceQuestionSchema),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...fields } = input;
      console.log('[services.update] id:', id, 'fields:', fields);
      const { data, error } = await supabase
        .from('services')
        .update(fields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      console.log('[services.update] saved row price_type:', data?.price_type);
      return data;
    }),
});
