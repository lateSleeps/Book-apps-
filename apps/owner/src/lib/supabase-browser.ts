import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client — anon key only.
 * Used for client-side auth session management (getSession, onAuthStateChange).
 * Do NOT use for DB queries from the browser; use tRPC procedures instead.
 */
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey);
