"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markSalePaidAction } from "@/app/(dashboard)/vendas/actions";
import type { PaymentMethod } from "@/types/database.types";
import { cn } from "@/lib/utils";

const OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
];

export function MarkSalePaidForm({ id, date }: { id: string; date: string }) {
  const [pending, startTransition] = useTransition();
  const [method, setMethod] = useState<PaymentMethod | null>(null);

  return (
    <div className="space-y-3 rounded-lg border border-gold/40 bg-gold/5 p-4">
      <p className="text-sm font-medium">Cliente ainda vai pagar. Recebeu agora?</p>
      <div className="grid grid-cols-4 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMethod(option.value)}
            className={cn(
              "rounded-md border border-input px-2 py-2 text-xs font-medium",
              method === option.value && "border-gold bg-gold/10 text-gold"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Button
        type="button"
        variant="gold"
        className="w-full"
        disabled={!method || pending}
        onClick={() => method && startTransition(() => markSalePaidAction(id, method, date))}
      >
        {pending ? "Salvando..." : "Confirmar recebimento"}
      </Button>
    </div>
  );
}
