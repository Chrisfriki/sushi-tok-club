"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { saveRewardDefinitionAction } from "@/app/actions/admin"
import { Plus, Pencil } from "lucide-react"

type RewardDef = {
  id: string
  name: string
  short_description: string | null
  description: string | null
  level: string
  icon: string | null
  terms: string | null
  expiration_days: number | null
  active: boolean
  requires_manager_confirmation: boolean
}

const LEVELS = ["BAJO", "MEDIO", "ALTO", "PREMIUM"]
const ICONS = [
  "ice-cream",
  "coffee",
  "cup-soda",
  "glass-water",
  "cake-slice",
  "badge-euro",
  "percent",
  "utensils",
  "utensils-crossed",
  "users",
  "sparkles",
]

export function RewardEditor({ reward }: { reward?: RewardDef }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(saveRewardDefinitionAction, null)
  const [active, setActive] = useState(reward?.active ?? true)
  const [manager, setManager] = useState(reward?.requires_manager_confirmation ?? false)

  // Close on success
  if (state?.ok && open) {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          reward ? (
            <Button variant="ghost" size="icon" aria-label="Editar premio">
              <Pencil className="size-4" />
            </Button>
          ) : (
            <Button className="bg-coral text-coral-foreground hover:bg-coral/90">
              <Plus className="size-4" />
              Nuevo premio
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{reward ? "Editar premio" : "Nuevo premio"}</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          {reward && <input type="hidden" name="id" value={reward.id} />}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={reward?.name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="short_description">Descripción corta</Label>
            <Input
              id="short_description"
              name="short_description"
              defaultValue={reward?.short_description ?? ""}
              maxLength={80}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={reward?.description ?? ""}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="level">Nivel</Label>
              <select
                id="level"
                name="level"
                defaultValue={reward?.level ?? "BAJO"}
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring dark:bg-input/30"
              >
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="icon">Icono</Label>
              <select
                id="icon"
                name="icon"
                defaultValue={reward?.icon ?? "gift"}
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring dark:bg-input/30"
              >
                <option value="gift">gift</option>
                {ICONS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expiration_days">Días de caducidad</Label>
            <Input
              id="expiration_days"
              name="expiration_days"
              type="number"
              min={1}
              max={365}
              defaultValue={reward?.expiration_days ?? 30}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="terms">Condiciones</Label>
            <Textarea id="terms" name="terms" defaultValue={reward?.terms ?? ""} rows={2} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="active">Activo</Label>
            <input type="hidden" name="active" value={active ? "true" : "false"} />
            <Switch id="active" checked={active} onCheckedChange={setActive} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="requires_manager_confirmation">Requiere confirmación de manager</Label>
            <input
              type="hidden"
              name="requires_manager_confirmation"
              value={manager ? "true" : "false"}
            />
            <Switch
              id="requires_manager_confirmation"
              checked={manager}
              onCheckedChange={setManager}
            />
          </div>
          {state && !state.ok && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <DialogFooter>
            <Button
              type="submit"
              disabled={pending}
              className="bg-coral text-coral-foreground hover:bg-coral/90"
            >
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
