import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, QrCode, Gift, Ticket, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { getSessionProfile } from '@/lib/auth'
import { defaultPathForRole } from '@/lib/auth'

export default async function LandingPage() {
  const profile = await getSessionProfile()
  const primaryHref = profile ? defaultPathForRole(profile.role) : '/register'
  const primaryLabel = profile ? 'Ir a mi cuenta' : 'Crear cuenta'

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-10 pt-6">
      <header className="flex items-center justify-between">
        <Logo />
        {!profile && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
        )}
      </header>

      {/* Hero */}
      <section className="mt-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-coral/12 px-3 py-1 text-xs font-medium text-coral">
          <Sparkles className="size-3.5" />
          Rasca &amp; Gana 2026
        </div>
        <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[1.05]">
          5.000 rascas.
          <br />
          <span className="text-coral">5.000 premios.</span>
        </h1>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
          Escanea el rasca de tu visita a Sushi Tok, descubre tu premio al
          instante y guárdalo en tu cuenta para canjearlo cuando quieras.
        </p>

        <div className="relative mt-6 aspect-4/3 overflow-hidden rounded-3xl ring-1 ring-border">
          <Image
            src="/sushi-hero.png"
            alt="Selección de sushi premium de Sushi Tok"
            fill
            priority
            sizes="(max-width: 448px) 100vw, 448px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Gift className="size-4" />
              Todos los rascas tienen premio
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mt-8 grid gap-3">
        <Step
          icon={<QrCode className="size-5" />}
          title="Escanea tu rasca"
          desc="Con la cámara o introduciendo el código."
        />
        <Step
          icon={<Sparkles className="size-5" />}
          title="Descubre tu premio"
          desc="Se revela y se guarda solo en tu cuenta."
        />
        <Step
          icon={<Ticket className="size-5" />}
          title="Canjéalo en el local"
          desc="Enseña tu QR al personal de Sushi Tok."
        />
      </section>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-3">
        <Button asChild size="lg" className="h-13 bg-coral text-coral-foreground hover:bg-coral/90">
          <Link href={primaryHref}>
            {primaryLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        {!profile && (
          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Inicia sesión
            </Link>
          </p>
        )}
      </div>

      <footer className="mt-auto pt-10 text-center text-xs text-muted-foreground">
        Sushi Tok Club · Programa de fidelización
      </footer>
    </main>
  )
}

function Step({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
        {icon}
      </span>
      <div>
        <p className="font-semibold leading-tight">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
