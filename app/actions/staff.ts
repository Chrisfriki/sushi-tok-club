'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export type TokenDetails = {
  ok: true
  tokenExpired: boolean
  tokenUsed: boolean
  rewardStatus: string
  rewardExpiresAt: string | null
  rewardName: string | null
  rewardLevel: string | null
  rewardTerms: string | null
  rewardIcon: string | null
  requiresManagerConfirmation: boolean
  customerName: string | null
}

export type LookupResult = TokenDetails | { ok: false; error: string }

/** Staff looks up the reward attached to a scanned token (read-only). */
export async function lookupTokenAction(token: string): Promise<LookupResult> {
  const check = z.string().trim().min(6).safeParse(token)
  if (!check.success) return { ok: false, error: 'TOKEN_NOT_FOUND' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_token_details', {
    p_token: check.data,
  })
  if (error) return { ok: false, error: 'UNKNOWN' }

  const r = data as Record<string, unknown>
  if (!r.ok) return { ok: false, error: (r.error as string) ?? 'UNKNOWN' }

  return {
    ok: true,
    tokenExpired: Boolean(r.token_expired),
    tokenUsed: Boolean(r.token_used),
    rewardStatus: r.reward_status as string,
    rewardExpiresAt: (r.reward_expires_at as string) ?? null,
    rewardName: (r.reward_name as string) ?? null,
    rewardLevel: (r.reward_level as string) ?? null,
    rewardTerms: (r.reward_terms as string) ?? null,
    rewardIcon: (r.reward_icon as string) ?? null,
    requiresManagerConfirmation: Boolean(r.requires_manager_confirmation),
    customerName: (r.customer_name as string) ?? null,
  }
}

export type RedeemResult = { ok: true } | { ok: false; error: string }

/** Staff confirms a redemption. Server re-validates everything atomically. */
export async function redeemTokenAction(
  token: string,
  restaurantId: string,
): Promise<RedeemResult> {
  const tokenCheck = z.string().trim().min(6).safeParse(token)
  const restCheck = z.string().uuid().safeParse(restaurantId)
  if (!tokenCheck.success) return { ok: false, error: 'TOKEN_NOT_FOUND' }
  if (!restCheck.success) return { ok: false, error: 'NO_RESTAURANT' }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('redeem_token', {
    p_token: tokenCheck.data,
    p_restaurant_id: restCheck.data,
  })
  if (error) return { ok: false, error: 'UNKNOWN' }

  const r = data as { ok: boolean; error?: string }
  if (!r.ok) return { ok: false, error: r.error ?? 'UNKNOWN' }
  return { ok: true }
}
