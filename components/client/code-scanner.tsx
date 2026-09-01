"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Camera, Keyboard, Loader2, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const SCANNER_ID = "sushitok-qr-reader"

/** Extracts a code from a raw QR value that may be a URL like /r/ST-ABC123 */
function extractCode(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/\/r\/([^/?#\s]+)/i)
  if (match) return decodeURIComponent(match[1]).toUpperCase()
  return trimmed.toUpperCase()
}

export function CodeScanner() {
  const router = useRouter()
  const [mode, setMode] = useState<"camera" | "manual">("camera")
  const [manual, setManual] = useState("")
  const [starting, setStarting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null)
  const handledRef = useRef(false)

  useEffect(() => {
    if (mode !== "camera") return
    let cancelled = false

    async function start() {
      setStarting(true)
      setCameraError(null)
      handledRef.current = false
      try {
        const { Html5Qrcode } = await import("html5-qrcode")
        if (cancelled) return
        const scanner = new Html5Qrcode(SCANNER_ID)
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decoded) => {
            if (handledRef.current) return
            handledRef.current = true
            const code = extractCode(decoded)
            if (navigator.vibrate) navigator.vibrate(60)
            scanner.stop().catch(() => {})
            router.push(`/r/${encodeURIComponent(code)}`)
          },
          () => {},
        )
      } catch (err) {
        if (!cancelled) {
          console.log("[v0] camera error:", err)
          setCameraError(
            "No hemos podido acceder a la cámara. Introduce el código manualmente.",
          )
          setMode("manual")
        }
      } finally {
        if (!cancelled) setStarting(false)
      }
    }

    start()
    return () => {
      cancelled = true
      const s = scannerRef.current
      if (s) {
        s.stop()
          .then(() => s.clear())
          .catch(() => {})
      }
    }
  }, [mode, router])

  function submitManual(e: React.FormEvent) {
    e.preventDefault()
    const code = extractCode(manual)
    if (!code) return
    router.push(`/r/${encodeURIComponent(code)}`)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 rounded-full bg-muted p-1">
        <button
          onClick={() => setMode("camera")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors",
            mode === "camera"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground",
          )}
        >
          <Camera className="h-4 w-4" /> Cámara
        </button>
        <button
          onClick={() => setMode("manual")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-2 text-sm font-medium transition-colors",
            mode === "manual"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground",
          )}
        >
          <Keyboard className="h-4 w-4" /> Manual
        </button>
      </div>

      {mode === "camera" && (
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-black">
            <div id={SCANNER_ID} className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover" />
            {starting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Iniciando cámara…</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-primary/70" />
          </div>
          <p className="text-center text-sm text-muted-foreground text-pretty">
            Apunta al código QR de tu rasca Sushi Tok.
          </p>
        </div>
      )}

      {mode === "manual" && (
        <form onSubmit={submitManual} className="flex flex-col gap-4">
          {cameraError && (
            <div className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              <CameraOff className="h-4 w-4 shrink-0" />
              {cameraError}
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Código del rasca</Label>
            <Input
              id="code"
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="ST-ABC123"
              autoCapitalize="characters"
              autoComplete="off"
              className="text-center font-mono text-lg tracking-widest uppercase"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={!manual.trim()}>
            Validar código
          </Button>
        </form>
      )}
    </div>
  )
}
