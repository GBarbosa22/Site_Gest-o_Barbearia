import Link from "next/link";
import { Cake, AlertTriangle, Clock, ArrowRight, MessageCircle } from "lucide-react";
import { requireAdmin } from "@/services/auth.service";
import { getBirthdaysToday } from "@/services/clients.service";
import { listLowStockProducts } from "@/services/products.service";
import { listPendingPayments } from "@/services/payments.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

function whatsappHref(rawPhone: string, name: string) {
  const digits = rawPhone.replace(/\D/g, "");
  const message = encodeURIComponent(
    `Olá, ${name.split(" ")[0]}! A equipe da Barbearia Gentlemen deseja um feliz aniversário! 🎉`
  );
  return `https://wa.me/55${digits}?text=${message}`;
}

export default async function RelatoriosPage() {
  await requireAdmin();

  const [birthdays, lowStock, pending] = await Promise.all([
    getBirthdaysToday(),
    listLowStockProducts(),
    listPendingPayments(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
        <p className="text-sm text-muted-foreground">Panorama rápido do dia a dia.</p>
      </div>

      <Link href="/financeiro">
        <Card className="transition-colors hover:border-gold/50">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">Relatório financeiro completo</p>
              <p className="text-xs text-muted-foreground">
                Faturamento, ticket médio, ranking de serviços/produtos, exportar PDF e CSV
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Cake className="h-4 w-4" />
          Aniversariantes de hoje
        </h2>
        {birthdays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum aniversariante hoje.</p>
        ) : (
          <div className="space-y-2">
            {birthdays.map((client) => {
              const phone = client.whatsapp || client.phone;
              return (
                <Card key={client.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{client.full_name}</p>
                      {client.phone ? (
                        <p className="text-xs text-muted-foreground">{client.phone}</p>
                      ) : null}
                    </div>
                    {phone ? (
                      <Button asChild variant="outline" size="sm">
                        <a href={whatsappHref(phone, client.full_name)} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5" />
                          Parabenizar
                        </a>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          Estoque baixo
        </h2>
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum produto com estoque baixo.</p>
        ) : (
          <div className="space-y-2">
            {lowStock.map((product) => (
              <Link key={product.id} href={`/produtos/${product.id}`}>
                <Card className="border-destructive/40 transition-colors hover:border-destructive">
                  <CardContent className="flex items-center justify-between p-4">
                    <p className="text-sm font-medium">{product.name}</p>
                    <Badge variant="destructive">
                      {product.quantity_on_hand} {product.unit}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Clock className="h-4 w-4" />
          Pagamentos pendentes ("vai pagar depois")
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum pagamento pendente.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((payment) => (
              <Link key={payment.id} href={`/atendimentos/${payment.appointment_id}`}>
                <Card className="transition-colors hover:border-gold/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">{payment.client_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.barber_name}
                        {payment.due_date ? ` · até ${formatDate(payment.due_date)}` : ""}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gold">
                      {formatCurrency(Number(payment.amount) - Number(payment.discount))}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
