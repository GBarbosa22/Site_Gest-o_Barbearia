import { DollarSign, Scissors, Users, UserPlus, Package, CalendarCheck } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { RecentAttendances } from "@/components/dashboard/recent-attendances";
import { getDashboardSummary } from "@/services/dashboard.service";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da barbearia hoje.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Faturamento hoje"
          value={formatCurrency(summary.revenueToday)}
          icon={DollarSign}
          accent
        />
        <StatCard
          title="Faturamento na semana"
          value={formatCurrency(summary.revenueWeek)}
          icon={DollarSign}
        />
        <StatCard
          title="Faturamento no mês"
          value={formatCurrency(summary.revenueMonth)}
          icon={DollarSign}
        />
        <StatCard title="Cortes realizados hoje" value={String(summary.cutsToday)} icon={Scissors} />
        <StatCard
          title="Clientes atendidos hoje"
          value={String(summary.clientsAttendedToday)}
          icon={Users}
        />
        <StatCard title="Clientes novos hoje" value={String(summary.newClientsToday)} icon={UserPlus} />
        <StatCard
          title="Planos ativos"
          value={String(summary.activeSubscriptions)}
          icon={CalendarCheck}
        />
        <StatCard title="Estoque baixo" value={String(summary.lowStockCount)} icon={Package} />
      </div>

      <RecentAttendances items={summary.recentAttendances} />
    </div>
  );
}
