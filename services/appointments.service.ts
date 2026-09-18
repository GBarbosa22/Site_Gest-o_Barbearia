import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/services/auth.service";
import { createPayment, updatePayment, type PaymentInput } from "@/services/payments.service";
import type { AppointmentRow, AppointmentStatus, PaymentRow } from "@/types/database.types";
import type { AttendanceInput } from "@/lib/validations/appointment";

export interface AttendanceListItem extends AppointmentRow {
  client_name: string;
  barber_name: string;
  service_name: string;
  payment: PaymentRow | null;
}

function dayRange(dateISO: string) {
  const start = new Date(`${dateISO}T00:00:00`);
  const end = new Date(`${dateISO}T00:00:00`);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function toPaymentInput(input: AttendanceInput): PaymentInput {
  return {
    amount: input.amount,
    discount: input.discount,
    method: input.method === "" ? null : input.method,
    notes: null,
  };
}

function mapRow(row: any): AttendanceListItem {
  return {
    ...row,
    client_name: row.clients?.full_name ?? "Cliente",
    barber_name: row.barbers?.full_name ?? "Barbeiro",
    service_name: row.services?.name ?? "Serviço",
    payment: Array.isArray(row.payments) ? row.payments[0] ?? null : row.payments ?? null,
  };
}

const SELECT_WITH_JOINS =
  "*, clients(full_name), barbers(full_name), services(name), payments(*)";

/** Lista os atendimentos registrados em um dia. Barbeiro só vê os próprios (RLS). */
export async function listAttendancesByDay(
  dateISO: string,
  barberId?: string
): Promise<AttendanceListItem[]> {
  const supabase = await createClient();
  const { start, end } = dayRange(dateISO);

  let query = supabase
    .from("appointments")
    .select(SELECT_WITH_JOINS)
    .gte("starts_at", start)
    .lt("starts_at", end)
    .neq("status", "cancelled")
    .order("starts_at", { ascending: false });

  if (barberId) {
    query = query.eq("barber_id", barberId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map(mapRow);
}

export async function getAttendance(id: string): Promise<AttendanceListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(SELECT_WITH_JOINS)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return mapRow(data);
}

/** Histórico completo de um cliente (para a tela de detalhe do cliente). */
export async function listAppointmentsByClient(clientId: string): Promise<AttendanceListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(SELECT_WITH_JOINS)
    .eq("client_id", clientId)
    .order("starts_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

/**
 * Registra um atendimento que JÁ aconteceu: cria o registro (status
 * "completed", horário = agora) e o pagamento (ou marca como pendente) numa
 * única operação. Não há mais agendamento futuro nem checagem de conflito de
 * horário — a barbearia já usa outro app para marcar horário com o cliente.
 */
export async function createAttendance(input: AttendanceInput): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", input.service_id)
    .single();

  if (serviceError || !service) {
    return { error: "Serviço não encontrado." };
  }

  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);
  const user = await getCurrentUserProfile();

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      client_id: input.client_id,
      barber_id: input.barber_id,
      service_id: input.service_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "completed",
      notes: input.notes || null,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !appointment) {
    return { error: error?.message ?? "Não foi possível registrar o atendimento." };
  }

  const { error: paymentError } = await createPayment(appointment.id, toPaymentInput(input));
  if (paymentError) {
    return { error: paymentError };
  }

  return { error: null };
}

/** Corrige um atendimento já registrado (cliente/serviço/valor/pagamento). */
export async function updateAttendance(
  id: string,
  input: AttendanceInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("appointments")
    .update({
      client_id: input.client_id,
      barber_id: input.barber_id,
      service_id: input.service_id,
      notes: input.notes || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  const { error: paymentError } = await updatePayment(id, toPaymentInput(input));
  return { error: paymentError };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  return { error: error?.message ?? null };
}
