import { supabase } from '@rara/database';
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const stylistSchedulesRouter = router({
  getByStylest: publicProcedure
    .input(z.object({ stylistId: z.string() }))
    .query(async ({ input }) => {
      const { data, error } = await supabase
        .from('stylist_schedules')
        .select('*')
        .eq('stylist_id', input.stylistId)
        .eq('is_available', true);

      if (error) throw error;
      return data || [];
    }),
});
