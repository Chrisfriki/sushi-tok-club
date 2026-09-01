import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin/ui"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateTime } from "@/lib/format"

export default async function AdminRedemptionsPage() {
  await requireRole(["admin"])
  const supabase = await createClient()

  const { data: redemptions } = await supabase
    .from("redemptions")
    .select(
      "id, redeemed_at, method, reward_definitions(name), restaurants(name), customer:customer_user_id(first_name, last_name), staff:staff_user_id(first_name, last_name)",
    )
    .order("redeemed_at", { ascending: false })
    .limit(200)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Canjes"
        description="Historial global de premios canjeados en los locales."
      />

      <Card className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Premio</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Validado por</TableHead>
                <TableHead>Método</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(redemptions ?? []).map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(r.redeemed_at)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {r.reward_definitions?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.customer
                      ? `${r.customer.first_name ?? ""} ${r.customer.last_name ?? ""}`.trim() || "—"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">{r.restaurants?.name ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    {r.staff
                      ? `${r.staff.first_name ?? ""} ${r.staff.last_name ?? ""}`.trim() || "—"
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.method}</TableCell>
                </TableRow>
              ))}
              {(redemptions ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                    Todavía no se ha canjeado ningún premio.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
