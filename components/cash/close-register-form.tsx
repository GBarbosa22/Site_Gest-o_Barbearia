"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import type { CashFormState } from "@/app/(dashboard)/caixa/actions";

interface CloseRegisterFormProps {
  action: (state: CashFormState, formData: FormData) => Promise<CashFormState>;
  expectedBalance: number;
}

export function CloseRegisterForm({ action, expectedBalance }: CloseRegisterFormProps) {
  const [state, formAction] = useFormState<CashFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="informed_balance">Valor contado na gaveta (R$)</Label>
        <Input
          id="informed_balance"
          name="informed_balance"
          type="number"
          min={0}
          step="0.01"
          defaultValue={expectedBalance.toFixed(2)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={2} placeholder="Ex.: motivo da diferença" />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        Confirmar fechamento
      </SubmitButton>
    </form>
  );
}
