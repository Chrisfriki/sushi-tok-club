"use client"

import { useTransition } from "react"
import { LogOut } from "lucide-react"
import { logoutAction } from "@/app/actions/auth"

export function LogoutButton({ label }: { label?: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {label ? <span>{label}</span> : <span className="sr-only">Cerrar sesión</span>}
    </button>
  )
}
