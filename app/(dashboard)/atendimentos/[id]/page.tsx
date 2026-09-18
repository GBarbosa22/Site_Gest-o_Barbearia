import { notFound } from "next/navigation";
import { getCurrentUserProfile } from "@/services/auth.service";
import { getAttendance } from "@/services/appointments.service";
import { listBarbers, getBarberByUserId } from "@/services/barbers.service";
import { listClients } from "@/services/clients.service";
import { listServices } from "@/services/catalog.service";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { CancelAttendanceButton } from "@/components/appointments/cancel-appointment-button";
import { MarkPaidForm } from "@/components/appointments/mark-paid-form";
import { updateAttendanceAction } from "@/app/(dashboard)/atendimentos/actions";
import { toISODateString } from "@/lib/utils";

export default async function AtendimentoDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params;
  const { date: dateParam } = await searchParams;
  const attendance = await getAttendance(id);
  if (!attendance) notFound();

  const user = await getCurrentUserProfile();
  const isAdmin = user?.role === "admin";
  const date = dateParam ?? toISODateString(new Date(attendance.starts_at));
  const cancelled = attendance.status === "cancelled";

  const [clients, services, barbers, lockedBarber] = await Promise.all([
    listClients(),
    listServices({ onlyActive: true }),
    isAdmin ? listBarbers({ onlyActive: true }) : Promise.resolve([]),
    !isAdmin && user ? getBarberByUserId(user.id) : Promise.resolve(null),
  ]);

  const action = updateAttendanceAction.bind(null, attendance.id, date);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{attendance.client_name}</h1>
        <p className="text-sm text-muted-foreground">
          {attendance.service_name} · {attendance.barber_name}
        </p>
      </div>

      {cancelled ? (
        <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          Este atendimento foi cancelado.
        </p>
      ) : (
        <>
          {attendance.payment && !attendance.payment.paid ? (
            <MarkPaidForm id={attendance.id} date={date} />
          ) : null}

          <AppointmentForm
            action={action}
            clients={clients}
            services={services}
            barbers={barbers}
            lockedBarber={lockedBarber}
            attendance={attendance}
          />
          <CancelAttendanceButton id={attendance.id} date={date} />
        </>
      )}
    </div>
  );
}
