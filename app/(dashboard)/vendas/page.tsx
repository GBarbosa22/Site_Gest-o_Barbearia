import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUserProfile } from "@/services/auth.service";
import { listSalesByDay } from "@/services/sales.service";
import { listBarbers } from "@/services/barbers.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DateNav } from "@/components/appointments/date-nav";
import { formatCurrency, formatTime, toISODateString } from "@/lib/utils";

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; barber?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUserProfile();
  const date = params.date ?? toISODateString(new Date());
  const isAdmin = user?.role === "admin";

  const barbers = isAdmin ? await listBarbers({ onlyActive: true }) : [];
  const barberFilter = isAdmin ? params.barber : undefined;

  const sales = await listSalesByDay(date, barberFilter);
  const totalDoDia = sales.reduce((sum, s) => sum + Number(s.amount) - Number(s.discount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vendas</h1>
          <p className="text-sm text-muted-foreground">
            {sales.length} venda{sales.length === 1 ? "" : "s"} · {formatCurrency(totalDoDia)}
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/vendas/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <DateNav date={date} barberId={barberFilter} basePath="/vendas" />

      {isAdmin ? (
        <form className="flex items-center gap-2">
          <input type="hidden" name="date" value={date} />
          <Select name="barber" defaultValue={barberFilter ?? ""} className="max-w-xs">
            <option value="">Todos os barbeiros</option>
            {barbers.map((barber) => (
              <option key={barber.id} value={barber.id}>
                {barber.full_name}
              </option>
            ))}
          </Select>
        </form>
      ) : null}

      <div className="space-y-2">
        {sales.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma venda registrada neste dia.
          </p>
        ) : (
          sales.map((sale) => (
            <Link key={sale.id} href={`/vendas/${sale.id}?date=${date}`}>
              <Card className="transition-colors hover:border-gold/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs text-muted-foreground">{formatTime(sale.created_at)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sale.client_name ?? "Sem cliente"}</p>
                    <p className="text-xs text-muted-foreground">
                      {sale.items.map((i) => `${i.quantity}x ${i.product_name}`).join(", ")}
                      {isAdmin ? ` · ${sale.barber_name}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatCurrency(Number(sale.amount) - Number(sale.discount))}
                    </p>
                    {!sale.paid ? (
                      <Badge variant="destructive">Vai pagar</Badge>
                    ) : (
                      <Badge variant="success">Pago</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
