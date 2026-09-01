import { createClient } from "@/lib/supabase/server"

async function count(
  table: string,
  build?: (q: ReturnType<Awaited<ReturnType<typeof createClient>>["from"]>) => unknown,
): Promise<number> {
  const supabase = await createClient()
  let query = supabase.from(table).select("*", { count: "exact", head: true })
  if (build) query = build(query as never) as typeof query
  const { count: c } = await query
  return c ?? 0
}

export type DashboardKpis = {
  totalCodes: number
  claimedCodes: number
  registeredUsers: number
  availableRewards: number
  redeemedRewards: number
  expiredRewards: number
  activationRate: number
  redemptionRate: number
  recurringCustomers: number
  recurringRate: number
  participationsPerCustomer: number
}

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const supabase = await createClient()

  const [
    totalCodes,
    claimedCodes,
    registeredUsers,
    availableRewards,
    redeemedRewards,
    expiredRewards,
    totalRewards,
  ] = await Promise.all([
    count("codes"),
    count("codes", (q) => (q as any).eq("status", "CLAIMED")),
    count("profiles", (q) => (q as any).eq("role", "client")),
    count("user_rewards", (q) => (q as any).eq("status", "AVAILABLE")),
    count("user_rewards", (q) => (q as any).eq("status", "REDEEMED")),
    count("user_rewards", (q) => (q as any).eq("status", "EXPIRED")),
    count("user_rewards"),
  ])

  // Recurring customers = users with >1 claimed code.
  const { data: claimRows } = await supabase
    .from("codes")
    .select("claimed_by")
    .eq("status", "CLAIMED")
    .not("claimed_by", "is", null)

  const perUser = new Map<string, number>()
  for (const row of claimRows ?? []) {
    const id = (row as { claimed_by: string }).claimed_by
    perUser.set(id, (perUser.get(id) ?? 0) + 1)
  }
  const participants = perUser.size
  const recurringCustomers = [...perUser.values()].filter((n) => n > 1).length

  return {
    totalCodes,
    claimedCodes,
    registeredUsers,
    availableRewards,
    redeemedRewards,
    expiredRewards,
    activationRate: totalCodes ? claimedCodes / totalCodes : 0,
    redemptionRate: totalRewards ? redeemedRewards / totalRewards : 0,
    recurringCustomers,
    recurringRate: participants ? recurringCustomers / participants : 0,
    participationsPerCustomer: participants ? claimedCodes / participants : 0,
  }
}

export type FunnelStep = { label: string; value: number }

export async function getFunnel(): Promise<FunnelStep[]> {
  const [generated, claimed, users, obtained, redeemed] = await Promise.all([
    count("codes"),
    count("codes", (q) => (q as any).eq("status", "CLAIMED")),
    count("profiles", (q) => (q as any).eq("role", "client")),
    count("user_rewards"),
    count("user_rewards", (q) => (q as any).eq("status", "REDEEMED")),
  ])
  return [
    { label: "Rascas generados", value: generated },
    { label: "Rascas reclamados", value: claimed },
    { label: "Usuarios registrados", value: users },
    { label: "Premios obtenidos", value: obtained },
    { label: "Premios canjeados", value: redeemed },
  ]
}

export type RewardAnalyticsRow = {
  name: string
  level: string
  generated: number
  claimed: number
  available: number
  redeemed: number
  expired: number
  redemptionRate: number
}

export async function getRewardAnalytics(): Promise<RewardAnalyticsRow[]> {
  const supabase = await createClient()
  const { data: defs } = await supabase
    .from("reward_definitions")
    .select("id, name, level")
    .order("name")

  const { data: codes } = await supabase
    .from("codes")
    .select("reward_definition_id, status")
  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("reward_definition_id, status")

  const rows: RewardAnalyticsRow[] = []
  for (const def of defs ?? []) {
    const defId = (def as { id: string }).id
    const defCodes = (codes ?? []).filter(
      (c) => (c as any).reward_definition_id === defId,
    )
    const defRewards = (rewards ?? []).filter(
      (r) => (r as any).reward_definition_id === defId,
    )
    const generated = defCodes.length
    const claimed = defCodes.filter((c) => (c as any).status === "CLAIMED").length
    const available = defRewards.filter((r) => (r as any).status === "AVAILABLE").length
    const redeemed = defRewards.filter((r) => (r as any).status === "REDEEMED").length
    const expired = defRewards.filter((r) => (r as any).status === "EXPIRED").length
    rows.push({
      name: (def as any).name,
      level: (def as any).level,
      generated,
      claimed,
      available,
      redeemed,
      expired,
      redemptionRate: defRewards.length ? redeemed / defRewards.length : 0,
    })
  }
  return rows
}

