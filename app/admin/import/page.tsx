import { PageHeader } from "@/components/admin/ui"
import { createClient } from "@/lib/supabase/server"
import { CodeImporter } from "@/components/admin/code-importer"

export const dynamic = "force-dynamic"

export default async function ImportPage() {
  const supabase = await createClient()
  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name")
    .order("created_at", { ascending: false })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Importar códigos"
        description="Sube tu Excel o CSV, mapea las columnas y vuelca los códigos a la base de datos. Una vez importados, PostgreSQL es la única fuente de verdad."
      />
      <CodeImporter campaigns={campaigns ?? []} />
    </div>
  )
}
