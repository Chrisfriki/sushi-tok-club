"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/admin/ui"
import { formatShortDate } from "@/lib/format"
import { exportToCsv } from "@/lib/csv"

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  marketing: boolean
  restaurant: string
  createdAt: string
  prizes: number
}

export function CustomersTable({
  customers,
  initialQuery,
}: {
  customers: Customer[]
  initialQuery: string
}) {
  const router = useRouter()
  const params = useSearchParams()
  const [term, setTerm] = useState(initialQuery)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const next = new URLSearchParams(params.toString())
    if (term.trim()) next.set("q", term.trim())
    else next.delete("q")
    router.push(`/admin/customers?${next.toString()}`)
  }

  function handleExport() {
    exportToCsv(
      "clientes-sushitok.csv",
      customers.map((c) => ({
        Nombre: c.name,
        Email: c.email,
        Telefono: c.phone,
        Restaurante: c.restaurant,
        Premios: c.prizes,
        Marketing: c.marketing ? "Si" : "No",
        Alta: c.createdAt,
      })),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={submit} className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Buscar nombre, email o teléfono"
            className="pl-9"
          />
        </form>
        <Button variant="outline" onClick={handleExport} disabled={!customers.length}>
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      {customers.length === 0 ? (
        <EmptyState
          title="Sin clientes"
          hint="Ajusta la búsqueda o espera a los primeros registros."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Contacto</TableHead>
                <TableHead className="hidden lg:table-cell">Restaurante</TableHead>
                <TableHead className="text-right">Premios</TableHead>
                <TableHead className="hidden sm:table-cell">Marketing</TableHead>
                <TableHead className="hidden lg:table-cell">Alta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/admin/customers/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-col text-xs">
                      <span>{c.email}</span>
                      <span className="text-muted-foreground">{c.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {c.restaurant}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.prizes}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.marketing ? (
                      <Badge className="bg-success/15 text-success">Sí</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatShortDate(c.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
