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
    // Step 1: bare query to confirm data exists
    const { data: bare, error: bareError } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', input.salonId);

    console.log('[services.getBySalon] bare query:', {
      salonId: input.salonId,
      count: bare?.length,
      error: bareError?.message,
      sample: bare?.[0],
    });

    // Step 2: full query with category join
    const { data, error } = await supabase
      .from('services')
      .select('*, category:categories(*)')
      .eq('salon_id', input.salonId)
      .eq('is_active', true);

    console.log('[services.getBySalon] full query:', {
      count: data?.length,
      error: error?.message,
    });

    if (error) throw error;
    return data || [];
  }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        base_price: z.number().min(0),
        duration_minutes: z.number().min(1),
        requires_specialist: z.boolean(),
        service_questions: z.array(serviceQuestionSchema),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from('services')
        .update(fields)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });

      return data;
    }),
});
