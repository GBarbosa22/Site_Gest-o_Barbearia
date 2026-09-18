import Link from "next/link";
import { Plus, Lock } from "lucide-react";
import { requireAdmin } from "@/services/auth.service";
import { getOpenRegister, listMovements, listRegisters } from "@/services/cash-register.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default async function CaixaPage() {
  await requireAdmin();
  const openRegister = await getOpenRegister();

  if (!openRegister) {
    const history = await listRegisters();
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Caixa</h1>
            <p className="text-sm text-muted-foreground">Nenhum caixa aberto no momento.</p>
          </div>
          <Button asChild variant="gold">
            <Link href="/caixa/abrir">
              <Plus className="h-4 w-4" />
              Abrir caixa
            </Link>
          </Button>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Histórico</h2>
          <div className="space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum caixa registrado ainda.</p>
            ) : (
              history.map((reg) => (
                <Link key={reg.id} href={`/caixa/${reg.id}`}>
                  <Card className="transition-colors hover:border-gold/50">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium">{formatDate(reg.opened_at)}</p>
                        <p className="text-xs text-muted-foreground">
                          Abertura: {formatCurrency(reg.opening_balance)}
                        </p>
                      </div>
                      {reg.status === "closed" ? (
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {reg.difference !== null ? formatCurrency(reg.difference) : "-"}
                          </p>
                          <p className="text-[10px] text-muted-foreground">diferença</p>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const movements = await listMovements(openRegister.id);
  const totalEntradas = movements
    .filter((m) => m.type === "entrada")
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const totalSaidas = movements
    .filter((m) => m.type === "saida")
    .reduce((sum, m) => sum + Number(m.amount), 0);
  const saldoAtual = Number(openRegister.opening_balance) + totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Caixa</h1>
          <p className="text-sm text-muted-foreground">
            Aberto em {formatDate(openRegister.opened_at)} às {formatTime(openRegister.opened_at)}
          </p>
        </div>
        <Badge variant="gold">Aberto</Badge>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo atual</p>
            <p className="text-lg font-semibold text-gold">{formatCurrency(saldoAtual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Entradas</p>
            <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalEntradas)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saídas</p>
            <p className="text-lg font-semibold text-destructive">{formatCurrency(totalSaidas)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button asChild variant="outline">
          <Link href="/caixa/nova-saida">
            <Plus className="h-4 w-4" />
            Nova saída
          </Link>
        </Button>
        <Button asChild variant="gold">
          <Link href="/caixa/fechar">
            <Lock className="h-4 w-4" />
            Fechar caixa
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Movimentações</h2>
        <div className="space-y-2">
          {movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>
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
    </div>
  );
}
