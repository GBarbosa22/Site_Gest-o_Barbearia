import { createClient } from "@/lib/supabase/server";

export interface RankingItem {
  name: string;
  count: number;
  revenue: number;
}

export interface BarberRanking {
  name: string;
  revenue: number;
}

export interface FinancialReport {
  revenueCortes: number;
  revenuePlanos: number;
  revenueProdutos: number;
  revenueTotal: number;
  ticketMedio: number;
  atendimentosCount: number;
  clientesNovos: number;
  clientesAtendidos: number;
  clientesRecorrentes: number;
  planosVendidos: number;
  topServicos: RankingItem[];
  topProdutos: RankingItem[];
  porBarbeiro: BarberRanking[];
}

interface Filters {
  startISO: string;
  endISO: string;
  barberId?: string;
}

export async function getFinancialReport({ startISO, endISO, barberId }: Filters): Promise<FinancialReport> {
  const supabase = await createClient();

  let appointmentsQuery = supabase
    .from("appointments")
    .select(
      "id, client_id, barber_id, service_id, starts_at, barbers(full_name), services(name), payments(amount, discount, paid)"
    )
    .eq("status", "completed")
    .gte("starts_at", startISO)
    .lt("starts_at", endISO);
  if (barberId) appointmentsQuery = appointmentsQuery.eq("barber_id", barberId);

  let subscriptionsQuery = supabase
    .from("subscriptions")
    .select("price, barber_id, barbers(full_name)")
    .neq("status", "cancelled")
    .gte("purchased_at", startISO)
    .lt("purchased_at", endISO);
  if (barberId) subscriptionsQuery = subscriptionsQuery.eq("barber_id", barberId);

  let salesQuery = supabase
    .from("sales")
    .select(
      "amount, discount, barber_id, barbers(full_name), sale_items(product_id, quantity, subtotal, products(name))"
    )
    .eq("paid", true)
    .gte("created_at", startISO)
    .lt("created_at", endISO);
  if (barberId) salesQuery = salesQuery.eq("barber_id", barberId);

  const [{ data: appointments }, { data: subscriptions }, { data: sales }, { count: clientesNovos }] =
    await Promise.all([
      appointmentsQuery,
      subscriptionsQuery,
      salesQuery,
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startISO)
        .lt("created_at", endISO),
    ]);

  const revenueByBarber = new Map<string, number>();
  // Agrega por ID, não por nome — dois produtos/serviços com o mesmo nome não
  // podem cair na mesma linha do ranking.
  const serviceStats = new Map<string, { name: string; count: number; revenue: number }>();
  let revenueCortes = 0;
  const clientIds = new Set<string>();

  for (const row of (appointments ?? []) as any[]) {
    const payment = Array.isArray(row.payments) ? row.payments[0] : row.payments;
    if (!payment || !payment.paid) continue;
    const value = Number(payment.amount) - Number(payment.discount);
    revenueCortes += value;
    clientIds.add(row.client_id);

    const barberName = row.barbers?.full_name ?? "Barbeiro";
    revenueByBarber.set(barberName, (revenueByBarber.get(barberName) ?? 0) + value);

    const serviceId = row.service_id ?? row.services?.name ?? "servico-desconhecido";
    const serviceName = row.services?.name ?? "Serviço";
    const current = serviceStats.get(serviceId) ?? { name: serviceName, count: 0, revenue: 0 };
    serviceStats.set(serviceId, { name: serviceName, count: current.count + 1, revenue: current.revenue + value });
  }

  let revenuePlanos = 0;
  for (const row of (subscriptions ?? []) as any[]) {
    revenuePlanos += Number(row.price);
    const barberName = row.barbers?.full_name ?? "Sem barbeiro";
    revenueByBarber.set(barberName, (revenueByBarber.get(barberName) ?? 0) + Number(row.price));
  }

  let revenueProdutos = 0;
  const productStats = new Map<string, { name: string; count: number; revenue: number }>();
  for (const row of (sales ?? []) as any[]) {
    const value = Number(row.amount) - Number(row.discount);
    revenueProdutos += value;
    const barberName = row.barbers?.full_name ?? "Barbeiro";
    revenueByBarber.set(barberName, (revenueByBarber.get(barberName) ?? 0) + value);

    for (const item of row.sale_items ?? []) {
      const productId = item.product_id ?? item.products?.name ?? "produto-desconhecido";
      const productName = item.products?.name ?? "Produto";
      const current = productStats.get(productId) ?? { name: productName, count: 0, revenue: 0 };
      productStats.set(productId, {
        name: productName,
        count: current.count + Number(item.quantity),
        revenue: current.revenue + Number(item.subtotal),
      });
    }
  }

  const atendimentosCount = (appointments ?? []).length;
  const revenueTotal = revenueCortes + revenuePlanos + revenueProdutos;
  const clientesAtendidos = clientIds.size;
  const ticketMedio = atendimentosCount > 0 ? revenueCortes / atendimentosCount : 0;
  const clientesRecorrentes = Math.max(0, clientesAtendidos - (clientesNovos ?? 0));

  const topServicos: RankingItem[] = Array.from(serviceStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const topProdutos: RankingItem[] = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const porBarbeiro: BarberRanking[] = Array.from(revenueByBarber.entries())
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    revenueCortes,
    revenuePlanos,
    revenueProdutos,
    revenueTotal,
    ticketMedio,
    atendimentosCount,
    clientesNovos: clientesNovos ?? 0,
    clientesAtendidos,
    clientesRecorrentes,
    planosVendidos: (subscriptions ?? []).length,
    topServicos,
    topProdutos,
    porBarbeiro,
  };
}
