"use client"

import { useState } from "react"
import {
  Camera,
  Keyboard,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { QrScanner } from "@/components/shared/qr-scanner"
import {
  lookupTokenAction,
  redeemTokenAction,
  type TokenDetails,
} from "@/app/actions/staff"
import { LEVEL_META, type RewardLevel } from "@/lib/constants"
import { formatDate } from "@/lib/format"

type Restaurant = { id: string; name: string }

export function PrizeValidator({ restaurants }: { restaurants: Restaurant[] }) {
  const [mode, setMode] = useState<"idle" | "camera" | "manual">("idle")
  const [token, setToken] = useState("")
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<TokenDetails | null>(null)
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? "")
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function lookup(raw: string) {
    const value = raw.trim()
    if (value.length < 6) {
      setError("Token no válido.")
      return
    }
    setLoading(true)
    setError(null)
    setDetails(null)
    const res = await lookupTokenAction(value)
    setLoading(false)
    setMode("idle")
    if (!res.ok) {
      setError(lookupErrorMessage(res.error))
      return
    }
    setToken(value)
    setDetails(res)
  }

  async function confirm() {
    if (!restaurantId) {
      toast.error("Selecciona un restaurante.")
      return
    }
    setConfirming(true)
    const res = await redeemTokenAction(token, restaurantId)
    setConfirming(false)
    setConfirmOpen(false)
    if (!res.ok) {
      setError(redeemErrorMessage(res.error))
      setDetails(null)
      return
    }
    if ("vibrate" in navigator) navigator.vibrate?.(60)
    toast.success("Premio canjeado correctamente.")
    setDetails(null)
    setToken("")
  }

  function reset() {
    setDetails(null)
    setError(null)
    setToken("")
    setMode("idle")
  }

  // Result screen after a successful lookup
  if (details) {
    const level = (details.rewardLevel as RewardLevel) ?? "BAJO"
    const meta = LEVEL_META[level]
    const blocked =
      details.tokenExpired ||
      details.tokenUsed ||
      details.rewardStatus !== "AVAILABLE"

    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <Badge
            className="mb-3"
            style={{ backgroundColor: meta.color, color: "#fff" }}
          >
            {meta.label}
          </Badge>
          <h2 className="text-2xl font-bold text-balance">
            {details.rewardName ?? "Premio"}
          </h2>
          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Cliente</dt>
              <dd className="font-medium">{details.customerName ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Caduca</dt>
              <dd className="font-medium">
                {details.rewardExpiresAt
                  ? formatDate(details.rewardExpiresAt)
                  : "Sin caducidad"}
              </dd>
            </div>
            {details.rewardTerms ? (
              <div className="mt-1">
                <dt className="text-muted-foreground">Condiciones</dt>
                <dd className="mt-0.5">{details.rewardTerms}</dd>
              </div>
            ) : null}
          </dl>

          {details.requiresManagerConfirmation ? (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0" />
              Requiere confirmación de un responsable.
            </div>
          ) : null}
        </div>

        {blocked ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <XCircle className="size-5 shrink-0" />
            {details.tokenUsed
              ? "Este QR ya ha sido utilizado."
              : details.tokenExpired
                ? "Este QR ha caducado. Pide al cliente que genere uno nuevo."
                : details.rewardStatus === "REDEEMED"
                  ? "Este premio ya ha sido canjeado."
                  : "Este premio no está disponible."}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-restaurant">Restaurante</Label>
              <select
                id="staff-restaurant"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <Button
              size="lg"
              className="h-14 bg-success text-base font-semibold text-success-foreground hover:bg-success/90"
              onClick={() => setConfirmOpen(true)}
            >
              <CheckCircle2 className="size-5" />
              Confirmar canje
            </Button>
          </div>
        )}

        <Button variant="ghost" onClick={reset}>
          Escanear otro
        </Button>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Confirmar canje?</DialogTitle>
              <DialogDescription>
                Vas a canjear <strong>{details.rewardName}</strong> de{" "}
                {details.customerName}. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmOpen(false)}
                disabled={confirming}
              >
                Cancelar
              </Button>
              <Button
                className="bg-success text-success-foreground hover:bg-success/90"
                onClick={confirm}
                disabled={confirming}
              >
                {confirming ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Validar premio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Escanea el QR del cliente o introduce el token manualmente.
        </p>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <XCircle className="size-5 shrink-0" />
          {error}
        </div>
      ) : null}

      {mode === "camera" ? (
        <QrScanner
          onResult={(text) => lookup(extractToken(text))}
          onCancel={() => setMode("idle")}
        />
      ) : mode === "manual" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            lookup(token)
          }}
          className="flex flex-col gap-3"
        >
          <Label htmlFor="token">Token de canje</Label>
          <Input
            id="token"
            autoFocus
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Introduce el token"
          />
          <Button type="submit" disabled={loading} className="h-12">
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Buscar premio"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setMode("idle")}>
            Volver
          </Button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="h-16 bg-coral text-base font-semibold text-coral-foreground hover:bg-coral/90"
            onClick={() => setMode("camera")}
            disabled={loading}
          >
            <Camera className="size-5" />
            Escanear QR
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-14"
            onClick={() => setMode("manual")}
            disabled={loading}
          >
            <Keyboard className="size-5" />
            Introducir token
          </Button>
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Buscando…
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

// The redeem QR encodes a URL like <origin>/redeem/<token>; accept either raw token or URL.
function extractToken(text: string): string {
  try {
    const url = new URL(text)
    const parts = url.pathname.split("/").filter(Boolean)
    return parts[parts.length - 1] ?? text
  } catch {
    return text
  }
}

function lookupErrorMessage(code: string): string {
  switch (code) {
    case "TOKEN_NOT_FOUND":
      return "Token no encontrado. Verifica el código."
    case "FORBIDDEN":
      return "No tienes permisos para validar premios."
    default:
      return "No se pudo comprobar el premio. Inténtalo de nuevo."
  }
}

function redeemErrorMessage(code: string): string {
  switch (code) {
    case "TOKEN_USED":
      return "Este QR ya ha sido utilizado."
    case "TOKEN_EXPIRED":
      return "Este QR ha caducado."
    case "ALREADY_REDEEMED":
      return "Este premio ya había sido canjeado."
    case "REWARD_EXPIRED":
      return "Este premio ha caducado."
    case "NOT_AVAILABLE":
      return "Este premio no está disponible."
    default:
      return "No se pudo completar el canje. Inténtalo de nuevo."
  }
}
