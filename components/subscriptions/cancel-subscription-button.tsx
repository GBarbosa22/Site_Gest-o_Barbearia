"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelSubscriptionAction } from "@/app/(dashboard)/planos/actions";

/** Para plano criado por engano (cliente errado, etc). Nunca apaga — só cancela. */
export function CancelSubscriptionButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setConfirming(true)}
      >
        <X className="h-3.5 w-3.5" />
        Cancelar plano
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-destructive/40 p-3">
      <p className="text-xs">Cancelar este plano? (ex.: criado pro cliente errado)</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={pending}
          onClick={() => startTransition(() => cancelSubscriptionAction(id))}
          className="flex-1"
        >
          {pending ? "Cancelando..." : "Confirmar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setConfirming(false)}
        >
          Voltar
        </Button>
      </div>
    </div>
  );
}
