import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/client/profile-form"

export default async function ProfilePage() {
  const profile = await requireUser("/app/profile")
  const supabase = await createClient()

  const { data: restaurants } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("active", true)
    .order("name")

  const initials =
    `${profile.first_name?.[0] ?? ""}${profile.last_name?.[0] ?? ""}`.toUpperCase() ||
    "ST"

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      <header className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-bold text-foreground">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </header>

      <ProfileForm profile={profile} restaurants={restaurants ?? []} />
    </div>
  )
}
