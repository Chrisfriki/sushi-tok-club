import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin/ui"
import { StaffCreator } from "@/components/admin/staff-creator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/format"

export const dynamic = "force-dynamic"

const ROLE_STYLES: Record<string, string> = {
  admin: "text-coral",
  manager: "text-[var(--level-alto)]",
  staff: "text-[var(--level-medio)]",
}

export default async function StaffPage() {
  const supabase = await createClient()

  const { data: staff } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role, created_at, staff_restaurants(restaurants(name))")
    .in("role", ["staff", "manager", "admin"])
    .order("created_at", { ascending: false })

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name")
    .order("name")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Empleados"
        description="Personal con acceso a las áreas de staff, manager y administración."
        action={<StaffCreator restaurants={restaurants ?? []} />}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Restaurantes</TableHead>
                <TableHead>Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(staff ?? []).map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    {`${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_STYLES[s.role] ?? ""}>
                      {s.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {(s.staff_restaurants ?? [])
                      .map((sr: any) => sr.restaurants?.name)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(s.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
