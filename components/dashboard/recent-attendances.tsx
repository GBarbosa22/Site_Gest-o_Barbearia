import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTime } from "@/lib/utils";
import type { RecentAttendance } from "@/types";

export function RecentAttendances({ items }: { items: RecentAttendance[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">
          Últimos atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum atendimento registrado hoje.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/atendimentos/${item.id}`}
              className="flex items-center justify-between rounded-md border border-border px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{item.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.serviceName} · {item.barberName} · {formatTime(item.startsAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gold">
                  {item.amount !== null ? formatCurrency(item.amount) : "-"}
                </p>
                {item.paid === false ? <Badge variant="destructive">Vai pagar</Badge> : null}
              </div>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
