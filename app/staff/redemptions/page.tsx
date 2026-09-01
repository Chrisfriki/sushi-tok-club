import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { CheckCircle2 } from "lucide-react"
import { formatDateTime } from "@/lib/format"

export const metadata = { title: "Canjes · Staff" }

export default async function StaffRedemptionsPage() {
  const profile = await requireRole(["staff", "manager", "admin"], "/staff")
  const supabase = await createClient()

  // Staff see their own redemptions; managers/admins see all (RLS allows staff+ to read).
  let query = supabase
    .from("redemptions")
    .select(
      "id, created_at, restaurant:restaurants(name), reward:user_rewards(reward:reward_definitions(name)), staff:profiles!redemptions_staff_user_id_fkey(first_name, last_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100)

  if (profile.role === "staff") {
    query = query.eq("staff_user_id", profile.id)
  }

  const { data } = await query
  const rows = data ?? []

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Canjes recientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.role === "staff"
            ? "Premios que has validado."
            : "Premios validados en tus restaurantes."}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-center">
          <CheckCircle2 className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Aún no hay canjes registrados.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((r) => {
            const rewardName =
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (r as any).reward?.reward?.name ?? "Premio"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const restaurant = (r as any).restaurant?.name ?? "—"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const staff = (r as any).staff
            const staffName = staff
              ? `${staff.first_name ?? ""} ${staff.last_name ?? ""}`.trim()
              : ""
            return (
              <li
                key={r.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                  <CheckCircle2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{rewardName}</p>
                  <p className="text-xs text-muted-foreground">
                    {restaurant}
                    {staffName && profile.role !== "staff" ? ` · ${staffName}` : ""}
                  </p>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground">
                  {formatDateTime(r.created_at)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
