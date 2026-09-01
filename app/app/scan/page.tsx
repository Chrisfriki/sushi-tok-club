import { CodeScanner } from "@/components/client/code-scanner"

export default function ScanPage() {
  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      <header>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Escanear rasca
        </h1>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          Escanea el QR de tu rasca o introduce el código a mano para descubrir tu premio.
        </p>
      </header>
      <CodeScanner />
    </div>
  )
}
