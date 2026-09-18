import { listBarbers } from "@/services/barbers.service";
import { ClientForm } from "@/components/clients/client-form";
import { createClientAction } from "@/app/(dashboard)/clientes/actions";

export default async function NovoClientePage() {
  const barbers = await listBarbers({ onlyActive: true });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo cliente</h1>
        <p className="text-sm text-muted-foreground">Cadastro rápido de cliente.</p>
      </div>
      <ClientForm action={createClientAction} barbers={barbers} />
    </div>
  );
}
