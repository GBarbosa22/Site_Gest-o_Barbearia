"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

interface DeactivateButtonProps {
  id: string;
  action: (id: string) => Promise<void>;
  label: string;
}

/** Botão de desativação genérico com confirmação — nunca exclui, só marca `active = false`. */
export function DeactivateButton({ id, action, label }: DeactivateButtonProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full text-destructive"
        onClick={() => setConfirming(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-destructive/40 p-4">
      <p className="text-sm">Tem certeza? Isso pode ser revertido depois editando o cadastro.</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={() => startTransition(() => action(id))}
          className="flex-1"
        >
          {pending ? "Desativando..." : "Confirmar"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
