import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { RewardsTabs } from "@/components/client/rewards-tabs"
import type { RewardCardData } from "@/components/client/reward-card"

export default async function RewardsPage() {
  const profile = await requireUser("/app/rewards")
  const supabase = await createClient()

  const { data } = await supabase
    .from("user_rewards")
    .select(
      "id, status, level, expires_at, redeemed_at, reward_definitions(name, short_description, icon, level)",
    )
    .eq("user_id", profile.id)
    .order("expires_at", { ascending: true })

  const rewards = (data ?? []) as unknown as RewardCardData[]

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Mis premios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tus recompensas de Sushi Tok Club.
        </p>
      </header>
      <RewardsTabs rewards={rewards} />
    </div>
  )
}
