'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSessionProfile, defaultPathForRole } from '@/lib/auth'
import { TERMS_VERSION } from '@/lib/constants'

const registerSchema = z.object({
  first_name: z.string().trim().min(1, 'Introduce tu nombre'),
  last_name: z.string().trim().min(1, 'Introduce tus apellidos'),
  email: z.string().trim().toLowerCase().email('Email no válido'),
  phone: z.string().trim().min(6, 'Teléfono no válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  birth_date: z.string().optional().or(z.literal('')),
  favorite_restaurant_id: z.string().uuid().optional().or(z.literal('')),
  instagram: z.string().trim().optional().or(z.literal('')),
  accept_terms: z.literal(true, {
    message: 'Debes aceptar la Política de Privacidad y las Bases Legales.',
  }),
  marketing_consent: z.boolean().optional().default(false),
})

export type ActionResult = { ok: boolean; error?: string; redirectTo?: string }

/** Resolve the signed-in user's role and map it to their landing path. */
async function resolveRedirect(next?: string | null): Promise<string> {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next
  const profile = await getSessionProfile()
  return profile ? defaultPathForRole(profile.role) : '/app'
}

export async function registerAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    birth_date: formData.get('birth_date') ?? '',
    favorite_restaurant_id: formData.get('favorite_restaurant_id') ?? '',
    instagram: formData.get('instagram') ?? '',
    accept_terms: formData.get('accept_terms') === 'on',
    marketing_consent: formData.get('marketing_consent') === 'on',
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos no válidos' }
  }
  const data = parsed.data

  const admin = createAdminClient()

  // Create an already-confirmed user so the loyalty flow works immediately.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      instagram: data.instagram || null,
      birth_date: data.birth_date || null,
    },
  })

  if (createErr || !created.user) {
    const msg = createErr?.message ?? ''
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
      return { ok: false, error: 'Ya existe una cuenta con este email. Inicia sesión.' }
    }
    return { ok: false, error: 'No se ha podido crear la cuenta. Inténtalo de nuevo.' }
  }

  const now = new Date().toISOString()

  // Persist consent + profile detail via admin client (trigger already created the base profile).
  await admin
    .from('profiles')
    .update({
      birth_date: data.birth_date || null,
      favorite_restaurant_id: data.favorite_restaurant_id || null,
      instagram: data.instagram || null,
      terms_version: TERMS_VERSION,
      terms_accepted_at: now,
      marketing_consent: data.marketing_consent,
      marketing_consent_at: data.marketing_consent ? now : null,
      updated_at: now,
    })
    .eq('id', created.user.id)

  await admin.from('consents').insert([
    {
      user_id: created.user.id,
      type: 'terms',
      granted: true,
      version: TERMS_VERSION,
    },
    {
      user_id: created.user.id,
      type: 'marketing',
      granted: data.marketing_consent,
      version: TERMS_VERSION,
    },
  ])

  // Establish the session (sets auth cookies).
  const supabase = await createClient()
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })
  if (signInErr) {
    return { ok: false, error: 'Cuenta creada, pero no se pudo iniciar sesión. Prueba a iniciar sesión.' }
  }

  const next = formData.get('next') as string | null
  return { ok: true, redirectTo: await resolveRedirect(next) }
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email no válido'),
  password: z.string().min(1, 'Introduce tu contraseña'),
})

export async function loginAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos no válidos' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    const msg = error.message.toLowerCase()
    if (msg.includes('confirm')) {
      return { ok: false, error: 'Debes confirmar tu email antes de iniciar sesión.' }
    }
    if (msg.includes('rate') || error.status === 429) {
      return { ok: false, error: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.' }
    }
    return { ok: false, error: 'Email o contraseña incorrectos.' }
  }

  const next = formData.get('next') as string | null
  return { ok: true, redirectTo: await resolveRedirect(next) }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
