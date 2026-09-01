import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Gift, Sparkles, Ban, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { DiscoverButton } from '@/components/claim/discover-button'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

type Teaser =
  | { kind: 'available' }
  | { kind: 'own' } // already claimed by this user
  | { kind: 'error'; title: string; message: string }

export default async function ClaimPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code: rawCode } = await params
  const code = decodeURIComponent(rawCode).trim().toUpperCase()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Look up code status with the service role (does NOT reveal the prize).
  const admin = createAdminClient()
  const { data: codeRow } = await admin
    .from('codes')
    .select('id, status, claimed_by, campaign_id')
    .eq('code', code)
    .maybeSingle()

  let teaser: Teaser
  if (!codeRow) {
    teaser = {
      kind: 'error',
      title: 'Código no válido',
      message: 'Este código no es válido. Revisa tu rasca e inténtalo de nuevo.',
    }
  } else if (codeRow.status === 'BLOCKED') {
    teaser = {
      kind: 'error',
      title: 'Código no disponible',
      message: 'Este código no está disponible. Contacta con Sushi Tok.',
    }
  } else if (codeRow.status === 'INVALID') {
    teaser = {
      kind: 'error',
      title: 'Código no válido',
      message: 'Este código no es válido.',
    }
  } else if (codeRow.status === 'CLAIMED') {
    if (user && codeRow.claimed_by === user.id) {
      // Already this user's — send them to the reward they own.
      const { data: reward } = await supabase
        .from('user_rewards')
        .select('id')
        .eq('code_id', codeRow.id)
        .eq('user_id', user.id)
        .maybeSingle()
      if (reward) redirect(`/app/rewards/${reward.id}`)
      teaser = { kind: 'own' }
    } else {
      teaser = {
        kind: 'error',
        title: 'Rasca ya utilizado',
        message: 'Este rasca ya ha sido utilizado.',
      }
    }
  } else {
    // AVAILABLE — check campaign status too.
    if (codeRow.campaign_id) {
      const { data: campaign } = await admin
        .from('campaigns')
        .select('status')
        .eq('id', codeRow.campaign_id)
        .maybeSingle()
      if (campaign && (campaign.status === 'ENDED' || campaign.status === 'ARCHIVED')) {
        teaser = {
          kind: 'error',
          title: 'Promoción finalizada',
          message: 'Esta promoción ya ha finalizado.',
        }
      } else {
        teaser = { kind: 'available' }
      }
    } else {
      teaser = { kind: 'available' }
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-10 pt-6">
      <header className="flex justify-center">
        <Logo />
      </header>

      {teaser.kind === 'error' ? (
        <ErrorState title={teaser.title} message={teaser.message} />
      ) : (
        <AvailableState code={code} isAuthed={Boolean(user)} />
      )}
    </main>
  )
}

function AvailableState({ code, isAuthed }: { code: string; isAuthed: boolean }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <div className="relative">
          <div className="grid size-32 place-items-center rounded-4xl bg-coral/12 ring-1 ring-coral/20">
            <Gift className="size-16 text-coral" />
          </div>
          <span className="absolute -right-1 -top-1 grid size-9 place-items-center rounded-full bg-coral text-coral-foreground">
            <Sparkles className="size-4" />
          </span>
        </div>

        <h1 className="mt-8 text-balance font-display text-3xl font-extrabold leading-tight">
          Tu rasca tiene premio
        </h1>
        <p className="mt-2 text-pretty text-muted-foreground">
          Descubre qué has ganado. Se guardará automáticamente en tu cuenta.
        </p>

        <div className="mt-4 rounded-full bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
          {code}
        </div>
      </div>

      <div className="pb-safe">
        <DiscoverButton code={code} isAuthed={isAuthed} />
      </div>
    </div>
  )
}

function ErrorState({ title, message }: { title: string; message: string }) {
  const Icon = title.includes('finalizada')
    ? Clock
    : title.includes('disponible')
      ? Ban
      : XCircle
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
      <div className="grid size-24 place-items-center rounded-4xl bg-muted">
        <Icon className="size-12 text-muted-foreground" />
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold">{title}</h1>
      <p className="mt-2 text-pretty text-muted-foreground">{message}</p>
      <Button asChild variant="outline" className="mt-8">
        <Link href="/app">Ir a mi cuenta</Link>
      </Button>
    </div>
  )
}
