"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireRole } from "@/lib/auth"

type Result = { ok: true } | { ok: false; error: string }

async function assertAdmin() {
  await requireRole(["admin"])
}

/* ---------------- Reward definitions ---------------- */

const rewardSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2),
  short_description: z.string().trim().max(80).optional().default(""),
  description: z.string().trim().optional().default(""),
  level: z.enum(["BAJO", "MEDIO", "ALTO", "PREMIUM"]),
  icon: z.string().trim().default("gift"),
  terms: z.string().trim().optional().default(""),
  expiration_days: z.coerce.number().int().min(1).max(365).default(30),
  active: z.coerce.boolean().default(true),
  requires_manager_confirmation: z.coerce.boolean().default(false),
})

export async function saveRewardDefinitionAction(
  _prev: unknown,
  formData: FormData,
): Promise<Result> {
  await assertAdmin()
  const parsed = rewardSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    short_description: formData.get("short_description") ?? "",
    description: formData.get("description") ?? "",
    level: formData.get("level"),
    icon: formData.get("icon") || "gift",
    terms: formData.get("terms") ?? "",
    expiration_days: formData.get("expiration_days") ?? 30,
    active: formData.get("active") === "on" || formData.get("active") === "true",
    requires_manager_confirmation:
      formData.get("requires_manager_confirmation") === "on" ||
      formData.get("requires_manager_confirmation") === "true",
  })
  if (!parsed.success) return { ok: false, error: "Datos no válidos." }

  const supabase = await createClient()
  const { id, ...values } = parsed.data
  const slug = slugify(values.name)

  if (id) {
    const { error } = await supabase
      .from("reward_definitions")
      .update({ ...values })
      .eq("id", id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await supabase
      .from("reward_definitions")
      .insert({ ...values, slug, expiration_type: "DAYS" })
    if (error) return { ok: false, error: error.message }
  }
  revalidatePath("/admin/rewards")
  return { ok: true }
}

export async function toggleRewardActiveAction(
  id: string,
  active: boolean,
): Promise<Result> {
  await assertAdmin()
  const supabase = await createClient()
  const { error } = await supabase
    .from("reward_definitions")
    .update({ active })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/rewards")
  return { ok: true }
}

/* ---------------- Restaurants ---------------- */

const restaurantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2),
  address: z.string().trim().optional().default(""),
  active: z.coerce.boolean().default(true),
})

export async function saveRestaurantAction(
  _prev: unknown,
  formData: FormData,
): Promise<Result> {
  await assertAdmin()
  const parsed = restaurantSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    address: formData.get("address") ?? "",
    active: formData.get("active") === "on" || formData.get("active") === "true",
  })
  if (!parsed.success) return { ok: false, error: "Datos no válidos." }

  const supabase = await createClient()
  const { id, ...values } = parsed.data
  if (id) {
    const { error } = await supabase.from("restaurants").update(values).eq("id", id)
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await supabase
      .from("restaurants")
      .insert({ ...values, slug: slugify(values.name) })
    if (error) return { ok: false, error: error.message }
  }
  revalidatePath("/admin/restaurants")
  return { ok: true }
}

/* ---------------- Campaigns ---------------- */

export async function setCampaignStatusAction(
  id: string,
  status: "ACTIVE" | "PAUSED" | "ENDED",
): Promise<Result> {
  await assertAdmin()
  const supabase = await createClient()
  const { error } = await supabase.from("campaigns").update({ status }).eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/campaigns")
  return { ok: true }
}

/* ---------------- Staff management ---------------- */

const staffSchema = z.object({
  email: z.string().email(),
  first_name: z.string().trim().min(1),
  last_name: z.string().trim().optional().default(""),
  role: z.enum(["staff", "manager", "admin"]),
  password: z.string().min(8),
  restaurant_id: z.string().uuid().optional(),
})

export async function createStaffAction(
  _prev: unknown,
  formData: FormData,
): Promise<Result> {
  await assertAdmin()
  const parsed = staffSchema.safeParse({
    email: formData.get("email"),
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name") ?? "",
    role: formData.get("role"),
    password: formData.get("password"),
    restaurant_id: formData.get("restaurant_id") || undefined,
  })
  if (!parsed.success) return { ok: false, error: "Revisa los campos del formulario." }

  const admin = createAdminClient()
  const { data: created, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
    },
  })
  if (error || !created.user) {
    return { ok: false, error: error?.message ?? "No se pudo crear el usuario." }
  }

  // Elevate role + set names on the profile (created by trigger).
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: parsed.data.role,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
    })
    .eq("id", created.user.id)
  if (profileError) return { ok: false, error: profileError.message }

  if (parsed.data.restaurant_id) {
    await admin.from("staff_restaurants").insert({
      user_id: created.user.id,
      restaurant_id: parsed.data.restaurant_id,
    })
  }

  revalidatePath("/admin/staff")
  return { ok: true }
}

export async function updateStaffRoleAction(
  userId: string,
  role: "client" | "staff" | "manager" | "admin",
): Promise<Result> {
  await assertAdmin()
  const admin = createAdminClient()
  const { error } = await admin.from("profiles").update({ role }).eq("id", userId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/staff")
  return { ok: true }
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}
