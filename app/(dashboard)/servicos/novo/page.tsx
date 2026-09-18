import { requireAdmin } from "@/services/auth.service";
import { ServiceForm } from "@/components/services/service-form";
import { createServiceAction } from "@/app/(dashboard)/servicos/actions";

export default async function NovoServicoPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo serviço</h1>
        <p className="text-sm text-muted-foreground">Adicione um serviço ao catálogo.</p>
      </div>
      <ServiceForm action={createServiceAction} />
    </div>
  );
}
