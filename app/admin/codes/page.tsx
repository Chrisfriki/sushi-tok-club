import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin/ui"
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
import { CodeActions } from "@/components/admin/code-actions"
import { CodeFilters } from "@/components/admin/code-filters"
import { LEVEL_META, type RewardLevel } from "@/lib/constants"
import { formatDate } from "@/lib/format"
import Link from "next/link"

const PAGE_SIZE = 25

const CODE_STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-level-bajo/15 text-level-bajo",
  CLAIMED: "bg-level-medio/15 text-level-medio",
  BLOCKED: "bg-destructive/12 text-destructive",
  INVALID: "bg-muted text-muted-foreground",
}

export default async function AdminCodesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    status?: string
    level?: string
    page?: string
  }>
}) {
  await requireRole(["admin"])
  const sp = await searchParams
  const supabase = await createClient()

  const page = Math.max(1, Number(sp.page ?? "1") || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from("codes")
    .select(
      "id, code, status, level, claimed_at, expiration_date, reward_definitions(name), campaigns(name), profiles:claimed_by(first_name, last_name)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to)

  if (sp.q) query = query.ilike("code", `%${sp.q}%`)
  if (sp.status) query = query.eq("status", sp.status)
  if (sp.level) query = query.eq("level", sp.level)

  const { data: codes, count } = await query
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const makeHref = (p: number) => {
    const params = new URLSearchParams()
    if (sp.q) params.set("q", sp.q)
    if (sp.status) params.set("status", sp.status)
    if (sp.level) params.set("level", sp.level)
    params.set("page", String(p))
    return `/admin/codes?${params.toString()}`
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Códigos"
        description={`${(count ?? 0).toLocaleString("es-ES")} códigos en la base de datos.`}
      />

      <CodeFilters q={sp.q} status={sp.status} level={sp.level} />

      <Card className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Premio</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Reclamado</TableHead>
                <TableHead>Caducidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(codes ?? []).map((c: any) => {
                const meta = LEVEL_META[c.level as RewardLevel]
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-medium">{c.code}</TableCell>
                    <TableCell className="text-sm">{c.reward_definitions?.name ?? "—"}</TableCell>
                    <TableCell>
                      {meta && (
                        <span className={`inline-flex items-center gap-1.5 text-xs ${meta.text}`}>
                          <span className={`size-2 rounded-full ${meta.dot}`} />
                          {meta.label}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`border-0 ${CODE_STATUS_STYLES[c.status]}`}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {c.profiles
                        ? `${c.profiles.first_name ?? ""} ${c.profiles.last_name ?? ""}`.trim() || "—"
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.claimed_at ? formatDate(c.claimed_at) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.expiration_date ? formatDate(c.expiration_date) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <CodeActions codeId={c.id} status={c.status} />
                    </TableCell>
                  </TableRow>
                )
              })}
              {(codes ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                    No hay códigos que coincidan con los filtros.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={makeHref(page - 1)}
                className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={makeHref(page + 1)}
                className="rounded-lg border border-border px-3 py-1.5 hover:bg-muted"
              >
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
