import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUserProfile } from "@/services/auth.service";
import { listAttendancesByDay } from "@/services/appointments.service";
import { listBarbers } from "@/services/barbers.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DateNav } from "@/components/appointments/date-nav";
import { formatCurrency, formatTime, toISODateString } from "@/lib/utils";

export default async function AtendimentosPage({
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

  const attendances = await listAttendancesByDay(date, barberFilter);
  const totalDoDia = attendances.reduce(
    (sum, item) => sum + (item.payment ? Number(item.payment.amount) - Number(item.payment.discount) : 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Atendimentos</h1>
          <p className="text-sm text-muted-foreground">
            {attendances.length} atendimento{attendances.length === 1 ? "" : "s"} ·{" "}
            {formatCurrency(totalDoDia)}
          </p>
        </div>
        <Button asChild variant="gold">
          <Link href="/atendimentos/novo">
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </Button>
      </div>

      <DateNav date={date} barberId={barberFilter} />

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
        {attendances.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum atendimento registrado neste dia.
          </p>
        ) : (
          attendances.map((item) => (
            <Link key={item.id} href={`/atendimentos/${item.id}?date=${date}`}>
              <Card className="transition-colors hover:border-gold/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-xs text-muted-foreground">{formatTime(item.starts_at)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.service_name}
                      {isAdmin ? ` · ${item.barber_name}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {item.payment ? formatCurrency(Number(item.payment.amount) - Number(item.payment.discount)) : "-"}
                    </p>
                    {item.payment && !item.payment.paid ? (
                      <Badge variant="destructive">Vai pagar</Badge>
                    ) : item.payment ? (
                      <Badge variant="success">Pago</Badge>
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
