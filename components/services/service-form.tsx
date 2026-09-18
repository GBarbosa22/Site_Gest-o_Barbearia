"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ServiceRow } from "@/types/database.types";
import type { ServiceFormState } from "@/app/(dashboard)/servicos/actions";

interface ServiceFormProps {
  action: (state: ServiceFormState, formData: FormData) => Promise<ServiceFormState>;
  service?: ServiceRow;
}

export function ServiceForm({ action, service }: ServiceFormProps) {
  const [state, formAction] = useFormState<ServiceFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do serviço</Label>
        <Input id="name" name="name" defaultValue={service?.name} placeholder="Corte + Barba" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration_minutes">Duração (min)</Label>
          <Input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={5}
            step={5}
            defaultValue={service?.duration_minutes ?? 30}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            defaultValue={service?.price ?? 0}
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <Label htmlFor="active" className="cursor-pointer">
          Serviço ativo
        </Label>
        <Switch id="active" name="active" defaultChecked={service?.active ?? true} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        {service ? "Salvar alterações" : "Cadastrar serviço"}
      </SubmitButton>
    </form>
  );
}
