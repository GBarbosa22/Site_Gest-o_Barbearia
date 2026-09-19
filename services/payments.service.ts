import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/services/auth.service";
import { recordAutoCashEntry } from "@/services/cash-register.service";
import { logAudit } from "@/services/audit.service";
import type { PaymentMethod, PaymentRow } from "@/types/database.types";

export interface PaymentInput {
  amount: number;
  discount: number;
  /** null = "vai pagar depois" (pendente). */
  method: PaymentMethod | null;
  /** Data prevista de recebimento — só relevante quando method é null. */
  dueDate?: string | null;
  notes?: string | null;
}

export async function createPayment(
  appointmentId: string,
  input: PaymentInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const { data, error } = await supabase
    .from("payments")
    .insert({
      appointment_id: appointmentId,
      amount: input.amount,
      discount: input.discount,
      method: input.method,
      paid: input.method !== null,
      due_date: input.method === null ? input.dueDate || null : null,
      notes: input.notes || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  if (input.method !== null) {
    await logAudit("pagamento_recebido", "payment", data.id, {
      metodo: input.method,
      valor: input.amount - input.discount,
    });
  }

  if (input.method === "dinheiro") {
    await recordAutoCashEntry({
      category: "corte",
      amount: input.amount - input.discount,
      paymentId: data.id,
    });
  }

  return { error: null };
}

export async function getPaymentByAppointment(appointmentId: string): Promise<PaymentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("appointment_id", appointmentId)
    .single();
  if (error) return null;
  return data;
}

export async function updatePayment(
  appointmentId: string,
  input: PaymentInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .update({
      amount: input.amount,
      discount: input.discount,
      method: input.method,
      paid: input.method !== null,
      due_date: input.method === null ? input.dueDate || null : null,
      notes: input.notes || null,
    })
    .eq("appointment_id", appointmentId)
    .select("id")
    .single();

  if (!error && data?.id) {
    await logAudit("pagamento_editado", "payment", data.id, {
      metodo: input.method,
      valor: input.amount - input.discount,
    });
  }

  return { error: error?.message ?? null };
}

/** Marca um pagamento pendente ("vai pagar depois") como recebido. */
export async function markPaymentPaid(
  appointmentId: string,
  method: PaymentMethod
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .update({ method, paid: true, due_date: null })
    .eq("appointment_id", appointmentId)
    .select("id, amount, discount")
    .single();

  if (error) return { error: error.message };

  await logAudit("pagamento_recebido", "payment", data.id, {
    metodo: method,
    valor: Number(data.amount) - Number(data.discount),
  });

  if (method === "dinheiro") {
    await recordAutoCashEntry({
      category: "corte",
      amount: Number(data.amount) - Number(data.discount),
      paymentId: data.id,
    });
  }

  return { error: null };
}

export async function getRevenueBetween(startISO: string, endISO: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("amount, discount, created_at")
    .eq("paid", true)
    .gte("created_at", startISO)
    .lt("created_at", endISO);

  if (error || !data) return 0;
  return data.reduce((sum, row) => sum + Number(row.amount) - Number(row.discount), 0);
}

/** Pagamentos pendentes ("vai pagar depois"), ordenados pela data prevista. */
export async function listPendingPayments(): Promise<
  (PaymentRow & { client_name: string; barber_name: string })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select("*, appointments(clients(full_name), barbers(full_name))")
    .eq("paid", false)
    .order("due_date", { ascending: true, nullsFirst: true });

  if (error) return [];
  return (data ?? []).map((row: any) => ({
    ...row,
    client_name: row.appointments?.clients?.full_name ?? "Cliente",
    barber_name: row.appointments?.barbers?.full_name ?? "Barbeiro",
  }));
}
