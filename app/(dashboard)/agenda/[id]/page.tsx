import { notFound } from "next/navigation";
import { getCurrentUserProfile } from "@/services/auth.service";
import { getAppointment } from "@/services/appointments.service";
import { listBarbers, getBarberByUserId } from "@/services/barbers.service";
import { listClients } from "@/services/clients.service";
import { listServices } from "@/services/catalog.service";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { AppointmentStatusBadge } from "@/components/appointments/status-badge";
import { CancelAppointmentButton } from "@/components/appointments/cancel-appointment-button";
import { updateAppointmentAction } from "@/app/(dashboard)/agenda/actions";
import { toISODateString } from "@/lib/utils";

export default async function AgendamentoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date: dateParam } = await searchParams;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  const user = await getCurrentUserProfile();
  const isAdmin = user?.role === "admin";
  const date = dateParam ?? toISODateString(new Date(appointment.starts_at));

  const editable = appointment.status === "scheduled";

  const [clients, services, barbers, lockedBarber] = await Promise.all([
    listClients(),
    listServices({ onlyActive: true }),
    isAdmin ? listBarbers({ onlyActive: true }) : Promise.resolve([]),
    !isAdmin && user ? getBarberByUserId(user.id) : Promise.resolve(null),
  ]);

  const action = updateAppointmentAction.bind(null, appointment.id);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{appointment.client_name}</h1>
          <p className="text-sm text-muted-foreground">
            {appointment.service_name} · {appointment.barber_name}
          </p>
        </div>
        <AppointmentStatusBadge status={appointment.status} />
      </div>

      {editable ? (
        <>
          <AppointmentForm
            action={action}
            clients={clients}
            services={services}
            barbers={barbers}
            lockedBarber={lockedBarber}
            appointment={appointment}
          />
          <CancelAppointmentButton id={appointment.id} date={date} />
        </>
      ) : (
        <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Este agendamento não pode mais ser editado ({appointment.status === "completed" ? "já foi finalizado" : "já foi encerrado"}).
        </p>
      )}
    </div>
  );
}
