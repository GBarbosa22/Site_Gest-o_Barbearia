import Link from "next/link";
import { Plus, Phone } from "lucide-react";
import { requireAdmin } from "@/services/auth.service";
import { listBarbers } from "@/services/barbers.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BarbeirosPage() {
  await requireAdmin();
  const barbers = await listBarbers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Barbeiros</h1>
          <p className="text-sm text-muted-foreground">Gerencie a equipe da barbearia.</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/barbeiros/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {barbers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum barbeiro cadastrado ainda.</p>
        ) : (
          barbers.map((barber) => (
            <Link key={barber.id} href={`/barbeiros/${barber.id}`}>
              <Card className="transition-colors hover:border-gold/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{barber.full_name}</p>
                      {!barber.active ? <Badge variant="destructive">Inativo</Badge> : null}
                    </div>
                    {barber.phone ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {barber.phone}
                      </p>
                    ) : null}
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
