"use client"

import { useState } from "react"
import { Gift } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { RewardCard, type RewardCardData } from "@/components/client/reward-card"

export function RewardsTabs({ rewards }: { rewards: RewardCardData[] }) {
  const [tab, setTab] = useState("available")

  const available = rewards.filter((r) => r.status === "AVAILABLE")
  const redeemed = rewards.filter((r) => r.status === "REDEEMED")
  const expired = rewards.filter(
    (r) => r.status === "EXPIRED" || r.status === "CANCELLED",
  )

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="available">
          Disponibles{available.length > 0 ? ` (${available.length})` : ""}
        </TabsTrigger>
        <TabsTrigger value="redeemed">Canjeados</TabsTrigger>
        <TabsTrigger value="expired">Caducados</TabsTrigger>
      </TabsList>

      <TabsContent value="available" className="mt-4">
        <RewardList
          items={available}
          empty="Aún no tienes premios disponibles. ¡Escanea un rasca!"
        />
      </TabsContent>
      <TabsContent value="redeemed" className="mt-4">
        <RewardList items={redeemed} empty="Todavía no has canjeado ningún premio." />
      </TabsContent>
      <TabsContent value="expired" className="mt-4">
        <RewardList items={expired} empty="No tienes premios caducados." />
      </TabsContent>
    </Tabs>
  )
}

function RewardList({
  items,
  empty,
}: {
  items: RewardCardData[]
  empty: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
        <Gift className="h-8 w-8 text-muted-foreground" />
        <p className="max-w-[16rem] text-sm text-muted-foreground text-pretty">
          {empty}
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {items.map((r) => (
        <RewardCard key={r.id} reward={r} href={`/app/rewards/${r.id}`} />
      ))}
    </div>
  )
}
