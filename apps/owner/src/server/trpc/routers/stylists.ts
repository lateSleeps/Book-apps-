import { supabase } from '@rara/database';
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const stylistsRouter = router({
  getBySalon: publicProcedure.input(z.object({ salonId: z.string() })).query(async ({ input }) => {
    const { data, error } = await supabase
      .from('stylists')
      .select('*, user:users(*)')
      .eq('salon_id', input.salonId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }),
});
