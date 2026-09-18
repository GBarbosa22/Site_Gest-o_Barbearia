import { listProducts } from "@/services/products.service";
import { ConsumptionForm } from "@/components/products/consumption-form";

export default async function ConsumoInternoPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const products = await listProducts({ onlyActive: true });

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Consumo interno</h1>
        <p className="text-sm text-muted-foreground">
          Registre um consumo avulso (ex.: uma lâmina a mais). Desconta do estoque na hora.
        </p>
      </div>
      {ok ? (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
          Consumo registrado.
        </p>
      ) : null}
      <ConsumptionForm products={products} />
    </div>
  );
}
