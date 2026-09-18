"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSale, markSalePaid } from "@/services/sales.service";
import { saleSchema, saleItemSchema } from "@/lib/validations/sale";
import { z } from "zod";
import type { PaymentMethod } from "@/types/database.types";
import { toISODateString } from "@/lib/utils";

export interface SaleFormState {
  error: string | null;
}

const itemsPayloadSchema = z.array(saleItemSchema);

export async function createSaleAction(
  _prevState: SaleFormState,
  formData: FormData
): Promise<SaleFormState> {
  const parsed = saleSchema.safeParse({
    client_id: formData.get("client_id") ?? "",
    barber_id: formData.get("barber_id") ?? "",
    discount: formData.get("discount") || 0,
    method: formData.get("method") ?? "",
    due_date: formData.get("due_date") ?? "",
    notes: formData.get("notes") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let items: unknown;
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Dados inválidos." };
  }

  const parsedItems = itemsPayloadSchema.safeParse(items);
  if (!parsedItems.success || parsedItems.data.length === 0) {
    return { error: "Adicione ao menos um produto." };
  }

  const { error } = await createSale({
    clientId: parsed.data.client_id || null,
    barberId: parsed.data.barber_id,
    items: parsedItems.data,
    discount: parsed.data.discount,
    method: parsed.data.method === "" ? null : parsed.data.method,
    dueDate: parsed.data.due_date || null,
    notes: parsed.data.notes,
  });
  if (error) return { error };

  revalidatePath("/vendas");
  redirect(`/vendas?date=${toISODateString(new Date())}`);
}

export async function markSalePaidAction(id: string, method: PaymentMethod, date: string) {
  await markSalePaid(id, method);
  revalidatePath("/vendas");
  redirect(`/vendas?date=${date}`);
}
