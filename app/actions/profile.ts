'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { TERMS_VERSION } from '@/lib/constants'

const profileSchema = z.object({
  first_name: z.string().trim().min(1, 'Introduce tu nombre'),
  last_name: z.string().trim().min(1, 'Introduce tus apellidos'),
  phone: z.string().trim().min(6, 'Teléfono no válido'),
  birth_date: z.string().optional().or(z.literal('')),
  favorite_restaurant_id: z.string().uuid().optional().or(z.literal('')),
  instagram: z.string().trim().optional().or(z.literal('')),
})

export type ActionResult = { ok: boolean; error?: string; message?: string }

export async function updateProfileAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    phone: formData.get('phone'),
    birth_date: formData.get('birth_date') ?? '',
    favorite_restaurant_id: formData.get('favorite_restaurant_id') ?? '',
    instagram: formData.get('instagram') ?? '',
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Datos no válidos' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      phone: parsed.data.phone,
      birth_date: parsed.data.birth_date || null,
      favorite_restaurant_id: parsed.data.favorite_restaurant_id || null,
      instagram: parsed.data.instagram || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'No se ha podido guardar. Inténtalo de nuevo.' }

  revalidatePath('/app/profile')
  return { ok: true, message: 'Perfil actualizado.' }
}

export async function setMarketingConsentAction(
  granted: boolean,
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('profiles')
    .update({
      marketing_consent: granted,
      marketing_consent_at: granted ? now : null,
      updated_at: now,
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'No se ha podido actualizar.' }

  await supabase.from('consents').insert({
    user_id: user.id,
    type: 'marketing',
    granted,
    version: TERMS_VERSION,
  })

  revalidatePath('/app/profile')
  return { ok: true }
}

export async function requestDeletionAction(): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('profiles')
    .update({ deletion_requested_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { ok: false, error: 'No se ha podido registrar la solicitud.' }

  revalidatePath('/app/profile')
  return {
    ok: true,
    message: 'Hemos registrado tu solicitud de eliminación. Nos pondremos en contacto.',
  }
}
