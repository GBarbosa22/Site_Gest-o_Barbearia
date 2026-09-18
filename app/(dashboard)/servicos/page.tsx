import Link from "next/link";
import { Plus, Clock } from "lucide-react";
import { requireAdmin } from "@/services/auth.service";
import { listServices } from "@/services/catalog.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default async function ServicosPage() {
  await requireAdmin();
  const services = await listServices();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Serviços</h1>
          <p className="text-sm text-muted-foreground">Catálogo de serviços e preços.</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/servicos/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
        ) : (
          services.map((service) => (
            <Link key={service.id} href={`/servicos/${service.id}`}>
              <Card className="transition-colors hover:border-gold/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{service.name}</p>
                      {!service.active ? <Badge variant="destructive">Inativo</Badge> : null}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {service.duration_minutes} min
                    </p>
                  </div>
                  <Badge variant="gold">{formatCurrency(service.price)}</Badge>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
