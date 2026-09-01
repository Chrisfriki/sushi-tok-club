import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/brand/logo'
import { LoginForm } from '@/components/auth/login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

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

      <div className="mt-10">
        <h1 className="font-display text-2xl font-bold">Hola de nuevo</h1>
        <p className="mt-1 text-muted-foreground">
          Inicia sesión para ver tus premios.
        </p>
      </div>

      <div className="mt-8">
        <LoginForm next={next} />
      </div>
    </main>
  )
}
