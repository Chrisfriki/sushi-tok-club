import { NextRequest, NextResponse } from 'next/server'
import { getSessionProfile, defaultPathForRole } from '@/lib/auth'

/**
 * After login/register the client sends users here; we resolve their role
 * server-side and forward them to the right area (or the requested `next`).
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl
  const next = searchParams.get('next')
  const profile = await getSessionProfile()

  if (!profile) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Honor a safe internal next path.
  if (next && next.startsWith('/') && !next.startsWith('//')) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}${defaultPathForRole(profile.role)}`)
}
