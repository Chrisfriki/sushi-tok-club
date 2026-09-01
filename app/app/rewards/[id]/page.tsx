import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, MapPin, CalendarClock, Info } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { RedeemQrButton } from "@/components/client/redeem-qr"
import { cn } from "@/lib/utils"
import {
  rewardIcon,
  LEVEL_META,
  USER_REWARD_STATUS_META,
  type RewardLevel,
  type UserRewardStatus,
} from "@/lib/constants"
import { expiryLabel, formatDate } from "@/lib/format"

export default async function RewardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await requireUser(`/app/rewards/${id}`)
  const supabase = await createClient()

  const { data } = await supabase
    .from("user_rewards")
    .select(
      "id, user_id, status, level, expires_at, redeemed_at, redeemed_restaurant_id, reward_definitions(name, description, terms, icon, level, allowed_restaurants), restaurants:redeemed_restaurant_id(name)",
    )
    .eq("id", id)
    .single()

  if (!data) notFound()
  if (data.user_id !== profile.id) redirect("/app/rewards")

  const row = data as unknown as {
    id: string
    status: UserRewardStatus
    level: RewardLevel | null
    expires_at: string | null
    redeemed_at: string | null
    reward_definitions: {
      name: string
      description: string | null
      terms: string | null
      icon: string | null
      level: RewardLevel
      allowed_restaurants: string[] | null
    } | null
    restaurants: { name: string } | null
  }

  const def = row.reward_definitions
  const level = (def?.level ?? row.level ?? "BAJO") as RewardLevel
  const meta = LEVEL_META[level]
  const Icon = rewardIcon(def?.icon)
  const statusMeta = USER_REWARD_STATUS_META[row.status]
  const expiry = expiryLabel(row.expires_at)

  // Resolve allowed restaurant names
  let restaurantNames = "Todos los locales Sushi Tok"
  if (def?.allowed_restaurants && def.allowed_restaurants.length > 0) {
    const { data: rests } = await supabase
      .from("restaurants")
      .select("name")
      .in("id", def.allowed_restaurants)
    if (rests && rests.length > 0) {
      restaurantNames = rests.map((r) => r.name).join(", ")
    }
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-6">
      <Link
        href="/app/rewards"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Mis premios
      </Link>

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "flex h-28 w-28 items-center justify-center rounded-3xl ring-2",
            meta.bg,
            meta.ring,
          )}
        >
          <Icon className={cn("h-16 w-16", meta.text)} />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Nivel {meta.label}
          </span>
        </div>
        <h1 className="mt-1 font-display text-2xl font-bold text-foreground text-balance">
          {def?.name ?? "Premio"}
        </h1>
        <span
          className={cn(
            "mt-3 rounded-full px-3 py-1 text-xs font-medium",
            statusMeta.className,
          )}
        >
          {statusMeta.label}
        </span>
      </div>

      {def?.description && (
        <p className="text-center text-muted-foreground text-pretty">
          {def.description}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <InfoRow icon={CalendarClock} label="Caducidad">
          {row.status === "REDEEMED"
            ? `Canjeado el ${formatDate(row.redeemed_at)}`
            : expiry.text}
        </InfoRow>
        <InfoRow icon={MapPin} label="Válido en">
          {row.restaurants?.name ?? restaurantNames}
        </InfoRow>
        {def?.terms && (
          <InfoRow icon={Info} label="Condiciones">
            {def.terms}
          </InfoRow>
        )}
      </div>

      {row.status === "AVAILABLE" && (
        <div className="sticky bottom-24 mt-2">
          <RedeemQrButton rewardId={row.id} />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            El personal de Sushi Tok validará tu premio. No puedes canjearlo tú
            mismo.
          </p>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-foreground text-pretty">{children}</p>
      </div>
    </div>
  )
}
