import type { ReactNode } from "react"
import { requireRole } from "@/lib/auth"
import { AdminSidebar, AdminMobileBar } from "@/components/admin/admin-nav"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["admin"], "/admin")

  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar email={profile.email} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileBar email={profile.email} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
