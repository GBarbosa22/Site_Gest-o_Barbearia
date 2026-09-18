import { notFound } from "next/navigation";
import { requireAdmin } from "@/services/auth.service";
import { getRegister, listMovements } from "@/services/cash-register.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/financeiro/print-button";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  corte: "Corte",
  plano: "Plano",
  venda: "Venda de produto",
  despesa: "Despesa",
  compra: "Compra",
  sangria: "Sangria",
  ajuste: "Ajuste",
  outro: "Outro",
};

export default async function CaixaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const register = await getRegister(id);
  if (!register) notFound();

  const movements = await listMovements(id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Caixa de {formatDate(register.opened_at)}
          </h1>
          <p className="text-sm text-muted-foreground">
            Aberto às {formatTime(register.opened_at)}
            {register.closed_at ? ` · fechado às ${formatTime(register.closed_at)}` : ""}
          </p>
        </div>
        <Badge variant={register.status === "open" ? "gold" : "default"}>
          {register.status === "open" ? "Aberto" : "Fechado"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Abertura</p>
            <p className="text-sm font-semibold">{formatCurrency(register.opening_balance)}</p>
          </CardContent>
        </Card>
        {register.status === "closed" ? (
          <>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Esperado</p>
                <p className="text-sm font-semibold">
                  {register.expected_balance !== null ? formatCurrency(register.expected_balance) : "-"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Informado</p>
                <p className="text-sm font-semibold">
                  {register.informed_balance !== null ? formatCurrency(register.informed_balance) : "-"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Diferença</p>
                <p
                  className={`text-sm font-semibold ${
                    register.difference && register.difference < 0
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {register.difference !== null ? formatCurrency(register.difference) : "-"}
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {register.notes ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">{register.notes}</CardContent>
        </Card>
      ) : null}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Movimentações</h2>
        <div className="space-y-2">
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma movimentação registrada.</p>
          ) : (
            movements.map((mov) => (
              <Card key={mov.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{CATEGORY_LABEL[mov.category]}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(mov.created_at)}
                      {mov.description ? ` · ${mov.description}` : ""}
                      {mov.created_by_name ? ` · ${mov.created_by_name}` : ""}
                    </p>
                  </div>
                  <p
                    className={
                      mov.type === "entrada"
                        ? "text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                        : "text-sm font-semibold text-destructive"
                    }
                  >
                    {mov.type === "entrada" ? "+" : "-"}
                    {formatCurrency(mov.amount)}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {register.status === "closed" ? (
        <div className="print:hidden">
          <PrintButton />
        </div>
      ) : null}
    </div>
  );
}
