import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PrizeValidator } from "@/components/staff/prize-validator"

export const metadata = { title: "Validar premio · Staff" }

export default async function StaffHomePage() {
  const profile = await requireRole(["staff", "manager", "admin"], "/staff")
  const supabase = await createClient()

  // Restaurants this employee can redeem at. Admins/managers can use any active one.
  let restaurants: { id: string; name: string }[] = []

  if (profile.role === "admin") {
    const { data } = await supabase
      .from("restaurants")
      .select("id, name")
      .eq("active", true)
      .order("name")
    restaurants = data ?? []
  } else {
    const { data } = await supabase
      .from("staff_restaurants")
      .select("restaurant:restaurants(id, name)")
      .eq("user_id", profile.id)
    restaurants =
      (data
        ?.map((row) => row.restaurant as unknown as { id: string; name: string })
        .filter(Boolean) as { id: string; name: string }[]) ?? []

    // Fallback: if no explicit assignment, allow any active restaurant so the
    // flow is testable. Tighten this in production by requiring assignments.
    if (restaurants.length === 0) {
      const { data: all } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("active", true)
        .order("name")
      restaurants = all ?? []
    }
  }

  return <PrizeValidator restaurants={restaurants} />
}
