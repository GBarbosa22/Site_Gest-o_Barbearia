import { notFound } from "next/navigation";
import { getClient } from "@/services/clients.service";
import { listBarbers } from "@/services/barbers.service";
import { ClientForm } from "@/components/clients/client-form";
import { updateClientAction } from "@/app/(dashboard)/clientes/actions";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const barbers = await listBarbers({ onlyActive: true });
  const action = updateClientAction.bind(null, client.id);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{client.full_name}</h1>
        <p className="text-sm text-muted-foreground">Editar dados do cliente.</p>
      </div>
      <ClientForm action={action} client={client} barbers={barbers} />
    </div>
  );
}
