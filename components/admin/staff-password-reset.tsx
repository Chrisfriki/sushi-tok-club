"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { KeyRound, RefreshCw, Copy, Mail, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  resetStaffPasswordAction,
  sendStaffPasswordResetEmailAction,
} from "@/app/actions/admin"

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  let out = ""
  for (let i = 0; i < length; i++) out += chars[values[i] % chars.length]
  return out
}

export function StaffPasswordReset({
  userId,
  name,
  email,
}: {
  userId: string
  name: string
  email: string
}) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [pending, startTransition] = useTransition()
  const [sending, startSending] = useTransition()

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && !password) setPassword(generatePassword())
    if (!next) setPassword("")
  }

  function handleSendEmail() {
    startSending(async () => {
      const res = await sendStaffPasswordResetEmailAction(userId)
      if (res.ok) {
        toast.success(`Enlace de restablecimiento enviado a ${email}.`)
        setOpen(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleSubmit() {
    startTransition(async () => {
      const res = await resetStaffPasswordAction(userId, password)
      if (res.ok) {
        toast.success("Contraseña restablecida. Cópiala y compártela con el empleado.")
        setOpen(false)
      } else {
        toast.error(res.error)
      }
    })
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password)
      toast.success("Contraseña copiada")
    } catch {
      toast.error("No se pudo copiar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
            <KeyRound className="size-4" /> Contraseña
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            {`La contraseña actual no se puede recuperar, solo restablecer. Lo recomendado es enviar un enlace al correo del empleado para que él mismo elija una nueva.`}
          </DialogDescription>
        </DialogHeader>

        {/* Opción recomendada: enviar enlace por correo */}
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-coral" />
            <span className="text-sm font-medium">Enviar enlace por correo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {`Se enviará un enlace de restablecimiento a `}
            <span className="font-medium text-foreground">{email || "—"}</span>
            {`. El empleado abrirá el enlace y establecerá su propia contraseña.`}
          </p>
          <Button
            type="button"
            onClick={handleSendEmail}
            disabled={sending || !email}
            className="bg-coral text-coral-foreground hover:bg-coral/90"
          >
            {sending && <Loader2 className="size-4 animate-spin" />}
            <Mail className="size-4" />
            Enviar enlace a {email || "—"}
          </Button>
        </div>

        <div className="flex items-center gap-3 py-1">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">o</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* Alternativa: asignar contraseña manualmente */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">Asignar contraseña manualmente</Label>
          <div className="flex items-center gap-2">
            <Input
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="font-mono"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setPassword(generatePassword())}
              aria-label="Generar nueva contraseña"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={copyPassword}
              aria-label="Copiar contraseña"
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {"Mínimo 8 caracteres. Comparte esta contraseña con el empleado de forma segura."}
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit}
            disabled={pending || password.length < 8}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            {pending ? "Guardando…" : "Asignar manualmente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
