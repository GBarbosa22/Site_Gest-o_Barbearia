-- =============================================================================
-- Barbearia Gentlemen — Garante no máximo 1 plano ativo por cliente
-- =============================================================================

-- Antes de travar a regra, limpa dados que já ficaram inconsistentes (esse é
-- justamente o bug que este índice existe pra prevenir daqui pra frente):
-- mantém como 'active' só o plano comprado mais recentemente por cliente e
-- cancela os demais duplicados.
with ranked as (
  select id, client_id,
         row_number() over (
           partition by client_id
           order by purchased_at desc, created_at desc
         ) as rn
  from public.subscriptions
  where status = 'active'
)
update public.subscriptions s
set status = 'cancelled'
from ranked r
where s.id = r.id and r.rn > 1;

-- Trava no banco (além da checagem na aplicação) contra 2 planos ativos ao
-- mesmo tempo para o mesmo cliente — mesmo padrão do "1 caixa aberto por vez".
create unique index subscriptions_one_active_per_client
  on public.subscriptions (client_id)
  where (status = 'active');
