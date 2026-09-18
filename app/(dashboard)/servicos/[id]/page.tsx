import { notFound } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { getService } from "@/services/catalog.service";
import { ServiceForm } from "@/components/services/service-form";
import { DeactivateButton } from "@/components/barbers/deactivate-button";
import { updateServiceAction, deactivateServiceAction } from "@/app/(dashboard)/servicos/actions";

export default async function EditarServicoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const service = await getService(id);

  if (!service) notFound();

  const action = updateServiceAction.bind(null, service.id);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{service.name}</h1>
        <p className="text-sm text-muted-foreground">Editar serviço do catálogo.</p>
      </div>
      <ServiceForm action={action} service={service} />
      {service.active ? (
        <DeactivateButton id={service.id} action={deactivateServiceAction} label="Desativar serviço" />
      ) : null}
    </div>
  );
}
