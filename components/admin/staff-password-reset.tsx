"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { KeyRound, RefreshCw, Copy } from "lucide-react"
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
import { resetStaffPasswordAction } from "@/app/actions/admin"

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

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next && !password) setPassword(generatePassword())
    if (!next) setPassword("")
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
            {`Se asignará una nueva contraseña a ${name || email}. La contraseña actual no se puede recuperar, solo reemplazar.`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">Nueva contraseña</Label>
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
            onClick={handleSubmit}
            disabled={pending || password.length < 8}
            className="bg-coral text-coral-foreground hover:bg-coral/90"
          >
            {pending ? "Guardando…" : "Restablecer contraseña"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