export type LevelAnalyticsRow = {
  level: string
  codes: number
  claimed: number
  redeemed: number
  redemptionRate: number
}

export async function getLevelAnalytics(): Promise<LevelAnalyticsRow[]> {
  const supabase = await createClient()
  const levels = ["BAJO", "MEDIO", "ALTO", "PREMIUM"] as const
  const { data: codes } = await supabase.from("codes").select("level, status")
  const { data: rewards } = await supabase.from("user_rewards").select("level, status")

  return levels.map((level) => {
    const levelCodes = (codes ?? []).filter((c) => (c as any).level === level)
    const levelRewards = (rewards ?? []).filter((r) => (r as any).level === level)
    const claimed = levelCodes.filter((c) => (c as any).status === "CLAIMED").length
    const redeemed = levelRewards.filter((r) => (r as any).status === "REDEEMED").length
    return {
      level,
      codes: levelCodes.length,
      claimed,
      redeemed,
      redemptionRate: levelRewards.length ? redeemed / levelRewards.length : 0,
    }
  })
}

export type CampaignPrizeRow = {
  name: string
  generated: number
  claimed: number
  available: number
  redeemed: number
  expired: number
}

export async function getCampaignPrizeAnalytics(
  campaignId: string,
): Promise<CampaignPrizeRow[]> {
  const supabase = await createClient()
  const { data: defs } = await supabase
    .from("reward_definitions")
    .select("id, name")
    .order("name")
  const { data: codes } = await supabase
    .from("codes")
    .select("reward_definition_id, status")
    .eq("campaign_id", campaignId)
  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("reward_definition_id, status")
    .eq("campaign_id", campaignId)

  const rows: CampaignPrizeRow[] = []
  for (const def of defs ?? []) {
    const defId = (def as { id: string }).id
    const defCodes = (codes ?? []).filter((c) => (c as any).reward_definition_id === defId)
    if (defCodes.length === 0) continue
    const defRewards = (rewards ?? []).filter((r) => (r as any).reward_definition_id === defId)
    rows.push({
      name: (def as any).name,
      generated: defCodes.length,
      claimed: defCodes.filter((c) => (c as any).status === "CLAIMED").length,
      available: defRewards.filter((r) => (r as any).status === "AVAILABLE").length,
      redeemed: defRewards.filter((r) => (r as any).status === "REDEEMED").length,
      expired: defRewards.filter((r) => (r as any).status === "EXPIRED").length,
    })
  }
  return rows
}

export async function getCampaignLevelAnalytics(
  campaignId: string,
): Promise<LevelAnalyticsRow[]> {
  const supabase = await createClient()
  const levels = ["BAJO", "MEDIO", "ALTO", "PREMIUM"] as const
  const { data: codes } = await supabase
    .from("codes")
    .select("level, status")
    .eq("campaign_id", campaignId)
  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("level, status")
    .eq("campaign_id", campaignId)

  return levels.map((level) => {
    const levelCodes = (codes ?? []).filter((c) => (c as any).level === level)
    const levelRewards = (rewards ?? []).filter((r) => (r as any).level === level)
    const claimed = levelCodes.filter((c) => (c as any).status === "CLAIMED").length
    const redeemed = levelRewards.filter((r) => (r as any).status === "REDEEMED").length
    return {
      level,
      codes: levelCodes.length,
      claimed,
      redeemed,
      redemptionRate: levelRewards.length ? redeemed / levelRewards.length : 0,
    }
  })
}
