"use client";

import { useFormState } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ProductRow } from "@/types/database.types";
import type { ProductFormState } from "@/app/(dashboard)/produtos/actions";

interface ProductFormProps {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  product?: ProductRow;
}

const CATEGORY_SUGGESTIONS = [
  "Pomadas",
  "Navalhas",
  "Shampoo",
  "Condicionador",
  "Creme",
  "Tintas",
  "Álcool",
  "Toalhas",
  "Outros",
];

export function ProductForm({ action, product }: ProductFormProps) {
  const [state, formAction] = useFormState<ProductFormState, FormData>(action, { error: null });

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do produto</Label>
        <Input id="name" name="name" defaultValue={product?.name} placeholder="Sachê de tinta" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            defaultValue={product?.category ?? ""}
            list="category-suggestions"
          />
          <datalist id="category-suggestions">
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unidade</Label>
          <Input id="unit" name="unit" defaultValue={product?.unit ?? "un"} placeholder="un, ml, g" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity_on_hand">Quantidade atual</Label>
          <Input
            id="quantity_on_hand"
            name="quantity_on_hand"
            type="number"
            step="0.001"
            defaultValue={product?.quantity_on_hand ?? 0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_quantity">Quantidade mínima</Label>
          <Input
            id="min_quantity"
            name="min_quantity"
            type="number"
            step="0.001"
            defaultValue={product?.min_quantity ?? 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cost">Custo (R$)</Label>
          <Input id="cost" name="cost" type="number" step="0.01" defaultValue={product?.cost ?? 0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Preço de venda (R$)</Label>
          <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price ?? 0} />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <Label htmlFor="active" className="cursor-pointer">
          Produto ativo
        </Label>
        <Switch id="active" name="active" defaultChecked={product?.active ?? true} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        {product ? "Salvar alterações" : "Cadastrar produto"}
      </SubmitButton>
    </form>
  );
}
