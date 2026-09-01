import type { ReactNode } from "react"
import { requireUser } from "@/lib/auth"
import { BottomNav } from "@/components/client/bottom-nav"

export default async function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  // Any authenticated user can use the client app; staff/admin also have their own areas.
  await requireUser("/app")

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  )
}
