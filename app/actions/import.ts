"use server"

import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

type ImportRow = Record<string, string>

const LEVEL_ALIASES: Record<string, "BAJO" | "MEDIO" | "ALTO" | "PREMIUM"> = {
  bajo: "BAJO",
  low: "BAJO",
  medio: "MEDIO",
  medium: "MEDIO",
  alto: "ALTO",
  high: "ALTO",
  premium: "PREMIUM",
}

export type ImportResult = {
  ok: boolean
  inserted: number
  skipped: number
  unmatchedRewards: string[]
  errors: string[]
}

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No autenticado")
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "admin") throw new Error("No autorizado")
  return user.id
}

const payloadSchema = z.object({
  campaignId: z.string().uuid(),
  mapping: z.object({
    code: z.string().min(1),
    level: z.string().optional(),
    reward: z.string().optional(),
    strategic_condition: z.string().optional(),
    instagram_user: z.string().optional(),
    activation_date: z.string().optional(),
    expiration_date: z.string().optional(),
  }),
  rows: z.array(z.record(z.string(), z.any())).max(10000),
})

function normalizeLevel(value?: string): "BAJO" | "MEDIO" | "ALTO" | "PREMIUM" | null {
  if (!value) return null
  return LEVEL_ALIASES[value.trim().toLowerCase()] ?? null
}

function parseDate(value?: string): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  // Support dd/mm/yyyy and ISO
  const dm = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/)
  if (dm) {
    const [, d, m, y] = dm
    const year = y.length === 2 ? `20${y}` : y
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
  }
  const parsed = new Date(trimmed)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

export async function importCodesAction(payload: unknown): Promise<ImportResult> {
  const actorId = await assertAdmin()

  const parsed = payloadSchema.safeParse(payload)
  if (!parsed.success) {
    return { ok: false, inserted: 0, skipped: 0, unmatchedRewards: [], errors: ["Datos de importación no válidos."] }
  }

  const { campaignId, mapping, rows } = parsed.data
  const admin = createAdminClient()

  // Build a lookup of reward definitions by normalized name
  const { data: defs } = await admin.from("reward_definitions").select("id, name, level")
  const defByName = new Map<string, { id: string; level: string }>()
  for (const d of defs ?? []) {
    defByName.set((d.name as string).trim().toLowerCase(), { id: d.id as string, level: d.level as string })
  }

  const unmatched = new Set<string>()
  const toInsert: Array<Record<string, unknown>> = []

  for (const raw of rows as ImportRow[]) {
    const code = String(raw[mapping.code] ?? "").trim()
    if (!code) continue

    const rewardName = mapping.reward ? String(raw[mapping.reward] ?? "").trim() : ""
    const match = rewardName ? defByName.get(rewardName.toLowerCase()) : undefined
    if (rewardName && !match) unmatched.add(rewardName)

    const level =
      normalizeLevel(mapping.level ? String(raw[mapping.level] ?? "") : undefined) ??
      (match ? (match.level as "BAJO" | "MEDIO" | "ALTO" | "PREMIUM") : null)

    toInsert.push({
      code,
      campaign_id: campaignId,
      reward_definition_id: match?.id ?? null,
      level,
      status: "AVAILABLE",
      strategic_condition: mapping.strategic_condition ? String(raw[mapping.strategic_condition] ?? "").trim() || null : null,
      instagram_user: mapping.instagram_user ? String(raw[mapping.instagram_user] ?? "").trim() || null : null,
      activation_date: mapping.activation_date ? parseDate(String(raw[mapping.activation_date] ?? "")) : null,
      expiration_date: mapping.expiration_date ? parseDate(String(raw[mapping.expiration_date] ?? "")) : null,
    })
  }

  let inserted = 0
  let skipped = 0
  const errors: string[] = []

  // Insert in chunks, ignoring duplicates (unique constraint on code)
  const chunkSize = 500
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize)
    const { data, error } = await admin
      .from("codes")
      .upsert(chunk, { onConflict: "code", ignoreDuplicates: true })
      .select("id")
    if (error) {
      errors.push(error.message)
    } else {
      inserted += data?.length ?? 0
      skipped += chunk.length - (data?.length ?? 0)
    }
  }

  // Update campaign total_codes
  const { count } = await admin
    .from("codes")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
  await admin.from("campaigns").update({ total_codes: count ?? 0 }).eq("id", campaignId)

  await admin.from("audit_logs").insert({
    actor_user_id: actorId,
    action: "CODES_IMPORTED",
    entity_type: "campaigns",
    entity_id: campaignId,
    metadata: { inserted, skipped, rows: rows.length },
  })

  return {
    ok: errors.length === 0,
    inserted,
    skipped,
    unmatchedRewards: Array.from(unmatched),
    errors,
  }
}
