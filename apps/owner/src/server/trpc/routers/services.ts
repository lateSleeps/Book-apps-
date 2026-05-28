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
    console.log('[getBySalon] querying with salonId:', input.salonId);

    const { data: testData, error: testError } = await supabase
      .from('services')
      .select('id, name, salon_id, is_active')
      .eq('salon_id', input.salonId)
      .limit(3);

    console.log('[DEBUG] test query:', {
      salonId: input.salonId,
      count: testData?.length,
      error: testError?.message,
      sample: testData?.[0],
    });

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

    console.log('[services.getBySalon] result:', {
      salonId: input.salonId,
      count: rawData?.length,
      error: error?.message,
      sample: rawData?.[0],
    });

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    return rawData || [];
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
