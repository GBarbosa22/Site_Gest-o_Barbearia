import { notFound } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { getProduct } from "@/services/products.service";
import { ProductForm } from "@/components/products/product-form";
import { DeactivateButton } from "@/components/barbers/deactivate-button";
import { updateProductAction, deactivateProductAction } from "@/app/(dashboard)/produtos/actions";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const action = updateProductAction.bind(null, product.id);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        <p className="text-sm text-muted-foreground">Editar produto do estoque.</p>
      </div>
      <ProductForm action={action} product={product} />
      {product.active ? (
        <DeactivateButton id={product.id} action={deactivateProductAction} label="Desativar produto" />
      ) : null}
    </div>
  );
}
