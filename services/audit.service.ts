import { createClient } from "@/lib/supabase/server";
import type { AuditLogRow } from "@/types/database.types";

/**
 * Ações registradas no histórico de auditoria. Nunca apagado — só inserido.
 * Mantém um vocabulário fechado para os filtros da tela /auditoria fazerem
 * sentido (em vez de strings livres espalhadas pelo código).
 */
export type AuditAction =
  | "login"
  | "logout"
  | "cliente_criado"
  | "cliente_editado"
  | "barbeiro_criado"
  | "barbeiro_editado"
  | "barbeiro_desativado"
  | "servico_criado"
  | "servico_editado"
  | "servico_desativado"
  | "produto_criado"
  | "produto_editado"
  | "produto_desativado"
  | "estoque_ajustado"
  | "atendimento_registrado"
  | "atendimento_editado"
  | "atendimento_cancelado"
  | "pagamento_recebido"
  | "plano_vendido"
  | "plano_usado"
  | "plano_cancelado"
  | "venda_registrada"
  | "venda_paga"
  | "caixa_aberto"
  | "caixa_fechado"
  | "caixa_saida_registrada";

export type AuditEntity =
  | "user"
  | "client"
  | "barber"
  | "service"
  | "product"
  | "appointment"
  | "payment"
  | "subscription"
  | "sale"
  | "cash_register";

/**
 * Registra uma entrada no log de auditoria. Nunca lança erro para quem
 * chamou — uma falha ao logar não pode quebrar a ação principal do usuário.
 */
export async function logAudit(
  action: AuditAction,
  entity: AuditEntity,
  entityId?: string | null,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let actorName: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();
      actorName = profile?.full_name ?? null;
    }

    await supabase.from("audit_logs").insert({
      actor_id: user?.id ?? null,
      actor_name: actorName,
      action,
      entity,
      entity_id: entityId ?? null,
      details: details ?? null,
    });
  } catch {
    // Nunca deixa a auditoria quebrar a ação principal.
  }
}

export interface AuditLogFilters {
  entity?: AuditEntity;
  actorId?: string;
  limit?: number;
}

export async function listAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 100);

  if (filters.entity) query = query.eq("entity", filters.entity);
  if (filters.actorId) query = query.eq("actor_id", filters.actorId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}
