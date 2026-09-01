"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { saveRestaurantAction } from "@/app/actions/admin"

type Restaurant = {
  id: string
  name: string
  slug: string
  address: string | null
  active: boolean
}

export function RestaurantEditor({ restaurant }: { restaurant?: Restaurant }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(restaurant?.active ?? true)
  const [saving, setSaving] = useState(false)

  async function onSubmit(formData: FormData) {
    setSaving(true)
    formData.set("active", active ? "on" : "")
    if (restaurant) formData.set("id", restaurant.id)
    const res = await saveRestaurantAction(null, formData)
    setSaving(false)
    if (res.ok) {
      toast.success("Restaurante guardado")
      setOpen(false)
    } else {
      toast.error(res.error ?? "No se pudo guardar")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          restaurant ? (
            <Button variant="outline" size="sm">
              Editar
            </Button>
          ) : (
            <Button size="sm" className="bg-coral text-coral-foreground hover:bg-coral/90">
              <Plus className="size-4" /> Nuevo restaurante
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{restaurant ? "Editar restaurante" : "Nuevo restaurante"}</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" defaultValue={restaurant?.name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={restaurant?.slug} placeholder="alfafar" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" defaultValue={restaurant?.address ?? ""} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
            <Label htmlFor="active">Activo</Label>
            <Switch id="active" checked={active} onCheckedChange={setActive} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving} className="bg-coral text-coral-foreground hover:bg-coral/90">
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
