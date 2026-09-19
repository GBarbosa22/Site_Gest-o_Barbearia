"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { cn, formatCurrency, toISODateString } from "@/lib/utils";
import type { BarberRow, ClientRow, ProductRow, PaymentMethod } from "@/types/database.types";
import type { SaleFormState } from "@/app/(dashboard)/vendas/actions";

const PAYMENT_OPTIONS: { value: PaymentMethod | ""; label: string }[] = [
  { value: "debito", label: "Débito" },
  { value: "credito", label: "Crédito" },
  { value: "pix", label: "PIX" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "", label: "Vai pagar depois" },
];

interface ItemRow {
  key: string;
  product_id: string;
  quantity: string;
  unit_price: string;
}

interface SaleFormProps {
  action: (state: SaleFormState, formData: FormData) => Promise<SaleFormState>;
  clients: ClientRow[];
  products: ProductRow[];
  barbers: BarberRow[];
  lockedBarber?: BarberRow | null;
}

export function SaleForm({ action, clients, products, barbers, lockedBarber }: SaleFormProps) {
  const [state, formAction] = useFormState<SaleFormState, FormData>(action, { error: null });
  const [items, setItems] = useState<ItemRow[]>([]);
  const [discount, setDiscount] = useState("0");
  const [method, setMethod] = useState<PaymentMethod | "">("debito");

  function addItem() {
    setItems((prev) => [...prev, { key: crypto.randomUUID(), product_id: "", quantity: "1", unit_price: "0" }]);
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function updateItem(key: string, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function handleProductChange(key: string, productId: string) {
    const product = products.find((p) => p.id === productId);
    updateItem(key, { product_id: productId, unit_price: product ? String(product.price) : "0" });
  }

  const total = items.reduce((sum, i) => sum + Number(i.quantity || 0) * Number(i.unit_price || 0), 0);
  const clampedDiscount = Math.min(Math.max(0, Number(discount || 0)), total);
  const totalWithDiscount = Math.max(0, total - clampedDiscount);

  function handleSubmit(formData: FormData) {
    const payload = items
      .filter((i) => i.product_id && Number(i.quantity) > 0)
      .map((i) => ({
        product_id: i.product_id,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
      }));
    formData.set("items", JSON.stringify(payload));
    // O desconto nunca é enviado maior que o total — a exibição já avisa o
    // usuário, mas é este valor (não o digitado cru) que vai pro servidor.
    formData.set("discount", String(clampedDiscount));
    return formAction(formData);
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="client_id">Cliente (opcional)</Label>
          <Link href="/clientes/novo" className="text-xs text-gold">
            Cadastrar novo
          </Link>
        </div>
        <Select id="client_id" name="client_id" defaultValue="">
          <option value="">Não informar</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name}
            </option>
          ))}
        </Select>
      </div>

      {lockedBarber ? (
        <input type="hidden" name="barber_id" value={lockedBarber.id} />
      ) : (
        <div className="space-y-2">
          <Label htmlFor="barber_id">Vendido por</Label>
          <Select id="barber_id" name="barber_id" defaultValue="" required>
            <option value="" disabled>
              Selecione o barbeiro
            </option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.full_name}
              </option>
            ))}
          </Select>
        </div>
      )}

      <div className="space-y-3">
        <Label>Produtos</Label>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto adicionado.</p>
        ) : (
          items.map((item) => (
            <div key={item.key} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Select
                  value={item.product_id}
                  onChange={(e) => handleProductChange(item.key, e.target.value)}
                >
                  <option value="" disabled>
                    Selecione o produto
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {formatCurrency(p.price)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-16 space-y-1">
                <Input
                  type="number"
                  min={1}
                  step="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.key, { quantity: e.target.value })}
                  placeholder="Qtd."
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeItem(item.key)}
                aria-label="Remover"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        <Button type="button" variant="outline" className="w-full" onClick={addItem}>
          <Plus className="h-4 w-4" />
          Adicionar produto
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="discount">Desconto (R$)</Label>
        <Input
          id="discount"
          name="discount"
          type="number"
          min={0}
          step="0.01"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        {Number(discount || 0) > total ? (
          <p className="text-xs text-muted-foreground">
            Desconto não pode passar do total ({formatCurrency(total)}) — será ajustado ao enviar.
          </p>
        ) : null}
      </div>

      <div className="rounded-lg border border-border p-3 text-right text-sm">
        Total: <span className="font-semibold text-gold">{formatCurrency(totalWithDiscount)}</span>
      </div>

      <div className="space-y-2">
        <Label>Pagamento</Label>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_OPTIONS.map((option) => (
            <label
              key={option.value || "pendente"}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-md border border-input px-2 py-2.5 text-sm font-medium transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold/10 has-[:checked]:text-gold",
                option.value === "" && "col-span-3"
              )}
            >
              <input
                type="radio"
                name="method"
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

      {method === "" ? (
        <div className="space-y-2">
          <Label htmlFor="due_date">Data prevista para o pagamento</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            min={toISODateString(new Date())}
            defaultValue={toISODateString(new Date())}
            required
          />
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <SubmitButton variant="gold" className="w-full">
        Registrar venda
      </SubmitButton>
    </form>
  );
}
