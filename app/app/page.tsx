import Link from "next/link"
import { QrCode, Gift, Ticket, CheckCircle2, ChevronRight, Sparkles } from "lucide-react"
import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { RewardCard, type RewardCardData } from "@/components/client/reward-card"

export default async function ClientHome() {
  const profile = await requireUser("/app")
  const supabase = await createClient()

  const { data: rewardsRaw } = await supabase
    .from("user_rewards")
    .select(
      "id, status, level, expires_at, redeemed_at, reward_definitions(name, short_description, icon, level)",
    )
    .eq("user_id", profile.id)
    .order("expires_at", { ascending: true })

  const rewards = (rewardsRaw ?? []) as unknown as RewardCardData[]

  const available = rewards.filter((r) => r.status === "AVAILABLE")
  const redeemed = rewards.filter((r) => r.status === "REDEEMED")

  // Count claimed codes (scratches opened) = total rewards obtained
  const scratchesOpened = rewards.length
  const prizesWon = rewards.length
  const prizesRedeemed = redeemed.length

  const firstName = profile.first_name?.split(" ")[0] ?? "cliente"

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      <header>
        <p className="text-sm text-muted-foreground">Sushi Tok Club</p>
        <h1 className="font-display text-2xl font-bold text-foreground text-balance">
          Hola, {firstName} <span className="inline-block">👋</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {available.length > 0
            ? `Tienes ${available.length} ${available.length === 1 ? "premio disponible" : "premios disponibles"}`
            : "Escanea un rasca para empezar a ganar"}
        </p>
      </header>

      {/* Main rewards card */}
      <Link
        href="/app/rewards"
        className="group relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/25"
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium opacity-90">
              <Gift className="h-4 w-4" /> Mis premios
            </div>
            <p className="mt-2 font-display text-4xl font-bold leading-none">
              {available.length}
            </p>
            <p className="mt-1 text-sm opacity-90">
              {available.length === 1 ? "disponible" : "disponibles"}
            </p>
          </div>
          <ChevronRight className="h-6 w-6 opacity-80 transition-transform group-hover:translate-x-1" />
        </div>
        <Gift className="absolute -bottom-6 -right-4 h-32 w-32 opacity-10" />
      </Link>

      {/* Scan CTA */}
      <Link
        href="/app/scan"
        className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-5 font-display text-lg font-semibold text-primary transition-colors hover:bg-primary/10"
      >
        <QrCode className="h-6 w-6" />
        Escanear rasca
      </Link>

      {/* Stats */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Tus números
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={Ticket} value={scratchesOpened} label="Rascas abiertos" />
          <Stat icon={Gift} value={prizesWon} label="Premios ganados" />
          <Stat icon={CheckCircle2} value={prizesRedeemed} label="Canjeados" />
        </div>
      </section>

      {/* Available rewards preview */}
      {available.length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Disponibles
            </h2>
            <Link href="/app/rewards" className="text-sm font-medium text-primary">
              Ver todos
            </Link>
          </div>
          {available.slice(0, 2).map((r) => (
            <RewardCard key={r.id} reward={r} href={`/app/rewards/${r.id}`} />
          ))}
        </section>
      )}

      {/* Promotions placeholder */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Promociones
        </h2>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 p-5 text-muted-foreground">
          <Sparkles className="h-5 w-5 shrink-0" />
          <p className="text-sm text-pretty">
            Pronto encontrarás aquí retos, puntos y regalos exclusivos de Sushi Tok Club.
          </p>
        </div>
      </section>
    </div>
  )
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Gift
  value: number
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card p-4 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-display text-2xl font-bold text-foreground">
        {value}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
