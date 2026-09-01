"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createStaffAction } from "@/app/actions/admin"

type Restaurant = { id: string; name: string }

export function StaffCreator({ restaurants }: { restaurants: Restaurant[] }) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(createStaffAction, null)

  useEffect(() => {
    if (state?.ok) {
      toast.success("Empleado creado")
      setOpen(false)
    } else if (state && !state.ok) {
      toast.error(state.error ?? "No se pudo crear el empleado")
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="bg-coral text-coral-foreground hover:bg-coral/90">
            <Plus className="size-4" /> Nuevo empleado
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo empleado</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="last_name">Apellidos</Label>
              <Input id="last_name" name="last_name" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Contraseña temporal</Label>
            <Input id="password" name="password" type="text" minLength={8} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                name="role"
                defaultValue="staff"
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="restaurant_id">Restaurante</Label>
              <select
                id="restaurant_id"
                name="restaurant_id"
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="">Sin asignar</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="bg-coral text-coral-foreground hover:bg-coral/90">
              {pending ? "Creando…" : "Crear empleado"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
