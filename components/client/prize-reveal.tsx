"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { PartyPopper } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  rewardIcon,
  LEVEL_META,
  type RewardLevel,
} from "@/lib/constants"
import { expiryLabel } from "@/lib/format"

type RevealData = {
  id: string
  level: RewardLevel
  expires_at: string | null
  name: string
  description: string | null
  terms: string | null
  icon: string | null
}

export function PrizeReveal({ reward }: { reward: RevealData }) {
  const [phase, setPhase] = useState<"count" | "reveal">("count")
  const [count, setCount] = useState(3)
  const isPremium = reward.level === "PREMIUM"
  const meta = LEVEL_META[reward.level]
  const Icon = rewardIcon(reward.icon)
  const expiry = expiryLabel(reward.expires_at)

  const haptic = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  }, [])

  useEffect(() => {
    if (phase !== "count") return
    if (count === 0) {
      setPhase("reveal")
      haptic(isPremium ? [80, 40, 80, 40, 160] : [60, 30, 120])
      return
    }
    haptic(40)
    const t = setTimeout(() => setCount((c) => c - 1), 750)
    return () => clearTimeout(t)
  }, [count, phase, haptic, isPremium])

  if (phase === "count") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-primary px-6 text-primary-foreground">
        <p className="mb-6 text-sm uppercase tracking-[0.3em] opacity-70">
          Preparando tu premio
        </p>
        <div
          key={count}
          className="animate-[pop_0.7s_ease-out] font-display text-[8rem] font-bold leading-none"
        >
          {count === 0 ? "" : count}
        </div>
        <style>{`
          @keyframes pop {
            0% { transform: scale(0.4); opacity: 0; }
            40% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-12">
      {isPremium && <Confetti />}

      <div className="animate-[rise_0.6s_ease-out] flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-2 flex items-center gap-2 text-primary">
          <PartyPopper className="h-5 w-5" />
          <span className="font-display text-lg font-bold uppercase tracking-wide">
            ¡Has ganado!
          </span>
        </div>

        <div
          className={cn(
            "my-6 flex h-36 w-36 items-center justify-center rounded-3xl ring-2",
            meta.bg,
            meta.ring,
          )}
        >
          <Icon className={cn("h-20 w-20", meta.text)} />
        </div>

        <div className="mb-2 flex items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Nivel {meta.label}
          </span>
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground text-balance">
          {reward.name}
        </h1>
        {reward.description && (
          <p className="mt-2 text-muted-foreground text-pretty">
            {reward.description}
          </p>
        )}

        <div className="mt-4 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
          {expiry.text}
        </div>

        {reward.terms && (
          <p className="mt-4 max-w-xs text-xs text-muted-foreground text-pretty">
            {reward.terms}
          </p>
        )}

        <div className="mt-8 flex w-full flex-col gap-3">
          <Link
            href={`/app/rewards/${reward.id}`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-full bg-coral text-coral-foreground hover:bg-coral/90",
            )}
          >
            Ver en mis premios
          </Link>
          <Link
            href="/app"
            className={cn(buttonVariants({ variant: "ghost" }), "w-full")}
          >
            Ir al inicio
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes rise {
          0% { transform: translateY(24px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function Confetti() {
  const pieces = Array.from({ length: 40 })
  const colors = [
    "var(--coral)",
    "var(--level-medio)",
    "var(--level-alto)",
    "var(--level-bajo)",
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100
        const delay = Math.random() * 0.6
        const duration = 2 + Math.random() * 1.5
        const size = 6 + Math.random() * 8
        const color = colors[i % colors.length]
        return (
          <span
            key={i}
            className="absolute top-[-10%] block rounded-[2px]"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.5,
              backgroundColor: color,
              animation: `fall ${duration}s ${delay}s linear forwards`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
        }
      `}</style>
    </div>
  )
}
