"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ProductRow } from "@/types/database.types";
import type { ServiceProductItem } from "@/services/products.service";
import type { RecipeFormState } from "@/app/(dashboard)/produtos/actions";

interface RecipeRow {
  key: string;
  product_id: string;
  quantity: string;
}

interface ServiceRecipeEditorProps {
  action: (state: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  products: ProductRow[];
  initialItems: ServiceProductItem[];
}

export function ServiceRecipeEditor({ action, products, initialItems }: ServiceRecipeEditorProps) {
  const [state, formAction] = useFormState<RecipeFormState, FormData>(action, { error: null });
  const [rows, setRows] = useState<RecipeRow[]>(
    initialItems.map((item) => ({
      key: item.id,
      product_id: item.product_id,
      quantity: String(item.quantity),
    }))
  );

  function addRow() {
    setRows((prev) => [...prev, { key: crypto.randomUUID(), product_id: "", quantity: "1" }]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function updateRow(key: string, patch: Partial<RecipeRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function handleSubmit(formData: FormData) {
    const items = rows
      .filter((r) => r.product_id && Number(r.quantity) > 0)
      .map((r) => ({ product_id: r.product_id, quantity: Number(r.quantity) }));
    formData.set("items", JSON.stringify(items));
    return formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum produto vinculado a este serviço.</p>
      ) : (
        rows.map((row) => (
          <div key={row.key} className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Select
                value={row.product_id}
                onChange={(e) => updateRow(row.key, { product_id: e.target.value })}
              >
                <option value="" disabled>
                  Selecione o produto
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-24 space-y-1">
              <Input
                type="number"
                min={0}
                step="0.001"
                value={row.quantity}
                onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                placeholder="Qtd."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeRow(row.key)}
              aria-label="Remover"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}

      <Button type="button" variant="outline" className="w-full" onClick={addRow}>
        <Plus className="h-4 w-4" />
        Adicionar produto
      </Button>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        Salvar produtos do serviço
      </SubmitButton>
    </form>
  );
}
