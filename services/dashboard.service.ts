import { createClient } from "@/lib/supabase/server";
import type { DashboardSummary, UpcomingAppointment } from "@/types";

function startOfDayISO(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfWeekISO(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // segunda-feira como início da semana
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfMonthISO(date = new Date()) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Agrega os indicadores do dashboard principal.
 *
 * Faturamento (dia/semana/mês) e alertas de estoque baixo dependem das
 * tabelas `payments` e `products`, criadas nas Fases 3 e 4 — por ora
 * retornam 0 e serão conectados quando essas migrações existirem.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const todayStart = startOfDayISO();

  const [
    { count: cutsToday },
    { count: newClientsToday },
    { data: upcoming },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("starts_at", todayStart),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart),
    supabase
      .from("appointments")
      .select(
        "id, starts_at, clients(full_name), barbers(full_name), services(name)"
      )
      .in("status", ["scheduled", "in_progress"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(6),
  ]);

  const distinctClientsToday = await supabase
    .from("appointments")
    .select("client_id")
    .eq("status", "completed")
    .gte("starts_at", todayStart);

  const clientsAttendedToday = new Set(
    (distinctClientsToday.data ?? []).map((row: { client_id: string }) => row.client_id)
  ).size;

  const upcomingAppointments: UpcomingAppointment[] = (upcoming ?? []).map((row: any) => ({
    id: row.id,
    clientName: row.clients?.full_name ?? "Cliente",
    barberName: row.barbers?.full_name ?? "Barbeiro",
    serviceName: row.services?.name ?? "Serviço",
    startsAt: row.starts_at,
  }));

  return {
    revenueToday: 0,
    revenueWeek: 0,
    revenueMonth: 0,
    cutsToday: cutsToday ?? 0,
    clientsAttendedToday,
    newClientsToday: newClientsToday ?? 0,
    activeSubscriptions: 0,
    lowStockCount: 0,
    upcomingAppointments,
  };
}

export { startOfWeekISO, startOfMonthISO };
