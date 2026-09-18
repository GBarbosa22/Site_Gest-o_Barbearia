import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/services/auth.service";
import { recordAutoCashEntry } from "@/services/cash-register.service";
import type { PaymentMethod, SaleRow } from "@/types/database.types";

export interface SaleItemInput {
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface SaleListItem extends SaleRow {
  client_name: string | null;
  barber_name: string;
  items: { product_name: string; quantity: number; unit_price: number; subtotal: number }[];
}

function dayRange(dateISO: string) {
  const start = new Date(`${dateISO}T00:00:00`);
  const end = new Date(`${dateISO}T00:00:00`);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

const SELECT_WITH_JOINS =
  "*, clients(full_name), barbers(full_name), sale_items(quantity, unit_price, subtotal, products(name))";

function mapRow(row: any): SaleListItem {
  return {
    ...row,
    client_name: row.clients?.full_name ?? null,
    barber_name: row.barbers?.full_name ?? "Barbeiro",
    items: (row.sale_items ?? []).map((item: any) => ({
      product_name: item.products?.name ?? "Produto",
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      subtotal: Number(item.subtotal),
    })),
  };
}

export async function listSalesByDay(dateISO: string, barberId?: string): Promise<SaleListItem[]> {
  const supabase = await createClient();
  const { start, end } = dayRange(dateISO);

  let query = supabase
    .from("sales")
    .select(SELECT_WITH_JOINS)
    .gte("created_at", start)
    .lt("created_at", end)
    .order("created_at", { ascending: false });

  if (barberId) query = query.eq("barber_id", barberId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function getSale(id: string): Promise<SaleListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("sales").select(SELECT_WITH_JOINS).eq("id", id).single();
  if (error || !data) return null;
  return mapRow(data);
}

export interface CreateSaleInput {
  clientId?: string | null;
  barberId: string;
  appointmentId?: string | null;
  items: SaleItemInput[];
  discount: number;
  method: PaymentMethod | null;
  dueDate?: string | null;
  notes?: string | null;
}

export async function createSale(input: CreateSaleInput): Promise<{ error: string | null }> {
  if (input.items.length === 0) {
    return { error: "Adicione ao menos um produto." };
  }

  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const total = input.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const { data: sale, error } = await supabase
    .from("sales")
    .insert({
      client_id: input.clientId || null,
      barber_id: input.barberId,
      appointment_id: input.appointmentId || null,
      amount: total,
      discount: input.discount,
      method: input.method,
      paid: input.method !== null,
      due_date: input.method === null ? input.dueDate || null : null,
      notes: input.notes || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !sale) {
    return { error: error?.message ?? "Não foi possível registrar a venda." };
  }

  const { error: itemsError } = await supabase.from("sale_items").insert(
    input.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
    }))
  );

  if (itemsError) return { error: itemsError.message };

  for (const item of input.items) {
    await supabase.rpc("sell_product_stock", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
      p_sale_id: sale.id,
    });
  }

  if (input.method === "dinheiro") {
    await recordAutoCashEntry({
      category: "venda",
      amount: total - input.discount,
      saleId: sale.id,
    });
  }

  return { error: null };
}

export async function markSalePaid(
  id: string,
  method: PaymentMethod
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .update({ method, paid: true, due_date: null })
    .eq("id", id)
    .select("id, amount, discount")
    .single();

  if (error) return { error: error.message };

  if (method === "dinheiro") {
    await recordAutoCashEntry({
      category: "venda",
      amount: Number(data.amount) - Number(data.discount),
      saleId: data.id,
    });
  }

  return { error: null };
}

export async function getSalesRevenueBetween(startISO: string, endISO: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sales")
    .select("amount, discount")
    .eq("paid", true)
    .gte("created_at", startISO)
    .lt("created_at", endISO);

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + Number(row.amount) - Number(row.discount), 0);
}
