"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { LevelAnalyticsRow } from "@/lib/analytics"
import { LEVEL_META, type RewardLevel } from "@/lib/constants"

const config = {
  claimed: { label: "Reclamados", color: "var(--chart-1)" },
  redeemed: { label: "Canjeados", color: "var(--chart-2)" },
} satisfies ChartConfig

export function LevelBreakdown({ rows }: { rows: LevelAnalyticsRow[] }) {
  const data = rows.map((r) => ({
    level: LEVEL_META[r.level as RewardLevel]?.label ?? r.level,
    claimed: r.claimed,
    redeemed: r.redeemed,
  }))

  return (
    <ChartContainer config={config} className="h-[240px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="level" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="claimed" fill="var(--color-claimed)" radius={4} />
        <Bar dataKey="redeemed" fill="var(--color-redeemed)" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
