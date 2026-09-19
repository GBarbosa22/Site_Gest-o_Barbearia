import Link from "next/link";
import { requireAdmin } from "@/services/auth.service";
import { listAuditLogs, type AuditEntity } from "@/services/audit.service";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime } from "@/lib/utils";

const ACTION_LABEL: Record<string, string> = {
  login: "Login",
  logout: "Logout",
  cliente_criado: "Cliente criado",
  cliente_editado: "Cliente editado",
  barbeiro_criado: "Barbeiro criado",
  barbeiro_editado: "Barbeiro editado",
  barbeiro_desativado: "Barbeiro desativado",
  servico_criado: "Serviço criado",
  servico_editado: "Serviço editado",
  servico_desativado: "Serviço desativado",
  produto_criado: "Produto criado",
  produto_editado: "Produto editado",
  produto_desativado: "Produto desativado",
  atendimento_registrado: "Atendimento registrado",
  atendimento_editado: "Atendimento editado",
  atendimento_cancelado: "Atendimento cancelado",
  pagamento_recebido: "Pagamento recebido",
  pagamento_editado: "Pagamento editado",
  plano_vendido: "Plano vendido",
  plano_usado: "Plano usado",
  plano_cancelado: "Plano cancelado",
  plano_status_sincronizado: "Status do plano atualizado automaticamente",
  venda_registrada: "Venda registrada",
  venda_paga: "Venda paga",
  caixa_aberto: "Caixa aberto",
  caixa_fechado: "Caixa fechado",
  caixa_entrada_registrada: "Entrada de caixa registrada",
  caixa_saida_registrada: "Saída de caixa registrada",
  caixa_entrada_automatica: "Entrada automática de caixa",
};

const ENTITY_LABEL: Record<string, string> = {
  user: "Usuário",
  client: "Cliente",
  barber: "Barbeiro",
  service: "Serviço",
  product: "Produto",
  appointment: "Atendimento",
  payment: "Pagamento",
  subscription: "Plano",
  sale: "Venda",
  cash_register: "Caixa",
};

function formatDetails(details: Record<string, unknown> | null): string | null {
  if (!details) return null;
  return Object.entries(details)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

const PAGE_SIZE = 50;

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string; page?: string }>;
}) {
  await requireAdmin();
  const { entity, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { logs, hasMore } = await listAuditLogs({
    entity: entity as AuditEntity | undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const entityQuery = entity ? `entity=${entity}&` : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Histórico completo de ações no sistema. Nada aqui é apagado.
        </p>
      </div>

      <form>
        <Select name="entity" defaultValue={entity ?? ""} className="max-w-xs">
          <option value="">Todas as áreas</option>
          {Object.entries(ENTITY_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </form>

      <div className="space-y-2">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum registro encontrado.</p>
        ) : (
          logs.map((log) => {
            const detailsText = formatDetails(log.details as Record<string, unknown> | null);
            return (
              <Card key={log.id}>
                <CardContent className="space-y-1 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{ACTION_LABEL[log.action] ?? log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)} {formatTime(log.created_at)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ENTITY_LABEL[log.entity] ?? log.entity} · {log.actor_name ?? "Sistema"}
                  </p>
                  {detailsText ? (
                    <p className="break-words text-xs text-muted-foreground/80">{detailsText}</p>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {currentPage > 1 || hasMore ? (
        <div className="flex items-center justify-between">
          {currentPage > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/auditoria?${entityQuery}page=${currentPage - 1}`}>Mais recentes</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Mais recentes
            </Button>
          )}
          <span className="text-xs text-muted-foreground">Página {currentPage}</span>
          {hasMore ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/auditoria?${entityQuery}page=${currentPage + 1}`}>Mais antigos</Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Mais antigos
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
