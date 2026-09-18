import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/services/auth.service";
import type { AppointmentRow, AppointmentStatus } from "@/types/database.types";
import type { AppointmentInput } from "@/lib/validations/appointment";

export interface AppointmentListItem extends AppointmentRow {
  client_name: string;
  barber_name: string;
  service_name: string;
  service_duration_minutes: number;
}

function dayRange(dateISO: string) {
  const start = new Date(`${dateISO}T00:00:00`);
  const end = new Date(`${dateISO}T00:00:00`);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Lista os agendamentos de um dia. Barbeiro só vê a própria agenda (RLS garante isso mesmo se barberId não for passado). */
export async function listAppointmentsByDay(
  dateISO: string,
  barberId?: string
): Promise<AppointmentListItem[]> {
  const supabase = await createClient();
  const { start, end } = dayRange(dateISO);

  let query = supabase
    .from("appointments")
    .select(
      "*, clients(full_name), barbers(full_name), services(name, duration_minutes)"
    )
    .gte("starts_at", start)
    .lt("starts_at", end)
    .order("starts_at", { ascending: true });

  if (barberId) {
    query = query.eq("barber_id", barberId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    client_name: row.clients?.full_name ?? "Cliente",
    barber_name: row.barbers?.full_name ?? "Barbeiro",
    service_name: row.services?.name ?? "Serviço",
    service_duration_minutes: row.services?.duration_minutes ?? 30,
  }));
}

/** Histórico completo de um cliente (para a tela de detalhe do cliente). */
export async function listAppointmentsByClient(clientId: string): Promise<AppointmentListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, clients(full_name), barbers(full_name), services(name, duration_minutes)")
    .eq("client_id", clientId)
    .order("starts_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    client_name: row.clients?.full_name ?? "Cliente",
    barber_name: row.barbers?.full_name ?? "Barbeiro",
    service_name: row.services?.name ?? "Serviço",
    service_duration_minutes: row.services?.duration_minutes ?? 30,
  }));
}

export async function getAppointment(id: string): Promise<AppointmentListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*, clients(full_name), barbers(full_name), services(name, duration_minutes)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  const row: any = data;
  return {
    ...row,
    client_name: row.clients?.full_name ?? "Cliente",
    barber_name: row.barbers?.full_name ?? "Barbeiro",
    service_name: row.services?.name ?? "Serviço",
    service_duration_minutes: row.services?.duration_minutes ?? 30,
  };
}

function isOverlapError(error: { code?: string; message: string }) {
  return error.code === "23P01" || error.message.includes("appointments_no_overlap");
}

export async function createAppointment(
  input: AppointmentInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", input.service_id)
    .single();

  if (serviceError || !service) {
    return { error: "Serviço não encontrado." };
  }

  const startsAt = new Date(`${input.date}T${input.time}:00`);
  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);

  const user = await getCurrentUserProfile();

  const { error } = await supabase.from("appointments").insert({
    client_id: input.client_id,
    barber_id: input.barber_id,
    service_id: input.service_id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    notes: input.notes || null,
    created_by: user?.id ?? null,
  });

  if (error) {
    if (isOverlapError(error)) {
      return { error: "Esse barbeiro já tem outro atendimento nesse horário." };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function updateAppointment(
  id: string,
  input: AppointmentInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", input.service_id)
    .single();

  if (serviceError || !service) {
    return { error: "Serviço não encontrado." };
  }

  const startsAt = new Date(`${input.date}T${input.time}:00`);
  const endsAt = new Date(startsAt.getTime() + service.duration_minutes * 60_000);

  const { error } = await supabase
    .from("appointments")
    .update({
      client_id: input.client_id,
      barber_id: input.barber_id,
      service_id: input.service_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      notes: input.notes || null,
    })
    .eq("id", id);

  if (error) {
    if (isOverlapError(error)) {
      return { error: "Esse barbeiro já tem outro atendimento nesse horário." };
    }
    return { error: error.message };
  }

  return { error: null };
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
  return { error: error?.message ?? null };
}
