import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/services/auth.service";
import { recordAutoCashEntry } from "@/services/cash-register.service";
import { computeSubscriptionState, type SubscriptionState } from "@/lib/subscription-logic";
import type { PaymentMethod, SubscriptionRow } from "@/types/database.types";

export interface SubscriptionWithState extends SubscriptionRow {
  client_name: string;
  state: SubscriptionState;
}

async function attachStateAndSync(row: any, supabase: Awaited<ReturnType<typeof createClient>>) {
  const uses = row.subscription_uses ?? [];
  const state = computeSubscriptionState(row, uses);

  // Mantém o status salvo em sincronia com a regra derivada (sem depender de cron).
  if (row.status === "active" && state.derivedStatus !== "active") {
    await supabase.from("subscriptions").update({ status: state.derivedStatus }).eq("id", row.id);
    row.status = state.derivedStatus;
  }

  return { ...row, client_name: row.clients?.full_name ?? "Cliente", state } as SubscriptionWithState;
}

const SELECT_WITH_JOINS = "*, clients(full_name), subscription_uses(week_number, used_at)";

export async function listSubscriptionsForClient(clientId: string): Promise<SubscriptionWithState[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SELECT_WITH_JOINS)
    .eq("client_id", clientId)
    .order("purchased_at", { ascending: false });

  if (error) throw new Error(error.message);
  return Promise.all((data ?? []).map((row) => attachStateAndSync(row, supabase)));
}

export async function listActiveSubscriptions(): Promise<SubscriptionWithState[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SELECT_WITH_JOINS)
    .in("status", ["active"])
    .order("purchased_at", { ascending: false });

  if (error) throw new Error(error.message);
  const withState = await Promise.all((data ?? []).map((row) => attachStateAndSync(row, supabase)));
  return withState.filter((s) => s.state.derivedStatus === "active");
}

export async function getSubscription(id: string): Promise<SubscriptionWithState | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select(SELECT_WITH_JOINS)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return attachStateAndSync(data, supabase);
}

/**
 * Para a tela de registrar atendimento: se o cliente tiver um plano ativo com
 * crédito disponível na semana atual, retorna ele (para oferecer "usar corte
 * do plano" no formulário).
 */
export async function getUsableSubscriptionForClient(
  clientId: string
): Promise<SubscriptionWithState | null> {
  const subscriptions = await listSubscriptionsForClient(clientId);
  return subscriptions.find((s) => s.status === "active" && s.state.isActiveNow) ?? null;
}

export interface UsableSubscription {
  id: string;
  price: number;
}

/**
 * Mapa client_id -> plano utilizável agora (1 consulta só, usada na tela de
 * registrar atendimento para oferecer "usar corte do plano" por cliente).
 */
export async function getUsableSubscriptionsMap(): Promise<Record<string, UsableSubscription>> {
  const active = await listActiveSubscriptions();
  const map: Record<string, UsableSubscription> = {};
  for (const sub of active) {
    if (sub.state.isActiveNow) {
      map[sub.client_id] = { id: sub.id, price: sub.price };
    }
  }
  return map;
}

export async function createSubscription(input: {
  clientId: string;
  barberId?: string | null;
  price: number;
  paymentMethod: PaymentMethod;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      client_id: input.clientId,
      barber_id: input.barberId || null,
      price: input.price,
      total_credits: 4,
      payment_method: input.paymentMethod,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (input.paymentMethod === "dinheiro") {
    await recordAutoCashEntry({ category: "plano", amount: input.price, subscriptionId: data.id });
  }

  return { error: null };
}

export async function cancelSubscription(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", id);
  return { error: error?.message ?? null };
}

/** Consome 1 crédito do plano na semana atual, vinculado ao atendimento registrado. */
export async function useSubscriptionCredit(
  subscriptionId: string,
  weekNumber: number,
  appointmentId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const { error } = await supabase.from("subscription_uses").insert({
    subscription_id: subscriptionId,
    week_number: weekNumber,
    appointment_id: appointmentId,
    created_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  const subscription = await getSubscription(subscriptionId);
  if (subscription && subscription.state.derivedStatus === "completed") {
    await supabase.from("subscriptions").update({ status: "completed" }).eq("id", subscriptionId);
  }

  return { error: null };
}
