import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PageHeader, StatCard } from "@/components/admin/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { USER_REWARD_STATUS_META } from "@/lib/constants"
import { formatDate, formatDateTime } from "@/lib/format"

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  const { data: rewards } = await supabase
    .from("user_rewards")
    .select("id, status, obtained_at, redeemed_at, reward_definitions(name), restaurants:redeemed_restaurant_id(name)")
    .eq("user_id", id)
    .order("obtained_at", { ascending: false })

  const { data: auditRows } = await supabase
    .from("audit_logs")
    .select("action, created_at, metadata")
    .eq("actor_user_id", id)
    .order("created_at", { ascending: false })
    .limit(50)

  const rewardList = rewards ?? []
  const totalRewards = rewardList.length
  const totalRedeemed = rewardList.filter((r) => r.status === "REDEEMED").length

  const ACTION_LABEL: Record<string, string> = {
    CODE_CLAIMED: "Reclamó un rasca",
    REWARD_REDEEMED: "Canjeó un premio",
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/customers"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Volver a clientes
      </Link>

      <PageHeader
        title={`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Cliente"}
        description={profile.email ?? undefined}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Participaciones" value={totalRewards} />
        <StatCard label="Premios ganados" value={totalRewards} />
        <StatCard label="Premios canjeados" value={totalRedeemed} />
        <StatCard
          label="Marketing"
          value={profile.marketing_consent ? "Sí" : "No"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <Row label="Teléfono" value={profile.phone} />
            <Row label="Instagram" value={profile.instagram} />
            <Row label="Nacimiento" value={formatDate(profile.birth_date)} />
            <Row label="Registro" value={formatDate(profile.created_at)} />
            <Row
              label="Consentimiento"
              value={profile.terms_accepted_at ? `v${profile.terms_version ?? "1"} · ${formatDate(profile.terms_accepted_at)}` : "—"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad</CardTitle>
          </CardHeader>
          <CardContent>
            {(auditRows ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin actividad registrada todavía.</p>
            ) : (
              <ol className="relative flex flex-col gap-4 border-l border-border pl-4">
                {(auditRows ?? []).map((a, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 size-2.5 rounded-full bg-coral" />
                    <p className="text-sm font-medium">
                      {ACTION_LABEL[a.action] ?? a.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(a.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Premios ({totalRewards})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {rewardList.length === 0 ? (
            <p className="text-sm text-muted-foreground">Este cliente no tiene premios.</p>
          ) : (
            rewardList.map((r) => {
              const meta = USER_REWARD_STATUS_META[r.status as keyof typeof USER_REWARD_STATUS_META]
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {(r.reward_definitions as { name?: string } | null)?.name ?? "Premio"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ganado {formatDate(r.obtained_at)}
                      {r.redeemed_at
                        ? ` · Canjeado ${formatDate(r.redeemed_at)} en ${(r.restaurants as { name?: string } | null)?.name ?? "—"}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className={meta?.className}>
                    {meta?.label ?? r.status}
                  </Badge>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || "—"}</span>
    </div>
  )
}
