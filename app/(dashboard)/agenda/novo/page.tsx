import { getCurrentUserProfile } from "@/services/auth.service";
import { listBarbers, getBarberByUserId } from "@/services/barbers.service";
import { listClients } from "@/services/clients.service";
import { listServices } from "@/services/catalog.service";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { createAppointmentAction } from "@/app/(dashboard)/agenda/actions";

export default async function NovoAgendamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const user = await getCurrentUserProfile();
  const isAdmin = user?.role === "admin";

  const [clients, services, barbers, lockedBarber] = await Promise.all([
    listClients(),
    listServices({ onlyActive: true }),
    isAdmin ? listBarbers({ onlyActive: true }) : Promise.resolve([]),
    !isAdmin && user ? getBarberByUserId(user.id) : Promise.resolve(null),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo agendamento</h1>
        <p className="text-sm text-muted-foreground">Preencha os dados do atendimento.</p>
      </div>
      <AppointmentForm
        action={createAppointmentAction}
        clients={clients}
        services={services}
        barbers={barbers}
        lockedBarber={lockedBarber}
        defaultDate={date}
      />
    </div>
  );
}
