import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin/ui"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  SCHEDULED: "bg-level-medio/15 text-level-medio",
  ACTIVE: "bg-level-bajo/15 text-level-bajo",
  ENDED: "bg-muted text-muted-foreground",
  ARCHIVED: "bg-muted text-muted-foreground",
}

export default async function AdminCampaignsPage() {
  await requireRole(["admin"])
  const supabase = await createClient()

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, slug, status, start_at, end_at, total_codes, description")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Campañas"
        description="Gestiona las campañas de Rasca & Gana."
      />

      <div className="grid gap-4">
        {(campaigns ?? []).map((c) => (
          <Link key={c.id} href={`/admin/campaigns/${c.id}`}>
            <Card className="flex items-center justify-between gap-4 p-5 transition-colors hover:border-coral/50">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  <Badge className={STATUS_STYLES[c.status] ?? ""}>{c.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(c.start_at)} — {formatDate(c.end_at)} · {c.total_codes.toLocaleString("es-ES")} códigos
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        ))}
        {(campaigns ?? []).length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Aún no hay campañas.
          </Card>
        )}
      </div>
    </div>
  )
}
