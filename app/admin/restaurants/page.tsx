import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin/ui"
import { RestaurantEditor } from "@/components/admin/restaurant-editor"
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

export const dynamic = "force-dynamic"

export default async function RestaurantsPage() {
  const supabase = await createClient()
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("*")
    .order("name")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Restaurantes"
        description="Locales de Sushi Tok donde se validan los premios."
        action={<RestaurantEditor />}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(restaurants ?? []).map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{r.slug}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{r.address ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={r.active ? "text-[var(--level-bajo)]" : "text-muted-foreground"}>
                      {r.active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <RestaurantEditor restaurant={r} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
