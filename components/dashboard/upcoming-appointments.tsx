import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";
import type { UpcomingAppointment } from "@/types";

export function UpcomingAppointments({ items }: { items: UpcomingAppointment[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Próximos agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum agendamento futuro.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{item.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.serviceName} · {item.barberName}
                </p>
              </div>
              <span className="text-sm font-medium text-gold">{formatTime(item.startsAt)}</span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
