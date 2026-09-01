import { notFound, redirect } from "next/navigation"
import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PrizeReveal } from "@/components/client/prize-reveal"
import type { RewardLevel } from "@/lib/constants"

export default async function RevealPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await requireUser(`/reveal/${id}`)
  const supabase = await createClient()

  const { data } = await supabase
    .from("user_rewards")
    .select(
      "id, user_id, level, expires_at, reward_definitions(name, description, terms, icon, level)",
    )
    .eq("id", id)
    .single()

  if (!data) notFound()
  if (data.user_id !== profile.id) redirect("/app")

  const def = (data as unknown as {
    reward_definitions: {
      name: string
      description: string | null
      terms: string | null
      icon: string | null
      level: RewardLevel
    } | null
  }).reward_definitions

  return (
    <main className="min-h-dvh bg-background">
      <PrizeReveal
        reward={{
          id: data.id as string,
          level: (def?.level ?? (data.level as RewardLevel) ?? "BAJO") as RewardLevel,
          expires_at: data.expires_at as string | null,
          name: def?.name ?? "Premio",
          description: def?.description ?? null,
          terms: def?.terms ?? null,
          icon: def?.icon ?? null,
        }}
      />
    </main>
  )
}
