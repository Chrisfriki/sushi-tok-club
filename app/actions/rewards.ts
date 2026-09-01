'use server'

import { randomBytes } from 'crypto'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(3, 'Código demasiado corto')
  .max(40, 'Código no válido')
  .regex(/^[A-Z0-9-]+$/, 'El código solo puede contener letras, números y guiones')

export type ClaimResult =
  | { ok: true; userRewardId: string; already: boolean }
  | { ok: false; error: string }

/**
 * Claims a scratch code for the current user via the atomic claim_code RPC.
 * Safe against race conditions (row lock inside the function).
 */
export async function claimCodeAction(rawCode: string): Promise<ClaimResult> {
  const parsed = codeSchema.safeParse(rawCode)
  if (!parsed.success) {
    return { ok: false, error: 'NOT_FOUND' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'NOT_AUTHENTICATED' }

  const { data, error } = await supabase.rpc('claim_code', {
    p_code: parsed.data,
  })

  if (error) {
    return { ok: false, error: 'UNKNOWN' }
  }

  const result = data as {
    ok: boolean
    error?: string
    already?: boolean
    user_reward_id?: string
  }

  if (!result.ok) {
    return { ok: false, error: result.error ?? 'UNKNOWN' }
  }

  return {
    ok: true,
    userRewardId: result.user_reward_id!,
    already: Boolean(result.already),
  }
}

export type TokenResult =
  | { ok: true; token: string; expiresAt: string }
  | { ok: false; error: string }

/**
 * Generates a short-lived, single-use redemption token for a reward the
 * current user owns. The token is what the staff scans — never the reward id.
 */
export async function createRedemptionTokenAction(
  userRewardId: string,
): Promise<TokenResult> {
  const idCheck = z.string().uuid().safeParse(userRewardId)
  if (!idCheck.success) return { ok: false, error: 'INVALID' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'NOT_AUTHENTICATED' }

  // Verify ownership + availability (RLS already restricts to own rewards).
  const { data: reward } = await supabase
    .from('user_rewards')
    .select('id, status, expires_at, user_id')
    .eq('id', userRewardId)
    .single()

  if (!reward || reward.user_id !== user.id) {
    return { ok: false, error: 'NOT_FOUND' }
  }
  if (reward.status !== 'AVAILABLE') {
    return { ok: false, error: 'NOT_AVAILABLE' }
  }
  if (reward.expires_at && new Date(reward.expires_at) < new Date()) {
    return { ok: false, error: 'EXPIRED' }
  }

  // Invalidate previous outstanding tokens for this reward, then issue a new one.
  await supabase
    .from('redemption_tokens')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('user_reward_id', userRewardId)
    .eq('used', false)

  const token = `RT_${randomBytes(24).toString('base64url')}`
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min

  const { error } = await supabase.from('redemption_tokens').insert({
    token,
    user_reward_id: userRewardId,
    user_id: user.id,
    expires_at: expiresAt,
  })

  if (error) return { ok: false, error: 'UNKNOWN' }

  return { ok: true, token, expiresAt }
}
