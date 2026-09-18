import { requireAdmin } from "@/services/auth.service";
import { MovementForm } from "@/components/cash/movement-form";

export default async function NovaSaidaPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Nova saída</h1>
        <p className="text-sm text-muted-foreground">
          Despesa, compra ou sangria retirada do caixa.
        </p>
      </div>
      <MovementForm />
    </div>
  );
}
