import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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
        Política de Privacidad
      </h1>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">
        <p>
          En Sushi Tok tratamos tus datos personales con el único fin de
          gestionar tu participación en el programa de fidelización Sushi Tok
          Club, entregarte tus premios y, si lo autorizas, enviarte
          comunicaciones comerciales.
        </p>
        <p>
          <strong className="text-foreground">Datos que recogemos:</strong>{' '}
          nombre, apellidos, email, teléfono y, opcionalmente, fecha de
          nacimiento, restaurante habitual e Instagram.
        </p>
        <p>
          <strong className="text-foreground">Base legal:</strong> la ejecución
          del programa y tu consentimiento para las comunicaciones comerciales,
          que puedes retirar en cualquier momento desde tu perfil.
        </p>
        <p>
          <strong className="text-foreground">Tus derechos:</strong> puedes
          solicitar acceso, rectificación, supresión y portabilidad de tus
          datos, así como la eliminación de tu cuenta, desde la sección de
          Privacidad de tu perfil.
        </p>
        <p className="text-xs">
          Este texto es un marcador de posición para el MVP y debe sustituirse
          por el documento legal definitivo antes de producción.
        </p>
      </div>
    </main>
  )
}
