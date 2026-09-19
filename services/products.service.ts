import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/services/audit.service";
import type { ProductRow } from "@/types/database.types";
import type { ProductInput } from "@/lib/validations/product";

export async function listProducts(opts?: { onlyActive?: boolean }): Promise<ProductRow[]> {
  const supabase = await createClient();
  let query = supabase.from("products").select("*").order("name", { ascending: true });

  if (opts?.onlyActive) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function listLowStockProducts(): Promise<ProductRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) return [];
  return (data ?? []).filter((p) => Number(p.quantity_on_hand) <= Number(p.min_quantity));
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function createProduct(input: ProductInput): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name,
      category: input.category || null,
      unit: input.unit,
      cost: input.cost,
      price: input.price,
      quantity_on_hand: input.quantity_on_hand,
      min_quantity: input.min_quantity,
      active: input.active,
    })
    .select("id")
    .single();

  if (data?.id) {
    await logAudit("produto_criado", "product", data.id, { nome: input.name });
  }

  return { error: error?.message ?? null };
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name,
      category: input.category || null,
      unit: input.unit,
      cost: input.cost,
      price: input.price,
      quantity_on_hand: input.quantity_on_hand,
      min_quantity: input.min_quantity,
      active: input.active,
    })
    .eq("id", id);

  if (!error) {
    await logAudit("produto_editado", "product", id, {
      nome: input.name,
      quantidade: input.quantity_on_hand,
    });
  }

  return { error: error?.message ?? null };
}

/** "Remover" produto = desativar. Nunca excluímos, pois há histórico de movimentação vinculado. */
export async function deactivateProduct(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").update({ active: false }).eq("id", id);

  if (!error) {
    await logAudit("produto_desativado", "product", id);
  }

  return { error: error?.message ?? null };
}

export interface ServiceProductItem {
  id: string;
  product_id: string;
  product_name: string;
  unit: string;
  quantity: number;
}

/** A "receita" de um serviço: quais produtos e quanto de cada ele consome. */
export async function getServiceProducts(serviceId: string): Promise<ServiceProductItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_products")
    .select("id, product_id, quantity, products(name, unit)")
    .eq("service_id", serviceId);

  if (error) return [];
  return (data ?? []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    product_name: row.products?.name ?? "Produto",
    unit: row.products?.unit ?? "un",
    quantity: Number(row.quantity),
  }));
}

/** Substitui a receita inteira do serviço pela lista informada (apaga e recria). */
export async function setServiceProducts(
  serviceId: string,
  items: { product_id: string; quantity: number }[]
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("service_products")
    .delete()
    .eq("service_id", serviceId);
  if (deleteError) return { error: deleteError.message };

  if (items.length === 0) return { error: null };

  const { error: insertError } = await supabase.from("service_products").insert(
    items.map((item) => ({
      service_id: serviceId,
      product_id: item.product_id,
      quantity: item.quantity,
    }))
  );

  return { error: insertError?.message ?? null };
}

/**
 * Desconta do estoque os produtos da receita do serviço usado num atendimento.
 * Lança erro (com a mensagem vinda do banco, ex.: estoque insuficiente) se
 * qualquer item da receita falhar — quem chama decide o que fazer (hoje:
 * reportar ao usuário em vez de deixar o atendimento "concluído" com um
 * desconto de estoque que na verdade não aconteceu).
 */
export async function consumeServiceRecipe(serviceId: string, appointmentId: string): Promise<void> {
  const supabase = await createClient();
  const recipe = await getServiceProducts(serviceId);

  for (const item of recipe) {
    const { error } = await supabase.rpc("consume_product_stock", {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
      p_appointment_id: appointmentId,
    });
    if (error) throw new Error(error.message);
  }
}

/**
 * Consumo interno avulso — não vinculado à "receita" de um serviço (ex.: usou
 * uma lâmina extra, gastou mais álcool que o normal). Qualquer usuário
 * autenticado pode registrar (a função no banco é security definer).
 */
export async function recordAdHocConsumption(
  productId: string,
  quantity: number
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("active")
    .eq("id", productId)
    .single();
  if (!product?.active) {
    return { error: "Esse produto está desativado." };
  }

  const { error } = await supabase.rpc("consume_product_stock", {
    p_product_id: productId,
    p_quantity: quantity,
    p_appointment_id: null,
  });
  return { error: error?.message ?? null };
}
