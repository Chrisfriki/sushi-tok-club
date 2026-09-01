import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/brand/logo'

export default function AuthErrorPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center gap-6 px-5 text-center">
      <Logo />
      <div>
        <h1 className="font-display text-2xl font-bold">Algo ha fallado</h1>
        <p className="mt-2 text-muted-foreground">
          No hemos podido completar la autenticación. Inténtalo de nuevo.
        </p>
      </div>
      <Link
        href="/login"
        className={cn(
          buttonVariants(),
          'bg-coral text-coral-foreground hover:bg-coral/90',
        )}
      >
        Volver a iniciar sesión
      </Link>
    </main>
  )
}
