"use client"

import { useState } from "react"
import * as XLSX from "xlsx"
import { toast } from "sonner"
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { importCodesAction, type ImportResult } from "@/app/actions/import"

type Campaign = { id: string; name: string }

const TARGET_FIELDS: { key: string; label: string; required?: boolean }[] = [
  { key: "code", label: "Código", required: true },
  { key: "level", label: "Nivel" },
  { key: "reward", label: "Premio" },
  { key: "strategic_condition", label: "Condición estratégica" },
  { key: "instagram_user", label: "Usuario Instagram" },
  { key: "activation_date", label: "Fecha activación" },
  { key: "expiration_date", label: "Fecha caducidad" },
]

export function CodeImporter({ campaigns }: { campaigns: Campaign[] }) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? "")
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [fileName, setFileName] = useState("")
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: "array" })
        const sheet = wb.Sheets[wb.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "", raw: false })
        if (json.length === 0) {
          toast.error("El archivo está vacío")
          return
        }
        const cols = Object.keys(json[0])
        setHeaders(cols)
        setRows(json)
        // Auto-map by fuzzy header name
        const auto: Record<string, string> = {}
        for (const field of TARGET_FIELDS) {
          const found = cols.find((c) => {
            const n = c.toLowerCase()
            if (field.key === "code") return n.includes("cód") || n.includes("cod") || n === "code"
            if (field.key === "level") return n.includes("nivel") || n.includes("level")
            if (field.key === "reward") return n.includes("premio") || n.includes("reward")
            if (field.key === "strategic_condition") return n.includes("condic")
            if (field.key === "instagram_user") return n.includes("instagram")
            if (field.key === "activation_date") return n.includes("activ")
            if (field.key === "expiration_date") return n.includes("caduc") || n.includes("expir")
            return false
          })
          if (found) auto[field.key] = found
        }
        setMapping(auto)
        toast.success(`${json.length} filas cargadas`)
      } catch {
        toast.error("No se pudo leer el archivo. Usa XLSX o CSV.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  async function runImport() {
    if (!campaignId) {
      toast.error("Selecciona una campaña")
      return
    }
    if (!mapping.code) {
      toast.error("Debes mapear la columna de Código")
      return
    }
    setImporting(true)
    setResult(null)
    try {
      const res = await importCodesAction({ campaignId, mapping, rows })
      setResult(res)
      if (res.ok) {
        toast.success(`${res.inserted} códigos importados`)
      } else {
        toast.error("La importación terminó con errores")
      }
    } catch {
      toast.error("Error al importar")
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Selecciona campaña y archivo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="campaign">Campaña destino</Label>
            <select
              id="campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center transition-colors hover:bg-muted/50">
            <Upload className="size-6 text-muted-foreground" />
            <span className="text-sm font-medium">
              {fileName || "Sube un archivo XLSX o CSV"}
            </span>
            <span className="text-xs text-muted-foreground">
              El archivo no se guarda: solo se importan los códigos a la base de datos.
            </span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
            />
          </label>
        </CardContent>
      </Card>

      {headers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Mapea las columnas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {TARGET_FIELDS.map((field) => (
              <div key={field.key} className="flex items-center justify-between gap-4">
                <Label className="flex-1">
                  {field.label}
                  {field.required && <span className="text-coral"> *</span>}
                </Label>
                <select
                  value={mapping[field.key] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [field.key]: e.target.value }))
                  }
                  className="h-9 w-56 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  <option value="">— Ignorar —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && mapping.code && (
        <Card>
          <CardHeader>
            <CardTitle>3. Vista previa ({rows.length} filas)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {TARGET_FIELDS.filter((f) => mapping[f.key]).map((f) => (
                      <TableHead key={f.key}>{f.label}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((r, i) => (
                    <TableRow key={i}>
                      {TARGET_FIELDS.filter((f) => mapping[f.key]).map((f) => (
                        <TableCell key={f.key} className="text-xs">
                          {r[mapping[f.key]] || "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {rows.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={runImport}
            disabled={importing || !mapping.code}
            size="lg"
            className="bg-coral text-coral-foreground hover:bg-coral/90"
          >
            <FileSpreadsheet className="size-4" />
            {importing ? "Importando…" : `Importar ${rows.length} códigos`}
          </Button>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.ok ? (
                <CheckCircle2 className="size-5 text-[var(--level-bajo)]" />
              ) : (
                <AlertTriangle className="size-5 text-destructive" />
              )}
              Resultado
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>
              <strong>{result.inserted}</strong> códigos importados ·{" "}
              <strong>{result.skipped}</strong> omitidos (duplicados).
            </p>
            {result.unmatchedRewards.length > 0 && (
              <div className="rounded-lg bg-[var(--level-alto)]/10 p-3">
                <p className="font-medium text-[var(--level-alto)]">
                  Premios sin coincidencia ({result.unmatchedRewards.length})
                </p>
                <p className="text-xs text-muted-foreground">
                  Estos nombres no existen en Premios. Los códigos se importaron sin premio asociado: {result.unmatchedRewards.join(", ")}
                </p>
              </div>
            )}
            {result.errors.length > 0 && (
              <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                {result.errors.join("; ")}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
