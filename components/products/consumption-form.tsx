"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ProductRow } from "@/types/database.types";
import { recordConsumptionAction, type ConsumptionFormState } from "@/app/(dashboard)/consumo-interno/actions";

export function ConsumptionForm({ products }: { products: ProductRow[] }) {
  const [state, formAction] = useFormState<ConsumptionFormState, FormData>(recordConsumptionAction, {
    error: null,
  });
  const [selectedId, setSelectedId] = useState("");
  const selected = products.find((p) => p.id === selectedId);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="product_id">Produto</Label>
        <Select
          id="product_id"
          name="product_id"
          defaultValue=""
          required
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="" disabled>
            Selecione o produto
          </option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.quantity_on_hand} {p.unit} em estoque)
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantidade usada</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min={0}
          max={selected ? Number(selected.quantity_on_hand) : undefined}
          step="0.001"
          required
        />
        {selected ? (
          <p className="text-xs text-muted-foreground">
            Máximo disponível: {selected.quantity_on_hand} {selected.unit}
          </p>
        ) : null}
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        Registrar consumo
      </SubmitButton>
    </form>
  );
}
