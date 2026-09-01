import { PageHeader, StatCard } from "@/components/admin/ui"
import { Funnel } from "@/components/admin/funnel"
import { LevelBreakdown } from "@/components/admin/level-breakdown"
import {
  getDashboardKpis,
  getFunnel,
  getLevelAnalytics,
} from "@/lib/analytics"
import { percent } from "@/lib/format"

export const metadata = { title: "Dashboard · Admin" }

export default async function AdminDashboardPage() {
  const [kpis, funnel, levels] = await Promise.all([
    getDashboardKpis(),
    getFunnel(),
    getLevelAnalytics(),
  ])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Rendimiento de la campaña Rasca & Gana Sushi Tok 2026."
      />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Rascas reclamados"
          value={kpis.claimedCodes.toLocaleString("es-ES")}
          hint={`de ${kpis.totalCodes.toLocaleString("es-ES")} generados`}
          accent
        />
        <StatCard
          label="Tasa de activación"
          value={percent(kpis.activationRate)}
          hint="rascas reclamados / generados"
        />
        <StatCard
          label="Clientes registrados"
          value={kpis.registeredUsers.toLocaleString("es-ES")}
        />
        <StatCard
          label="Tasa de canje"
          value={percent(kpis.redemptionRate)}
          hint="premios canjeados / obtenidos"
        />
        <StatCard
          label="Premios disponibles"
          value={kpis.availableRewards.toLocaleString("es-ES")}
        />
        <StatCard
          label="Premios canjeados"
          value={kpis.redeemedRewards.toLocaleString("es-ES")}
        />
        <StatCard
          label="Clientes recurrentes"
          value={kpis.recurringCustomers.toLocaleString("es-ES")}
          hint={`${percent(kpis.recurringRate)} de participantes`}
        />
        <StatCard
          label="Participaciones / cliente"
          value={kpis.participationsPerCustomer.toLocaleString("es-ES", {
            maximumFractionDigits: 1,
          })}
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Embudo de conversión</h2>
          <Funnel steps={funnel} />
        </section>
        <section className="rounded-2xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Rendimiento por nivel</h2>
          <LevelBreakdown rows={levels} />
        </section>
      </div>
    </div>
  )
}
