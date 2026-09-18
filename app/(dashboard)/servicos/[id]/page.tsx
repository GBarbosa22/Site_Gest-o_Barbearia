import { notFound } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { getService } from "@/services/catalog.service";
import { listProducts, getServiceProducts } from "@/services/products.service";
import { ServiceForm } from "@/components/services/service-form";
import { ServiceRecipeEditor } from "@/components/products/service-recipe-editor";
import { DeactivateButton } from "@/components/barbers/deactivate-button";
import { updateServiceAction, deactivateServiceAction } from "@/app/(dashboard)/servicos/actions";
import { saveServiceRecipeAction } from "@/app/(dashboard)/produtos/actions";

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
  const recipeAction = saveServiceRecipeAction.bind(null, service.id);

  const [products, recipe] = await Promise.all([
    listProducts({ onlyActive: true }),
    getServiceProducts(service.id),
  ]);

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

      <div className="space-y-3 border-t border-border pt-6">
        <div>
          <h2 className="text-sm font-semibold">Produtos usados neste serviço</h2>
          <p className="text-xs text-muted-foreground">
            Ex.: Pigmentação consome 1 sachê de tinta. Descontado do estoque automaticamente a cada
            atendimento.
          </p>
        </div>
        <ServiceRecipeEditor action={recipeAction} products={products} initialItems={recipe} />
      </div>
    </div>
  );
}
