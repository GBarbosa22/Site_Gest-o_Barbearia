import { notFound } from "next/navigation";
import { getSale } from "@/services/sales.service";
import { MarkSalePaidForm } from "@/components/sales/mark-sale-paid-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime, toISODateString } from "@/lib/utils";

export default async function VendaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date: dateParam } = await searchParams;
  const sale = await getSale(id);
  if (!sale) notFound();

  const date = dateParam ?? toISODateString(new Date(sale.created_at));

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{sale.client_name ?? "Sem cliente"}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(sale.created_at)} às {formatTime(sale.created_at)} · {sale.barber_name}
          </p>
        </div>
        <Badge variant={sale.paid ? "success" : "destructive"}>{sale.paid ? "Pago" : "Vai pagar"}</Badge>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          {sale.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span>
                {item.quantity}x {item.product_name}
              </span>
              <span className="text-muted-foreground">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 text-right text-sm font-semibold">
            Total: {formatCurrency(Number(sale.amount) - Number(sale.discount))}
          </div>
        </CardContent>
      </Card>

      {sale.notes ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">{sale.notes}</CardContent>
        </Card>
      ) : null}

      {!sale.paid ? <MarkSalePaidForm id={sale.id} date={date} /> : null}
    </div>
  );
}
