"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { setCodeStatusAction } from "@/app/actions/admin"
import { toast } from "sonner"
import { Lock, Unlock } from "lucide-react"

export function CodeActions({
  codeId,
  status,
}: {
  codeId: string
  status: string
}) {
  const [pending, startTransition] = useTransition()

  if (status === "CLAIMED") {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  function toggle() {
    const next = status === "BLOCKED" ? "AVAILABLE" : "BLOCKED"
    startTransition(async () => {
      const res = await setCodeStatusAction(codeId, next)
      if (res.ok) {
        toast.success(next === "BLOCKED" ? "Código bloqueado" : "Código desbloqueado")
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={toggle} disabled={pending}>
      {status === "BLOCKED" ? (
        <>
          <Unlock className="size-3.5" /> Desbloquear
        </>
      ) : (
        <>
          <Lock className="size-3.5" /> Bloquear
        </>
      )}
    </Button>
  )
}
