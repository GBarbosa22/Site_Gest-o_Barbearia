import { requireAdmin } from "@/services/auth.service";
import { listAuditLogs, type AuditEntity } from "@/services/audit.service";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
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
  plano_vendido: "Plano vendido",
  plano_usado: "Plano usado",
  plano_cancelado: "Plano cancelado",
  venda_registrada: "Venda registrada",
  venda_paga: "Venda paga",
  caixa_aberto: "Caixa aberto",
  caixa_fechado: "Caixa fechado",
  caixa_saida_registrada: "Saída de caixa registrada",
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

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string }>;
}) {
  await requireAdmin();
  const { entity } = await searchParams;

  const logs = await listAuditLogs({ entity: entity as AuditEntity | undefined });

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
          logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium">{ACTION_LABEL[log.action] ?? log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {ENTITY_LABEL[log.entity] ?? log.entity} · {log.actor_name ?? "Sistema"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(log.created_at)} {formatTime(log.created_at)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
