"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Gift,
  QrCode,
  CheckCircle2,
  Store,
  UserCog,
  Settings,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
import { LogoutButton } from "@/components/shared/logout-button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/campaigns", label: "Campañas", icon: Megaphone },
  { href: "/admin/rewards", label: "Premios", icon: Gift },
  { href: "/admin/codes", label: "Códigos", icon: QrCode },
  { href: "/admin/redemptions", label: "Canjes", icon: CheckCircle2 },
  { href: "/admin/restaurants", label: "Restaurantes", icon: Store },
  { href: "/admin/staff", label: "Empleados", icon: UserCog },
  { href: "/admin/settings", label: "Configuración", icon: Settings },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function AdminSidebar({ email }: { email: string | null }) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card px-4 py-5 lg:flex">
      <div className="flex items-center gap-2 px-2">
        <Logo className="h-6 w-auto" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Admin
        </span>
      </div>
      <div className="mt-6 flex-1">
        <NavLinks />
      </div>
      <div className="flex items-center justify-between border-t border-border px-2 pt-4">
        <span className="truncate text-xs text-muted-foreground">{email}</span>
        <LogoutButton />
      </div>
    </aside>
  )
}

export function AdminMobileBar({ email }: { email: string | null }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
      <div className="flex items-center gap-2">
        <Logo className="h-6 w-auto" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Admin
        </span>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-lg border border-border"
              aria-label="Abrir menú"
            >
              <Menu className="size-5" />
            </button>
          }
        />
        <SheetContent side="right" className="w-64 px-4 py-5">
          <SheetTitle className="sr-only">Navegación admin</SheetTitle>
          <div className="mt-6">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="truncate text-xs text-muted-foreground">{email}</span>
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
