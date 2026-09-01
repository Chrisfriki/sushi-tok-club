'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Gift, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { claimCodeAction } from '@/app/actions/rewards'
import { claimErrorMessage } from '@/lib/constants'

export function DiscoverButton({
  code,
  isAuthed,
}: {
  code: string
  isAuthed: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDiscover() {
    setError(null)
    if (!isAuthed) {
      router.push(`/register?next=${encodeURIComponent(`/r/${code}`)}`)
      return
    }
    startTransition(async () => {
      const res = await claimCodeAction(code)
      if (res.ok) {
        router.replace(`/reveal/${res.userRewardId}`)
      } else {
        setError(claimErrorMessage(res.error))
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        onClick={onDiscover}
        disabled={pending}
        className="h-14 w-full bg-coral text-base font-semibold text-coral-foreground hover:bg-coral/90"
      >
        {pending ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <Gift className="size-5" />
        )}
        Descubrir mi premio
      </Button>
      {error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
          {error}
        </p>
      )}
      {!isAuthed && (
        <p className="text-center text-xs text-muted-foreground">
          Necesitas una cuenta para guardar tu premio. Solo te llevará un
          momento.
        </p>
      )}
    </div>
  )
}
