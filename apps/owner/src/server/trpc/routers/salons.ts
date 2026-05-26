import { supabase } from '@rara/database';
import { router, publicProcedure } from '../trpc';

export const salonsRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase.from('salons').select('*').eq('is_active', true);

    if (error) throw error;
    return data;
  }),
});
