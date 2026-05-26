/**
 * @rara/database
 *
 * Supabase database client and utilities for Rara Beauty
 *
 * @example
 * import { createSupabaseClient } from '@rara/database/client'
 *
 * const supabase = createSupabaseClient()
 * const { data, error } = await supabase.from('bookings').select()
 */

export * from "./client";
