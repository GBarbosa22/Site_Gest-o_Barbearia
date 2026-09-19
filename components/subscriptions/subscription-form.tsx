"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/submit-button";
import { cn } from "@/lib/utils";
import type { BarberRow, ClientRow, PaymentMethod } from "@/types/database.types";
import type { SubscriptionFormState } from "@/app/(dashboard)/planos/actions";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
];

interface SubscriptionFormProps {
  action: (state: SubscriptionFormState, formData: FormData) => Promise<SubscriptionFormState>;
  clients: ClientRow[];
  barbers: BarberRow[];
  defaultClientId?: string;
}

export function SubscriptionForm({ action, clients, barbers, defaultClientId }: SubscriptionFormProps) {
  const [state, formAction] = useFormState<SubscriptionFormState, FormData>(action, {
    error: null,
  });
  const [method, setMethod] = useState<PaymentMethod>("debito");

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="client_id">Cliente</Label>
        <Select id="client_id" name="client_id" defaultValue={defaultClientId ?? ""} required>
          <option value="" disabled>
            Selecione o cliente
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="barber_id">Vendido por</Label>
        <Select id="barber_id" name="barber_id" defaultValue="">
          <option value="">Não informar</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.id}>
              {barber.full_name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Valor do plano (R$)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          defaultValue={100}
          onFocus={(e) => e.target.select()}
          required
        />
        <p className="text-xs text-muted-foreground">
          4 cortes, 1 por semana. Sempre editável na venda.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Pagamento</Label>
        <div className="grid grid-cols-4 gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-md border border-input px-2 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-gold"
              )}
            >
              <input
                type="radio"
                name="payment_method"
                value={option.value}
                checked={method === option.value}
                onChange={() => setMethod(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        Vender plano
      </SubmitButton>
    </form>
  );
}
