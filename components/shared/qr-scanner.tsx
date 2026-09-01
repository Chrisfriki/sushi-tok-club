"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"

const SCANNER_ID = "sushitok-shared-qr-reader"

/** Reusable camera QR scanner. Calls onResult with the raw decoded string. */
export function QrScanner({
  onResult,
  onCancel,
}: {
  onResult: (text: string) => void
  onCancel: () => void
}) {
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null)
  const handledRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function start() {
      setStarting(true)
      setError(null)
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
            if (navigator.vibrate) navigator.vibrate(60)
            scanner.stop().catch(() => {})
            onResult(decoded)
          },
          () => {},
        )
      } catch (err) {
        if (!cancelled) {
          console.log("[v0] staff camera error:", err)
          setError("No hemos podido acceder a la cámara. Usa el token manual.")
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
  }, [onResult])

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-black">
        <div
          id={SCANNER_ID}
          className="h-full w-full [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
        />
        {starting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-sm">Iniciando cámara…</span>
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-primary/70" />
      </div>
      {error ? (
        <div className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
          <CameraOff className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}
      <Button variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  )
}
