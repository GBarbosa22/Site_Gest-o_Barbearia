"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelAppointmentAction, markNoShowAction } from "@/app/(dashboard)/agenda/actions";

export function CancelAppointmentButton({ id, date }: { id: string; date: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={() => setConfirming(true)}>
          Cancelar agendamento
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => startTransition(() => markNoShowAction(id, date))}
        >
          Não compareceu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-destructive/40 p-4">
      <p className="text-sm">Tem certeza que deseja cancelar este agendamento?</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={() => startTransition(() => cancelAppointmentAction(id, date))}
          className="flex-1"
        >
          {pending ? "Cancelando..." : "Confirmar cancelamento"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirming(false)}>
          Voltar
        </Button>
      </div>
    </div>
  );
}
