import { requireAdmin } from "@/services/auth.service";
import { listBarbers } from "@/services/barbers.service";
import { getFinancialReport } from "@/services/financeiro.service";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ExportCsvButton } from "@/components/financeiro/export-csv-button";
import { PrintButton } from "@/components/financeiro/print-button";
import { formatCurrency, toISODateString } from "@/lib/utils";

type Period = "hoje" | "semana" | "mes" | "personalizado";

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function resolveRange(period: Period, start?: string, end?: string) {
  const now = new Date();

  if (period === "personalizado" && start && end) {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    endDate.setDate(endDate.getDate() + 1);
    return { startISO: startDate.toISOString(), endISO: endDate.toISOString() };
  }

  const endISO = new Date().toISOString();

  if (period === "semana") {
    return { startISO: startOfWeek(now).toISOString(), endISO };
  }
  if (period === "mes") {
    const d = new Date(now);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return { startISO: d.toISOString(), endISO };
  }

  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return { startISO: d.toISOString(), endISO };
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; start?: string; end?: string; barber?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const period = (params.period as Period) ?? "hoje";
  const { startISO, endISO } = resolveRange(period, params.start, params.end);

  const [barbers, report] = await Promise.all([
    listBarbers({ onlyActive: true }),
    getFinancialReport({ startISO, endISO, barberId: params.barber }),
  ]);

  const csvRows = [
    ["Indicador", "Valor"],
    ["Faturamento total", report.revenueTotal.toFixed(2)],
    ["Faturamento cortes", report.revenueCortes.toFixed(2)],
    ["Faturamento planos", report.revenuePlanos.toFixed(2)],
    ["Faturamento produtos", report.revenueProdutos.toFixed(2)],
    ["Ticket médio", report.ticketMedio.toFixed(2)],
    ["Atendimentos", String(report.atendimentosCount)],
    ["Clientes novos", String(report.clientesNovos)],
    ["Clientes atendidos", String(report.clientesAtendidos)],
    ["Clientes recorrentes", String(report.clientesRecorrentes)],
    ["Planos vendidos", String(report.planosVendidos)],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Indicadores do período selecionado.</p>
      </div>

      <form className="flex flex-wrap items-end gap-2 print:hidden">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Período</label>
          <Select name="period" defaultValue={period} className="w-40">
            <option value="hoje">Hoje</option>
            <option value="semana">Semana</option>
            <option value="mes">Mês</option>
            <option value="personalizado">Personalizado</option>
          </Select>
        </div>
        {period === "personalizado" ? (
          <>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">De</label>
              <Input type="date" name="start" defaultValue={params.start ?? toISODateString(new Date())} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Até</label>
              <Input type="date" name="end" defaultValue={params.end ?? toISODateString(new Date())} />
            </div>
          </>
        ) : null}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Barbeiro</label>
          <Select name="barber" defaultValue={params.barber ?? ""} className="w-44">
            <option value="">Todos</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.full_name}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="gold">
          Filtrar
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Faturamento total</p>
            <p className="text-lg font-semibold text-gold">{formatCurrency(report.revenueTotal)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cortes</p>
            <p className="text-lg font-semibold">{formatCurrency(report.revenueCortes)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Planos</p>
            <p className="text-lg font-semibold">{formatCurrency(report.revenuePlanos)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Produtos</p>
            <p className="text-lg font-semibold">{formatCurrency(report.revenueProdutos)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ticket médio</p>
            <p className="text-lg font-semibold">{formatCurrency(report.ticketMedio)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Atendimentos</p>
            <p className="text-lg font-semibold">{report.atendimentosCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Clientes novos</p>
            <p className="text-lg font-semibold">{report.clientesNovos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Clientes recorrentes</p>
            <p className="text-lg font-semibold">{report.clientesRecorrentes}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Serviços mais vendidos</h2>
          <Card>
            <CardContent className="space-y-2 p-4">
              {report.topServicos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados no período.</p>
              ) : (
                report.topServicos.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <span>
                      {s.name} <span className="text-muted-foreground">({s.count}x)</span>
                    </span>
                    <span className="font-medium">{formatCurrency(s.revenue)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Produtos mais vendidos</h2>
          <Card>
            <CardContent className="space-y-2 p-4">
              {report.topProdutos.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem dados no período.</p>
              ) : (
                report.topProdutos.map((p) => (
                  <div key={p.name} className="flex items-center justify-between text-sm">
                    <span>
                      {p.name} <span className="text-muted-foreground">({p.count}x)</span>
                    </span>
                    <span className="font-medium">{formatCurrency(p.revenue)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Faturamento por barbeiro</h2>
        <Card>
          <CardContent className="space-y-2 p-4">
            {report.porBarbeiro.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem dados no período.</p>
            ) : (
              report.porBarbeiro.map((b) => (
                <div key={b.name} className="flex items-center justify-between text-sm">
                  <span>{b.name}</span>
                  <span className="font-medium">{formatCurrency(b.revenue)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 print:hidden">
        <ExportCsvButton rows={csvRows} filename={`financeiro-${period}.csv`} />
        <PrintButton />
      </div>
    </div>
  );
}
