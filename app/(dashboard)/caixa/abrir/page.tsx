import { requireAdmin } from "@/services/auth.service";
import { OpenRegisterForm } from "@/components/cash/open-register-form";

export default async function AbrirCaixaPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Abrir caixa</h1>
        <p className="text-sm text-muted-foreground">Informe o valor em dinheiro na gaveta agora.</p>
      </div>
      <OpenRegisterForm />
    </div>
  );
}
