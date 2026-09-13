import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <Image
            src="/logo.jpeg"
            alt="Barbearia Gentlemen"
            width={160}
            height={107}
            className="mx-auto mb-2 rounded-md"
            priority
          />
          <h1 className="text-2xl font-semibold">Entrar no sistema</h1>
          <p className="text-sm text-muted-foreground">
            Acesse com seu e-mail e senha cadastrados.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
