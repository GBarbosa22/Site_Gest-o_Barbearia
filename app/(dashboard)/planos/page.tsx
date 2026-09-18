import Link from "next/link";
import { Plus } from "lucide-react";
import { listActiveSubscriptions } from "@/services/subscriptions.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WeeksProgress } from "@/components/subscriptions/weeks-progress";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PlanosPage() {
  const subscriptions = await listActiveSubscriptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Planos</h1>
          <p className="text-sm text-muted-foreground">
            Plano de 4 cortes, 1 por semana — quem não corta na semana perde o crédito.
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/planos/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum plano ativo no momento.</p>
        ) : (
          subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sub.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Comprado em {formatDate(sub.purchased_at)} · {formatCurrency(sub.price)}
                    </p>
                  </div>
                  <Link href={`/clientes/${sub.client_id}`} className="text-xs text-gold">
                    Ver cliente
                  </Link>
                </div>
                <WeeksProgress state={sub.state} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
