import { requireAdmin } from "@/services/auth.service";
import { BarberForm } from "@/components/barbers/barber-form";
import { createBarberAction } from "@/app/(dashboard)/barbeiros/actions";

export default async function NovoBarbeiroPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo barbeiro</h1>
        <p className="text-sm text-muted-foreground">Cadastre um novo profissional na equipe.</p>
      </div>
      <BarberForm action={createBarberAction} />
    </div>
  );
}
