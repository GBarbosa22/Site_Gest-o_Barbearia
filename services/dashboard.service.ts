import { createClient } from "@/lib/supabase/server";
import { getRevenueBetween } from "@/services/payments.service";
import type { DashboardSummary, RecentAttendance } from "@/types";

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

/** Agrega os indicadores do dashboard principal. */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();
  const todayStart = startOfDayISO();
  const now = new Date().toISOString();

  const [
    { count: cutsToday },
    { count: newClientsToday },
    { data: recent },
    revenueToday,
    revenueWeek,
    revenueMonth,
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
        "id, starts_at, clients(full_name), barbers(full_name), services(name), payments(amount, discount, paid)"
      )
      .eq("status", "completed")
      .gte("starts_at", todayStart)
      .order("starts_at", { ascending: false })
      .limit(6),
    getRevenueBetween(todayStart, now),
    getRevenueBetween(startOfWeekISO(), now),
    getRevenueBetween(startOfMonthISO(), now),
  ]);

  const distinctClientsToday = await supabase
    .from("appointments")
    .select("client_id")
    .eq("status", "completed")
    .gte("starts_at", todayStart);

  const clientsAttendedToday = new Set(
    (distinctClientsToday.data ?? []).map((row: { client_id: string }) => row.client_id)
  ).size;

  const recentAttendances: RecentAttendance[] = (recent ?? []).map((row: any) => {
    const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
    return {
      id: row.id,
      clientName: row.clients?.full_name ?? "Cliente",
      barberName: row.barbers?.full_name ?? "Barbeiro",
      serviceName: row.services?.name ?? "Serviço",
      startsAt: row.starts_at,
      amount: payment ? Number(payment.amount) - Number(payment.discount) : null,
      paid: payment ? payment.paid : null,
    };
  });

  return {
    revenueToday,
    revenueWeek,
    revenueMonth,
    cutsToday: cutsToday ?? 0,
    clientsAttendedToday,
    newClientsToday: newClientsToday ?? 0,
    activeSubscriptions: 0,
    lowStockCount: 0,
    recentAttendances,
  };
}
