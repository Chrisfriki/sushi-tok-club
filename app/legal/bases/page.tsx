import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BasesPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 pb-16 pt-6">
      <Link
        href="/register"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver
      </Link>
      <h1 className="mt-6 font-display text-2xl font-bold">
        Bases Legales de la promoción
      </h1>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          La promoción &quot;Rasca &amp; Gana Sushi Tok 2026&quot; consta de
          5.000 rascas físicos, cada uno con un código único asociado a un
          premio.
        </p>
        <p>
          Cada código puede reclamarse una sola vez. El premio queda vinculado a
          la cuenta del cliente que lo reclama y podrá canjearse en los
          restaurantes participantes hasta su fecha de caducidad.
        </p>
        <p>
          Los premios no son canjeables por dinero y están sujetos a las
          condiciones específicas indicadas en cada uno de ellos.
        </p>
        <p className="text-xs">
          Este texto es un marcador de posición para el MVP y debe sustituirse
          por las bases legales definitivas antes de producción.
        </p>
      </div>
    </main>
  )
}
