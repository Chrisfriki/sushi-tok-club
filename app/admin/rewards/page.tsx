import { requireRole } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/admin/ui"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RewardEditor } from "@/components/admin/reward-editor"
import { LEVEL_META, rewardIcon, type RewardLevel } from "@/lib/constants"

export default async function AdminRewardsPage() {
  await requireRole(["admin"])
  const supabase = await createClient()

  const { data: rewards } = await supabase
    .from("reward_definitions")
    .select("*")
    .order("level")
    .order("name")

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Premios" description="Catálogo de premios de las campañas.">
        <RewardEditor />
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(rewards ?? []).map((r) => {
          const Icon = rewardIcon(r.icon)
          const meta = LEVEL_META[r.level as RewardLevel]
          return (
            <Card key={r.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <div className={`flex size-11 items-center justify-center rounded-xl ${meta?.bg}`}>
                  <Icon className={`size-5 ${meta?.text}`} />
                </div>
                <RewardEditor reward={r} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold leading-tight">{r.name}</h3>
                  {!r.active && <Badge variant="outline">Inactivo</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{r.short_description}</p>
              </div>
              <div className="mt-auto flex items-center gap-2 text-xs">
                <Badge className={`${meta?.bg} ${meta?.text} border-0`}>{meta?.label}</Badge>
                <span className="text-muted-foreground">{r.expiration_days} días</span>
                {r.requires_manager_confirmation && (
                  <span className="text-muted-foreground">· Manager</span>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
