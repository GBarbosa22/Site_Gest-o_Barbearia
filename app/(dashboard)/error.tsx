"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Pega qualquer erro lançado por um Server Component dentro do dashboard —
 * o caso mais comum é requireAdmin() barrando um barbeiro numa tela
 * exclusiva do admin. Sem isso, o Next mostrava a tela de crash genérica.
 */
export default function DashboardError({ error }: { error: Error & { digest?: string } }) {
  const isAccessError = error.message.toLowerCase().includes("acesso restrito");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldAlert className="h-10 w-10 text-muted-foreground" />
      <div className="space-y-1">
        <p className="font-medium">{isAccessError ? "Acesso restrito" : "Algo deu errado"}</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          {isAccessError
            ? "Esta área é exclusiva do administrador."
            : "Não foi possível carregar esta página. Tente novamente."}
        </p>
      </div>
      <Button asChild variant="gold">
        <Link href="/dashboard">Voltar ao início</Link>
      </Button>
    </div>
  );
}
