import { Logo } from "@/components/brand/logo"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export default function UpdatePasswordPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-10 pt-6">
      <div className="flex items-center justify-end">
        <Logo showText={false} />
      </div>

      <div className="mt-10">
        <h1 className="font-display text-2xl font-bold">Nueva contraseña</h1>
        <p className="mt-1 text-muted-foreground">
          Elige una contraseña nueva para tu cuenta.
        </p>
      </div>

      <div className="mt-8">
        <UpdatePasswordForm />
      </div>
    </main>
  )
}
