"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function CodeFilters({
  q,
  status,
  level,
}: {
  q?: string
  status?: string
  level?: string
}) {
  const router = useRouter()

  function update(next: Partial<{ q: string; status: string; level: string }>) {
    const params = new URLSearchParams()
    const merged = { q, status, level, ...next }
    if (merged.q) params.set("q", merged.q)
    if (merged.status) params.set("status", merged.status)
    if (merged.level) params.set("level", merged.level)
    router.push(`/admin/codes?${params.toString()}`)
  }

  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault()
        const value = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value
        update({ q: value })
      }}
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Buscar por código…"
          className="pl-9"
        />
      </div>
      <select
        defaultValue={status ?? ""}
        onChange={(e) => update({ status: e.target.value })}
        className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none dark:bg-input/30"
      >
        <option value="">Todos los estados</option>
        <option value="AVAILABLE">Disponible</option>
        <option value="CLAIMED">Reclamado</option>
        <option value="BLOCKED">Bloqueado</option>
      </select>
      <select
        defaultValue={level ?? ""}
        onChange={(e) => update({ level: e.target.value })}
        className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none dark:bg-input/30"
      >
        <option value="">Todos los niveles</option>
        <option value="BAJO">Bajo</option>
        <option value="MEDIO">Medio</option>
        <option value="ALTO">Alto</option>
        <option value="PREMIUM">Premium</option>
      </select>
    </form>
  )
}
