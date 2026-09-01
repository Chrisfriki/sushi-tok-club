import { PageHeader } from "@/components/admin/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TERMS_VERSION } from "@/lib/constants"

export const dynamic = "force-dynamic"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configuración"
        description="Ajustes generales de Sushi Tok Club."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Términos y consentimiento</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Versión de términos actual</span>
            <Badge variant="outline">{TERMS_VERSION}</Badge>
          </div>
          <p className="text-muted-foreground text-pretty">
            Los consentimientos se guardan con la versión aceptada y su fecha. Al publicar
            una nueva versión de las bases legales, actualiza este valor para volver a
            solicitar el consentimiento en el próximo inicio de sesión.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Arquitectura futura</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="mb-3 text-pretty">
            El modelo de datos está preparado para crecer hacia un CRM de fidelización
            completo. Estas funciones no están activas todavía:
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Sushi Points",
              "Retos",
              "Rachas",
              "Cumpleaños",
              "Referidos",
              "Cupones",
              "Niveles VIP",
              "Notificaciones push",
              "WhatsApp",
              "Email marketing",
            ].map((f) => (
              <Badge key={f} variant="secondary" className="font-normal">
                {f}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
