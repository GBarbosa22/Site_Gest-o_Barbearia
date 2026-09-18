import Link from "next/link";
import { Plus, Search, Phone } from "lucide-react";
import { listClients } from "@/services/clients.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await listClients(q);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">Busque, cadastre e consulte clientes.</p>
        </div>
        <Button asChild variant="gold">
          <Link href="/clientes/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <form className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por nome ou telefone..."
          className="pl-9"
        />
      </form>

      <div className="space-y-3">
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum cliente encontrado.</p>
        ) : (
          clients.map((client) => (
            <Link key={client.id} href={`/clientes/${client.id}`}>
              <Card className="transition-colors hover:border-gold/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{client.full_name}</p>
                    {client.phone ? (
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" /> {client.phone}
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
