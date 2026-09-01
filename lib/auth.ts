import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/constants'

export interface SessionProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  phone: string | null
  birth_date: string | null
  favorite_restaurant_id: string | null
  instagram: string | null
  role: UserRole
  marketing_consent: boolean
  terms_version: string | null
  terms_accepted_at: string | null
  marketing_consent_at: string | null
  deletion_requested_at: string | null
}

/** Returns the current user's profile or null if not authenticated. */
export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'id, first_name, last_name, email, phone, birth_date, favorite_restaurant_id, instagram, role, marketing_consent, terms_version, terms_accepted_at, marketing_consent_at, deletion_requested_at',
    )
    .eq('id', user.id)
    .single()

  return (profile as SessionProfile) ?? null
}

/** Requires an authenticated user; redirects to login (optionally preserving a next path). */
export async function requireUser(next?: string): Promise<SessionProfile> {
  const profile = await getSessionProfile()
  if (!profile) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login')
  }
  return profile
}

/** Requires one of the allowed roles; redirects appropriately otherwise. */
export async function requireRole(
  allowed: UserRole[],
  next?: string,
): Promise<SessionProfile> {
  const profile = await requireUser(next)
  if (!allowed.includes(profile.role)) {
    // Send users to the area matching their role.
    redirect(defaultPathForRole(profile.role))
  }
  return profile
}

export function defaultPathForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'manager':
    case 'staff':
      return '/staff'
    default:
      return '/app'
  }
}
