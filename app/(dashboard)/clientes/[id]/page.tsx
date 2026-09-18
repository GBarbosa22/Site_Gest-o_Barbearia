import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Phone, MessageCircle, Cake } from "lucide-react";
import { getClient } from "@/services/clients.service";
import { listAppointmentsByClient } from "@/services/appointments.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { formatDate, formatTime } from "@/lib/utils";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const history = await listAppointmentsByClient(client.id);
  const whatsappNumber = (client.whatsapp || client.phone || "").replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{client.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            Cliente desde {formatDate(client.created_at)}
          </p>
        </div>
        <Button asChild variant="outline" size="icon">
          <Link href={`/clientes/${client.id}/editar`} aria-label="Editar cliente">
            <Pencil className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {client.phone ? (
          <a
            href={`tel:${client.phone}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"
          >
            <Phone className="h-3.5 w-3.5" /> {client.phone}
          </a>
        ) : null}
        {whatsappNumber ? (
          <a
            href={`https://wa.me/55${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 px-3 py-1.5 text-sm text-emerald-600 dark:text-emerald-400"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        ) : null}
        {client.birth_date ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground">
            <Cake className="h-3.5 w-3.5" /> {formatDate(client.birth_date)}
          </span>
        ) : null}
      </div>

      {client.notes ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">{client.notes}</CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Histórico</h2>
        <div className="space-y-2">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum atendimento registrado ainda.</p>
          ) : (
            history.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{item.service_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.starts_at)} às {formatTime(item.starts_at)} ·{" "}
                      {item.barber_name}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={item.status} />
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
