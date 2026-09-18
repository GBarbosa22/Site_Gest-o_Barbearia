import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/services/auth.service";
import { logAudit } from "@/services/audit.service";
import type { CashMovementCategory, CashRegisterRow, CashMovementRow } from "@/types/database.types";

export interface CashMovementListItem extends CashMovementRow {
  created_by_name: string | null;
}

export async function getOpenRegister(): Promise<CashRegisterRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_registers")
    .select("*")
    .eq("status", "open")
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function listRegisters(): Promise<CashRegisterRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_registers")
    .select("*")
    .order("opened_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRegister(id: string): Promise<CashRegisterRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cash_registers").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

export async function listMovements(registerId: string): Promise<CashMovementListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_movements")
    .select("*, users(full_name)")
    .eq("cash_register_id", registerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({
    ...row,
    created_by_name: row.users?.full_name ?? null,
  }));
}

export async function openRegister(openingBalance: number): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const existing = await getOpenRegister();
  if (existing) return { error: "Já existe um caixa aberto." };

  const { data, error } = await supabase
    .from("cash_registers")
    .insert({
      opening_balance: openingBalance,
      opened_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (data?.id) {
    await logAudit("caixa_aberto", "cash_register", data.id, { saldo_inicial: openingBalance });
  }

  return { error: error?.message ?? null };
}

export async function closeRegister(
  id: string,
  informedBalance: number,
  notes?: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const register = await getRegister(id);
  if (!register) return { error: "Caixa não encontrado." };

  const movements = await listMovements(id);
  const totalEntradas = movements
    .filter((m) => m.type === "entrada")
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const totalSaidas = movements
    .filter((m) => m.type === "saida")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const expectedBalance = Number(register.opening_balance) + totalEntradas - totalSaidas;
  const difference = informedBalance - expectedBalance;

  const { error } = await supabase
    .from("cash_registers")
    .update({
      status: "closed",
      closed_at: new Date().toISOString(),
      closed_by: user?.id ?? null,
      expected_balance: expectedBalance,
      informed_balance: informedBalance,
      difference,
      notes: notes || null,
    })
    .eq("id", id);

  if (!error) {
    await logAudit("caixa_fechado", "cash_register", id, {
      saldo_esperado: expectedBalance,
      saldo_informado: informedBalance,
      diferenca: difference,
    });
  }

  return { error: error?.message ?? null };
}

export async function addManualMovement(input: {
  type: "entrada" | "saida";
  category: CashMovementCategory;
  amount: number;
  description?: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const register = await getOpenRegister();
  if (!register) return { error: "Não há caixa aberto." };

  const { data, error } = await supabase
    .from("cash_movements")
    .insert({
      cash_register_id: register.id,
      type: input.type,
      category: input.category,
      amount: input.amount,
      description: input.description || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (data?.id) {
    await logAudit("caixa_saida_registrada", "cash_register", register.id, {
      categoria: input.category,
      valor: input.amount,
    });
  }

  return { error: error?.message ?? null };
}

/**
 * Lança a entrada automática de um pagamento em dinheiro (corte, plano ou
 * venda de produto) no caixa aberto. Não faz nada se não houver caixa aberto
 * no momento — o caixa é opcional no dia a dia, não bloqueia o registro.
 */
export async function recordAutoCashEntry(input: {
  category: Extract<CashMovementCategory, "corte" | "plano" | "venda">;
  amount: number;
  paymentId?: string;
  subscriptionId?: string;
  saleId?: string;
}): Promise<void> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  // RPC (security definer) em vez de select direto: um barbeiro não tem
  // permissão de leitura na tabela cash_registers (RLS é admin-only), mas
  // precisa saber o id do caixa aberto pra lançar a própria entrada.
  const { data: openRegisterId } = await supabase.rpc("get_open_cash_register_id");
  if (!openRegisterId) return;

  await supabase.from("cash_movements").insert({
    cash_register_id: openRegisterId,
    type: "entrada",
    category: input.category,
    amount: input.amount,
    payment_id: input.paymentId ?? null,
    subscription_id: input.subscriptionId ?? null,
    sale_id: input.saleId ?? null,
    created_by: user?.id ?? null,
  });
}
