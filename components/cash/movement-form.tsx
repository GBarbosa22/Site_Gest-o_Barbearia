"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { addMovementAction, type CashFormState } from "@/app/(dashboard)/caixa/actions";

export function MovementForm() {
  const [state, formAction] = useFormState<CashFormState, FormData>(addMovementAction, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select id="category" name="category" defaultValue="despesa" required>
          <option value="despesa">Despesa</option>
          <option value="compra">Compra</option>
          <option value="sangria">Sangria</option>
          <option value="ajuste">Ajuste</option>
          <option value="outro">Outro</option>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" rows={2} placeholder="Ex.: compra de toalhas" />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        Registrar saída
      </SubmitButton>
    </form>
  );
}
