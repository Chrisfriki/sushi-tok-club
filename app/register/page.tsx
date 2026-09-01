import Link from 'next/link'
import { ArrowLeft, Gift } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { RegisterForm } from '@/components/auth/register-form'
import { createClient } from '@/lib/supabase/server'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  const supabase = await createClient()
  const { data: restaurants } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('active', true)
    .order('name')

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>
        <Logo showText={false} />
      </div>

      <div className="mt-8">
        {next?.startsWith('/r/') && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl bg-coral/12 px-4 py-3 text-sm font-medium text-coral">
            <Gift className="size-4" />
            Crea tu cuenta para descubrir tu premio.
          </div>
        )}
        <h1 className="font-display text-2xl font-bold">Únete al Club</h1>
        <p className="mt-1 text-muted-foreground">
          Guarda tus premios y no te pierdas ninguna promoción.
        </p>
      </div>

      <div className="mt-6">
        <RegisterForm next={next} restaurants={restaurants ?? []} />
      </div>
    </main>
  )
}
