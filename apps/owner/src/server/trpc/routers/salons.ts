import { supabase } from '@rara/database';
import { z } from 'zod';
import { router, publicProcedure } from '../trpc';

export const salonsRouter = router({
  getAll: publicProcedure.query(async () => {
    const { data, error } = await supabase.from('salons').select('*').eq('is_active', true);

    if (error) throw error;
    return data;
  }),

  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    console.log('[salons.getBySlug] Looking for salon with slug:', input.slug);

    const { data, error } = await supabase
      .from('salons')
      .select('id, name, slug, description, address, phone, email, logo_url, is_active')
      .eq('slug', input.slug)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('[salons.getBySlug] Error:', error);
      throw error;
    }

    console.log('[salons.getBySlug] Found salon:', data?.id);
    return data;
  }),

  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    const { data, error } = await supabase
      .from('salons')
      .select('id, name, slug, description, address, phone, email, logo_url, is_active')
      .eq('id', input.id)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  }),
});
