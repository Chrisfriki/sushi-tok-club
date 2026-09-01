import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin/ui"
import { CustomersTable } from "@/components/admin/customers-table"

export const metadata = { title: "Clientes · Admin" }

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select(
      "id, first_name, last_name, email, phone, marketing_consent, created_at, favorite_restaurant:restaurants(name)",
    )
    .eq("role", "client")
    .order("created_at", { ascending: false })
    .limit(200)

  if (q && q.trim()) {
    const term = `%${q.trim()}%`
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`,
    )
  }

  const { data } = await query

  // Prize counts per customer for quick context.
  const ids = (data ?? []).map((c) => (c as { id: string }).id)
  const counts = new Map<string, number>()
  if (ids.length) {
    const { data: rewards } = await supabase
      .from("user_rewards")
      .select("user_id")
      .in("user_id", ids)
    for (const row of rewards ?? []) {
      const id = (row as { user_id: string }).user_id
      counts.set(id, (counts.get(id) ?? 0) + 1)
    }
  }

  const customers = (data ?? []).map((c) => {
    const row = c as Record<string, unknown>
    return {
      id: row.id as string,
      name: `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "—",
      email: (row.email as string) ?? "—",
      phone: (row.phone as string) ?? "—",
      marketing: Boolean(row.marketing_consent),
      restaurant:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((row.favorite_restaurant as any)?.name as string) ?? "—",
      createdAt: row.created_at as string,
      prizes: counts.get(row.id as string) ?? 0,
    }
  })

  return (
    <div>
      <PageHeader
        title="Clientes"
        description="Base de datos de participantes de la campaña."
      />
      <CustomersTable customers={customers} initialQuery={q ?? ""} />
    </div>
  )
}
