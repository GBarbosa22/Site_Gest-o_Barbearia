import { getCurrentUserProfile } from "@/services/auth.service";
import { listBarbers, getBarberByUserId } from "@/services/barbers.service";
import { listClients } from "@/services/clients.service";
import { listServices } from "@/services/catalog.service";
import { getUsableSubscriptionsMap } from "@/services/subscriptions.service";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { createAttendanceAction } from "@/app/(dashboard)/atendimentos/actions";

export default async function NovoAtendimentoPage() {
  const user = await getCurrentUserProfile();
  const isAdmin = user?.role === "admin";

  const [clients, services, barbers, lockedBarber, usableSubscriptionsByClient] = await Promise.all([
    listClients(),
    listServices({ onlyActive: true }),
    isAdmin ? listBarbers({ onlyActive: true }) : Promise.resolve([]),
    !isAdmin && user ? getBarberByUserId(user.id) : Promise.resolve(null),
    getUsableSubscriptionsMap(),
  ]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo atendimento</h1>
        <p className="text-sm text-muted-foreground">Registre o que acabou de acontecer.</p>
      </div>
      <AppointmentForm
        action={createAttendanceAction}
        clients={clients}
        services={services}
        barbers={barbers}
        lockedBarber={lockedBarber}
        usableSubscriptionsByClient={usableSubscriptionsByClient}
      />
    </div>
  );
}
