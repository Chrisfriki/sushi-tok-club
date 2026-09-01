import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import {
  rewardIcon,
  USER_REWARD_STATUS_META,
  type RewardLevel,
  type UserRewardStatus,
} from "@/lib/constants"
import { formatDate, expiryLabel } from "@/lib/format"

export default async function HistoryPage() {
  const profile = await requireUser("/app/history")
  const supabase = await createClient()

  const { data } = await supabase
    .from("user_rewards")
    .select(
      "id, status, level, obtained_at, expires_at, redeemed_at, reward_definitions(name, icon, level), restaurants:redeemed_restaurant_id(name)",
    )
    .eq("user_id", profile.id)
    .order("obtained_at", { ascending: false })

  const items = (data ?? []) as unknown as Array<{
    id: string
    status: UserRewardStatus
    level: RewardLevel | null
    obtained_at: string
    expires_at: string | null
    redeemed_at: string | null
    reward_definitions: { name: string; icon: string | null; level: RewardLevel } | null
    restaurants: { name: string } | null
  }>

  return (
    <div className="flex flex-col gap-5 px-5 pt-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Historial
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toda tu actividad en Sushi Tok Club.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <Clock className="h-8 w-8 text-muted-foreground" />
          <p className="max-w-[16rem] text-sm text-muted-foreground text-pretty">
            Todavía no tienes actividad. Escanea tu primer rasca para empezar.
          </p>
        </div>
      ) : (
        <ol className="relative flex flex-col gap-4 border-l border-border pl-6">
          {items.map((item) => {
            const def = item.reward_definitions
            const Icon = rewardIcon(def?.icon)
            const statusMeta = USER_REWARD_STATUS_META[item.status]
            const isRedeemed = item.status === "REDEEMED"
            return (
              <li key={item.id} className="relative">
                <span className="absolute -left-[27px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-card ring-2 ring-border">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isRedeemed ? "bg-muted-foreground" : "bg-coral",
                    )}
                  />
                </span>
                <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  <Icon className="h-6 w-6 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-medium text-foreground">
                        {def?.name ?? "Premio"}
                      </h3>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                          statusMeta.className,
                        )}
                      >
                        {statusMeta.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {isRedeemed
                        ? `Canjeado ${formatDate(item.redeemed_at)}${item.restaurants?.name ? ` · ${item.restaurants.name}` : ""}`
                        : item.status === "AVAILABLE"
                          ? `Obtenido ${formatDate(item.obtained_at)} · ${expiryLabel(item.expires_at).text}`
                          : `Obtenido ${formatDate(item.obtained_at)}`}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
