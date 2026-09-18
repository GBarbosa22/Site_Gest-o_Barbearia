import { notFound } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { getOpenRegister, listMovements } from "@/services/cash-register.service";
import { CloseRegisterForm } from "@/components/cash/close-register-form";
import { closeRegisterAction } from "@/app/(dashboard)/caixa/actions";
import { formatCurrency } from "@/lib/utils";

export default async function FecharCaixaPage() {
  await requireAdmin();
  const register = await getOpenRegister();
  if (!register) notFound();

  const movements = await listMovements(register.id);
  const totalEntradas = movements
    .filter((m) => m.type === "entrada")
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const totalSaidas = movements
    .filter((m) => m.type === "saida")
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const expectedBalance = Number(register.opening_balance) + totalEntradas - totalSaidas;

  const action = closeRegisterAction.bind(null, register.id);

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fechar caixa</h1>
        <p className="text-sm text-muted-foreground">
          Saldo esperado: <span className="font-semibold text-gold">{formatCurrency(expectedBalance)}</span>{" "}
          (abertura {formatCurrency(register.opening_balance)} + entradas {formatCurrency(totalEntradas)} -
          saídas {formatCurrency(totalSaidas)})
        </p>
      </div>
      <CloseRegisterForm action={action} expectedBalance={expectedBalance} />
    </div>
  );
}
