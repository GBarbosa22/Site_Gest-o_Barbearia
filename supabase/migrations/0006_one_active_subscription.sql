-- =============================================================================
-- Barbearia Gentlemen — Garante no máximo 1 plano ativo por cliente
-- =============================================================================

-- Trava no banco (além da checagem na aplicação) contra 2 planos ativos ao
-- mesmo tempo para o mesmo cliente — mesmo padrão do "1 caixa aberto por vez".
create unique index subscriptions_one_active_per_client
  on public.subscriptions (client_id)
  where (status = 'active');
