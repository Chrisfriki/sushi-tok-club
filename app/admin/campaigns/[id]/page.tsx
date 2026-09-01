import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { getCampaignPrizeAnalytics, getCampaignLevelAnalytics } from "@/lib/analytics"
import { PageHeader, StatCard } from "@/components/admin/ui"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LEVEL_META } from "@/lib/constants"
import { formatDate, percent } from "@/lib/format"
import { notFound } from "next/navigation"

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole(["admin"])
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single()

  if (!campaign) notFound()

  const [prizeRows, levelRows] = await Promise.all([
    getCampaignPrizeAnalytics(id),
    getCampaignLevelAnalytics(id),
  ])

  const totals = prizeRows.reduce(
    (acc, r) => {
      acc.generated += r.generated
      acc.claimed += r.claimed
      acc.redeemed += r.redeemed
      return acc
    },
    { generated: 0, claimed: 0, redeemed: 0 },
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={campaign.name} description={campaign.description}>
        <Badge>{campaign.status}</Badge>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Códigos generados" value={totals.generated.toLocaleString("es-ES")} />
        <StatCard label="Reclamados" value={totals.claimed.toLocaleString("es-ES")} />
        <StatCard label="Canjeados" value={totals.redeemed.toLocaleString("es-ES")} />
        <StatCard
          label="Vigencia"
          value={`${formatDate(campaign.start_at)} → ${formatDate(campaign.end_at)}`}
        />
      </div>

      <Card className="p-0">
        <div className="border-b border-border p-5">
          <h3 className="font-semibold">Analítica por premio</h3>
          <p className="text-sm text-muted-foreground">
            Descubre qué premios generan más retorno.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Premio</TableHead>
                <TableHead className="text-right">Generados</TableHead>
                <TableHead className="text-right">Reclamados</TableHead>
                <TableHead className="text-right">Disponibles</TableHead>
                <TableHead className="text-right">Canjeados</TableHead>
                <TableHead className="text-right">Caducados</TableHead>
                <TableHead className="text-right">% canje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prizeRows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-right">{r.generated}</TableCell>
                  <TableCell className="text-right">{r.claimed}</TableCell>
                  <TableCell className="text-right">{r.available}</TableCell>
                  <TableCell className="text-right">{r.redeemed}</TableCell>
                  <TableCell className="text-right">{r.expired}</TableCell>
                  <TableCell className="text-right">
                    {percent(r.claimed ? r.redeemed / r.claimed : 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-0">
        <div className="border-b border-border p-5">
          <h3 className="font-semibold">Analítica por nivel</h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nivel</TableHead>
                <TableHead className="text-right">Códigos</TableHead>
                <TableHead className="text-right">Reclamados</TableHead>
                <TableHead className="text-right">Canjeados</TableHead>
                <TableHead className="text-right">Ratio de canje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {levelRows.map((r) => (
                <TableRow key={r.level}>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span
                        className={`size-2.5 rounded-full ${LEVEL_META[r.level as keyof typeof LEVEL_META]?.dot ?? ""}`}
                      />
                      {r.level}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{r.codes}</TableCell>
                  <TableCell className="text-right">{r.claimed}</TableCell>
                  <TableCell className="text-right">{r.redeemed}</TableCell>
                  <TableCell className="text-right">
                    {percent(r.claimed ? r.redeemed / r.claimed : 0)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
