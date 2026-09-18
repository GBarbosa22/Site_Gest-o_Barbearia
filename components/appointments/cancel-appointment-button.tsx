"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cancelAttendanceAction } from "@/app/(dashboard)/atendimentos/actions";

/** Para quando o atendimento foi lançado por engano — nunca apaga, só marca como cancelado. */
export function CancelAttendanceButton({ id, date }: { id: string; date: string }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="outline" className="w-full" onClick={() => setConfirming(true)}>
        Cancelar (registrado por engano)
      </Button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-destructive/40 p-4">
      <p className="text-sm">Tem certeza que deseja cancelar este atendimento?</p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="destructive"
          disabled={pending}
          onClick={() => startTransition(() => cancelAttendanceAction(id, date))}
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
