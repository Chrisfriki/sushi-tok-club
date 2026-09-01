'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { registerAction, type ActionResult } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type RestaurantOption = { id: string; name: string }

export function RegisterForm({
  next,
  restaurants,
}: {
  next?: string
  restaurants: RestaurantOption[]
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    registerAction,
    null,
  )

  useEffect(() => {
    if (state?.ok && state.redirectTo) {
      router.replace(state.redirectTo)
    }
  }, [state, router])

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="first_name">Nombre</Label>
          <Input id="first_name" name="first_name" autoComplete="given-name" required />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="last_name">Apellidos</Label>
          <Input id="last_name" name="last_name" autoComplete="family-name" required />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="600 000 000"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label htmlFor="birth_date">
            Nacimiento <span className="text-muted-foreground">(opc.)</span>
          </Label>
          <Input id="birth_date" name="birth_date" type="date" />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="instagram">
            Instagram <span className="text-muted-foreground">(opc.)</span>
          </Label>
          <Input id="instagram" name="instagram" placeholder="@usuario" autoComplete="off" />
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="favorite_restaurant_id">
          Restaurante habitual <span className="text-muted-foreground">(opc.)</span>
        </Label>
        <select
          id="favorite_restaurant_id"
          name="favorite_restaurant_id"
          defaultValue=""
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">Selecciona…</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          required
        />
      </div>

      {/* Consents */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="accept_terms"
            required
            className="mt-0.5 size-4 shrink-0 accent-[var(--coral)]"
          />
          <span className="leading-snug">
            Estoy de acuerdo con la{' '}
            <Link href="/legal/privacidad" className="underline underline-offset-2">
              Política de Privacidad
            </Link>{' '}
            y las{' '}
            <Link href="/legal/bases" className="underline underline-offset-2">
              Bases Legales
            </Link>{' '}
            de la promoción.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="marketing_consent"
            className="mt-0.5 size-4 shrink-0 accent-[var(--coral)]"
          />
          <span className="leading-snug text-muted-foreground">
            Quiero recibir promociones, regalos y novedades de Sushi Tok.
          </span>
        </label>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-12 bg-coral text-coral-foreground hover:bg-coral/90"
      >
        {pending && <Loader2 className="size-4 animate-spin" />}
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'}
          className="font-medium text-foreground underline underline-offset-4"
        >
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
