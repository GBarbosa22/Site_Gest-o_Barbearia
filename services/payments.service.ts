import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/services/auth.service";
import type { PaymentMethod, PaymentRow } from "@/types/database.types";

export interface PaymentInput {
  amount: number;
  discount: number;
  /** null = "vai pagar depois" (pendente). */
  method: PaymentMethod | null;
  notes?: string | null;
}

export async function createPayment(
  appointmentId: string,
  input: PaymentInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const user = await getCurrentUserProfile();

  const { error } = await supabase.from("payments").insert({
    appointment_id: appointmentId,
    amount: input.amount,
    discount: input.discount,
    method: input.method,
    paid: input.method !== null,
    notes: input.notes || null,
    created_by: user?.id ?? null,
  });

  return { error: error?.message ?? null };
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
  const { error } = await supabase
    .from("payments")
    .update({
      amount: input.amount,
      discount: input.discount,
      method: input.method,
      paid: input.method !== null,
      notes: input.notes || null,
    })
    .eq("appointment_id", appointmentId);
  return { error: error?.message ?? null };
}

/** Marca um pagamento pendente ("vai pagar depois") como recebido. */
export async function markPaymentPaid(
  appointmentId: string,
  method: PaymentMethod
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("payments")
    .update({ method, paid: true })
    .eq("appointment_id", appointmentId);
  return { error: error?.message ?? null };
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
