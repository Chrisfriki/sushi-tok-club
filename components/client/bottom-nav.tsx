"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, QrCode, Gift, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"

const items = [
  { href: "/app", label: "Inicio", icon: Home, exact: true },
  { href: "/app/scan", label: "Escanear", icon: QrCode, exact: false },
  { href: "/app/rewards", label: "Premios", icon: Gift, exact: false },
  { href: "/app/history", label: "Historial", icon: Clock, exact: false },
  { href: "/app/profile", label: "Perfil", icon: User, exact: false },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon
          const isScan = item.href === "/app/scan"

          if (isScan) {
            return (
              <li key={item.href} className="flex flex-1 justify-center">
                <Link
                  href={item.href}
                  aria-label={item.label}
                  className="-mt-5 flex flex-col items-center gap-1"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {item.label}
                  </span>
                </Link>
              </li>
            )
          }

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "fill-primary/10")} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
