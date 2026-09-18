"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/forms/submit-button";
import type { BarberRow } from "@/types/database.types";
import type { BarberFormState } from "@/app/(dashboard)/barbeiros/actions";

interface BarberFormProps {
  action: (state: BarberFormState, formData: FormData) => Promise<BarberFormState>;
  barber?: BarberRow;
}

export function BarberForm({ action, barber }: BarberFormProps) {
  const [state, formAction] = useFormState<BarberFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nome completo</Label>
        <Input id="full_name" name="full_name" defaultValue={barber?.full_name} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" name="phone" defaultValue={barber?.phone ?? ""} placeholder="(11) 90000-0000" />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <Label htmlFor="active" className="cursor-pointer">
          Barbeiro ativo
        </Label>
        <Switch id="active" name="active" defaultChecked={barber?.active ?? true} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        {barber ? "Salvar alterações" : "Cadastrar barbeiro"}
      </SubmitButton>
    </form>
  );
}
