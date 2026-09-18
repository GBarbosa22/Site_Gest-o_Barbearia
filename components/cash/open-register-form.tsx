"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/forms/submit-button";
import { openRegisterAction, type CashFormState } from "@/app/(dashboard)/caixa/actions";

export function OpenRegisterForm() {
  const [state, formAction] = useFormState<CashFormState, FormData>(openRegisterAction, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="opening_balance">Saldo inicial (R$)</Label>
        <Input
          id="opening_balance"
          name="opening_balance"
          type="number"
          min={0}
          step="0.01"
          defaultValue={0}
          required
        />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        Abrir caixa
      </SubmitButton>
    </form>
  );
}
