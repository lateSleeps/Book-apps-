/**
 * Server-side database client.
 *
 * All settings repositories import `db` from here.
 * Never import directly from @rara/database in repository/service/router files —
 * this indirection means swapping the client (e.g. to createSupabaseClient())
 * happens in one place.
 *
 * NEVER import this file from:
 *   - components/ (anything under src/features or src/shared)
 *   - app/ pages or layouts
 *   - client-side hooks
 */

export { supabase as db } from '@rara/database';
