import type { ReactNode } from "react"
import Link from "next/link"
import { requireRole } from "@/lib/auth"
import { Logo } from "@/components/brand/logo"
import { LogoutButton } from "@/components/shared/logout-button"

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["staff", "manager", "admin"], "/staff")

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link href="/staff" className="flex items-center gap-2">
          <Logo className="h-6 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Staff
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/staff" className="text-muted-foreground hover:text-foreground">
              Validar
            </Link>
            <Link
              href="/staff/redemptions"
              className="text-muted-foreground hover:text-foreground"
            >
              Canjes
            </Link>
          </nav>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 px-4 py-5">{children}</main>
      <footer className="border-t border-border px-4 py-2 text-center text-[11px] text-muted-foreground">
        {profile.first_name ?? "Empleado"} · {profile.role}
      </footer>
    </div>
  )
}
