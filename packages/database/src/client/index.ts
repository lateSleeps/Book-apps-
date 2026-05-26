/**
 * Supabase Database Client
 *
 * Provides configured Supabase client for database operations
 */

import type { Database } from "@rara/types";
import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Validate required environment variables
 */
function validateEnv(): void {
  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL is not set in environment variables");
  }
  if (!supabaseAnonKey) {
    throw new Error("SUPABASE_ANON_KEY is not set in environment variables");
  }
}

/**
 * Create Supabase client with anon key
 * Use this for client-side operations with limited permissions
 *
 * @example
 * const supabase = createSupabaseClient()
 * const { data } = await supabase.from('bookings').select()
 */
export function createSupabaseClient() {
  validateEnv();

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Create Supabase admin client with service role key
 * Use this for server-side operations with full permissions
 * ⚠️ NEVER expose this to clients
 *
 * @example
 * const admin = createSupabaseAdmin()
 * const { data } = await admin.from('users').select()
 */
export function createSupabaseAdmin() {
  validateEnv();

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set in environment variables",
    );
  }

  return createClient<Database>(supabaseUrl!, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Get Supabase configuration
 */
export function getSupabaseConfig() {
  validateEnv();

  return {
    url: supabaseUrl!,
    anonKey: supabaseAnonKey!,
    serviceRoleKey: supabaseServiceRoleKey,
  };
}
