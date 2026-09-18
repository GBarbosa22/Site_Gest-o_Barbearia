"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/submit-button";
import type { BarberRow, ClientRow } from "@/types/database.types";
import type { SubscriptionFormState } from "@/app/(dashboard)/planos/actions";

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
        <Input id="price" name="price" type="number" min={0} step="0.01" defaultValue={100} required />
        <p className="text-xs text-muted-foreground">
          4 cortes, 1 por semana. Sempre editável na venda.
        </p>
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
