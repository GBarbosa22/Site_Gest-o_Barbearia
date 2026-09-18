import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUserProfile } from "@/services/auth.service";
import { listAppointmentsByDay } from "@/services/appointments.service";
import { listBarbers } from "@/services/barbers.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { DateNav } from "@/components/appointments/date-nav";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { formatTime, toISODateString } from "@/lib/utils";

export default async function AgendaPage({
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

  const appointments = await listAppointmentsByDay(date, barberFilter);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agenda</h1>
          <p className="text-sm text-muted-foreground">Agendamentos do dia.</p>
        </div>
        <Button asChild variant="gold">
          <Link href={`/agenda/novo?date=${date}`}>
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
        {appointments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum agendamento para este dia.
          </p>
        ) : (
          appointments.map((appt) => (
            <Link key={appt.id} href={`/agenda/${appt.id}?date=${date}`}>
              <Card className="transition-colors hover:border-gold/50">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="w-14 shrink-0 text-center">
                    <p className="text-sm font-semibold text-gold">{formatTime(appt.starts_at)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{appt.client_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {appt.service_name}
                      {isAdmin ? ` · ${appt.barber_name}` : ""}
                    </p>
                  </div>
                  <AppointmentStatusBadge status={appt.status} />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
