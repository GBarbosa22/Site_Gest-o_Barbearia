import { requireAdmin } from "@/services/auth.service";
import { ProductForm } from "@/components/products/product-form";
import { createProductAction } from "@/app/(dashboard)/produtos/actions";

export default async function NovoProdutoPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo produto</h1>
        <p className="text-sm text-muted-foreground">Cadastre um item do estoque.</p>
      </div>
      <ProductForm action={createProductAction} />
    </div>
  );
}
