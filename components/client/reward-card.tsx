import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  rewardIcon,
  LEVEL_META,
  USER_REWARD_STATUS_META,
  type RewardLevel,
  type UserRewardStatus,
} from "@/lib/constants"
import { expiryLabel, formatDate } from "@/lib/format"

export type RewardCardData = {
  id: string
  status: UserRewardStatus
  level: RewardLevel | null
  expires_at: string | null
  redeemed_at: string | null
  reward_definitions: {
    name: string
    short_description: string | null
    icon: string | null
    level: RewardLevel
  } | null
}

export function RewardCard({
  reward,
  href,
}: {
  reward: RewardCardData
  href?: string
}) {
  const def = reward.reward_definitions
  const level = (def?.level ?? reward.level ?? "BAJO") as RewardLevel
  const meta = LEVEL_META[level]
  const Icon = rewardIcon(def?.icon)
  const statusMeta = USER_REWARD_STATUS_META[reward.status]
  const expiry = expiryLabel(reward.expires_at)

  const body = (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <div
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ring-1",
          meta.bg,
          meta.ring,
        )}
      >
        <Icon className={cn("h-7 w-7", meta.text)} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {meta.label}
          </span>
        </div>
        <h3 className="truncate font-display text-base font-semibold text-foreground">
          {def?.name ?? "Premio"}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-medium",
              statusMeta.className,
            )}
          >
            {statusMeta.label}
          </span>
          {reward.status === "AVAILABLE" && expiry && (
            <span
              className={cn(
                "text-muted-foreground",
                expiry.urgent && "font-medium text-destructive",
              )}
            >
              {expiry.text}
            </span>
          )}
          {reward.status === "REDEEMED" && reward.redeemed_at && (
            <span className="text-muted-foreground">
              {formatDate(reward.redeemed_at)}
            </span>
          )}
        </div>
      </div>

      {href && (
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    )
  }
  return body
}
