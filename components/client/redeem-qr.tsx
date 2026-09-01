"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { QRCodeCanvas } from "qrcode.react"
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createRedemptionTokenAction } from "@/app/actions/rewards"

const TOKEN_TTL_SECONDS = 5 * 60

export function RedeemQrButton({ rewardId }: { rewardId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState(TOKEN_TTL_SECONDS)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const generate = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await createRedemptionTokenAction(rewardId)
    setLoading(false)
    if (!res.ok) {
      setError(
        res.error === "NOT_AVAILABLE" || res.error === "EXPIRED"
          ? "Este premio ya no está disponible."
          : "No se pudo generar el QR. Inténtalo de nuevo.",
      )
      return
    }
    setToken(res.token)
    setRemaining(TOKEN_TTL_SECONDS)
  }, [rewardId])

  // Countdown
  useEffect(() => {
    if (!open || !token) return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [open, token])

  // Poll for redemption completion so the UI flips to "canjeado"
  useEffect(() => {
    if (!open || !token) return
    pollRef.current = setInterval(() => {
      router.refresh()
    }, 4000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [open, token, router])

  function handleOpen() {
    setOpen(true)
    generate()
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <>
      <Button size="lg" className="w-full" onClick={handleOpen}>
        Mostrar para canjear
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center font-display">
              QR de canje
            </DialogTitle>
            <DialogDescription className="text-center text-pretty">
              Enseña este QR al personal de Sushi Tok. No lo compartas.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-2">
            {loading && (
              <div className="flex h-64 w-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!loading && error && (
              <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-destructive text-pretty">{error}</p>
                <Button variant="outline" onClick={generate}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Reintentar
                </Button>
              </div>
            )}

            {!loading && !error && token && remaining > 0 && (
              <>
                <div className="rounded-2xl bg-white p-4">
                  <QRCodeCanvas value={token} size={224} level="M" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Válido durante{" "}
                  <span className="font-mono font-medium text-foreground">
                    {mins}:{secs.toString().padStart(2, "0")}
                  </span>
                </div>
              </>
            )}

            {!loading && !error && remaining === 0 && (
              <div className="flex h-64 w-64 flex-col items-center justify-center gap-3 text-center">
                <p className="text-sm text-muted-foreground text-pretty">
                  El QR ha caducado por seguridad.
                </p>
                <Button variant="outline" onClick={generate}>
                  <RefreshCw className="mr-2 h-4 w-4" /> Generar nuevo QR
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
