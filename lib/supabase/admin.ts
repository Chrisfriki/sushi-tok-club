import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client. SERVER-ONLY.
 * Never import this into client components or expose the key.
 * Bypasses RLS — use only inside trusted server actions / route handlers
 * for privileged operations (user creation, admin management).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
