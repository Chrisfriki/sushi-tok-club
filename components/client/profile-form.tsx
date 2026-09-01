"use client"

import { useActionState, useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, LogOut, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  updateProfileAction,
  setMarketingConsentAction,
  requestDeletionAction,
  type ActionResult,
} from "@/app/actions/profile"
import { logoutAction } from "@/app/actions/auth"
import type { SessionProfile } from "@/lib/auth"

type Restaurant = { id: string; name: string }

export function ProfileForm({
  profile,
  restaurants,
}: {
  profile: SessionProfile
  restaurants: Restaurant[]
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateProfileAction,
    null,
  )
  const [marketing, setMarketing] = useState(profile.marketing_consent)
  const [restaurant, setRestaurant] = useState(profile.favorite_restaurant_id ?? "")
  const [marketingPending, startMarketing] = useTransition()
  const [deletePending, startDelete] = useTransition()
  const [loggingOut, startLogout] = useTransition()

  useEffect(() => {
    if (state?.ok && state.message) toast.success(state.message)
    if (state?.error) toast.error(state.error)
  }, [state])

  function onMarketingChange(value: boolean) {
    setMarketing(value)
    startMarketing(async () => {
      const res = await setMarketingConsentAction(value)
      if (!res.ok) {
        setMarketing(!value)
        toast.error(res.error ?? "No se pudo actualizar.")
      } else {
        toast.success(
          value ? "Recibirás nuestras promociones." : "Ya no recibirás promociones.",
        )
      }
    })
  }

  function onRequestDeletion() {
    startDelete(async () => {
      const res = await requestDeletionAction()
      if (res.ok) toast.success(res.message ?? "Solicitud registrada.")
      else toast.error(res.error ?? "No se pudo registrar.")
    })
  }

  function onLogout() {
    startLogout(async () => {
      await logoutAction()
      router.replace("/login")
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Personal data */}
      <form action={formAction} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" name="first_name" defaultValue={profile.first_name ?? ""} />
          <Field label="Apellidos" name="last_name" defaultValue={profile.last_name ?? ""} />
        </div>
        <Field
          label="Email"
          name="email"
          defaultValue={profile.email ?? ""}
          disabled
          hint="El email no se puede modificar."
        />
        <Field label="Teléfono" name="phone" type="tel" defaultValue={profile.phone ?? ""} />
        <Field
          label="Fecha de nacimiento"
          name="birth_date"
          type="date"
          defaultValue={profile.birth_date ?? ""}
        />

        <div className="flex flex-col gap-2">
          <Label htmlFor="favorite_restaurant_id">Restaurante favorito</Label>
          <select
            id="favorite_restaurant_id"
            name="favorite_restaurant_id"
            value={restaurant}
            onChange={(e) => setRestaurant(e.target.value)}
            className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">Selecciona un local</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <Field
          label="Instagram"
          name="instagram"
          defaultValue={profile.instagram ?? ""}
          placeholder="@tuusuario"
        />

        <Button type="submit" disabled={pending} className="mt-2">
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar cambios
        </Button>
      </form>

      <Separator />

      {/* Communications */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Comunicaciones
        </h2>
        <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
          <div className="pr-4">
            <p className="font-medium text-foreground">Recibir promociones</p>
            <p className="text-sm text-muted-foreground text-pretty">
              Regalos, novedades y promociones de Sushi Tok.
            </p>
          </div>
          <Switch
            checked={marketing}
            onCheckedChange={onMarketingChange}
            disabled={marketingPending}
            aria-label="Recibir promociones"
          />
        </div>
      </section>

      <Separator />

      {/* Privacy */}
      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-foreground">
          Privacidad
        </h2>
        <div className="flex flex-col gap-2">
          <a
            href="/legal/privacidad"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
          >
            Política de privacidad
          </a>
          <a
            href="/legal/bases"
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground"
          >
            Bases legales de la promoción
          </a>
          <button
            onClick={() => onMarketingChange(false)}
            disabled={!marketing || marketingPending}
            className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground disabled:opacity-50"
          >
            Retirar consentimiento comercial
          </button>
          <button
            onClick={onRequestDeletion}
            disabled={deletePending}
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-left text-sm text-destructive"
          >
            {deletePending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Solicitar eliminación de cuenta
          </button>
        </div>
      </section>

      <Button variant="outline" onClick={onLogout} disabled={loggingOut} className="mt-2">
        {loggingOut ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="mr-2 h-4 w-4" />
        )}
        Cerrar sesión
      </Button>
    </div>
  )
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  disabled,
  hint,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
