import { notFound } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { getBarber } from "@/services/barbers.service";
import { BarberForm } from "@/components/barbers/barber-form";
import { DeactivateButton } from "@/components/barbers/deactivate-button";
import { updateBarberAction, deactivateBarberAction } from "@/app/(dashboard)/barbeiros/actions";

export default async function EditarBarbeiroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const barber = await getBarber(id);

  if (!barber) notFound();

  const action = updateBarberAction.bind(null, barber.id);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{barber.full_name}</h1>
        <p className="text-sm text-muted-foreground">Editar dados do barbeiro.</p>
      </div>
      <BarberForm action={action} barber={barber} />
      {barber.active ? (
        <DeactivateButton
          id={barber.id}
          action={deactivateBarberAction}
          label="Desativar barbeiro"
        />
      ) : null}
    </div>
  );
}
