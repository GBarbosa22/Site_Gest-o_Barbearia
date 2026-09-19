-- =============================================================================
-- Barbearia Gentlemen — Restringe leitura de payments/sale_items por barbeiro
-- =============================================================================
-- appointments e sales já eram restritos por barbeiro (só o dono do
-- atendimento/venda ou admin enxerga), mas payments e sale_items (as tabelas
-- de detalhe financeiro) ficaram com select liberado pra qualquer autenticado
-- — um barbeiro conseguia ler valor/forma de pagamento de TODO o negócio via
-- API direta, mesmo sem conseguir ler o appointment/sale correspondente.

drop policy if exists "payments_select_authenticated" on public.payments;
create policy "payments_select_own_or_admin" on public.payments
  for select using (
    public.current_user_role() = 'admin' or exists (
      select 1 from public.appointments a
      where a.id = payments.appointment_id and a.barber_id = public.current_barber_id()
    )
  );

drop policy if exists "sale_items_select_authenticated" on public.sale_items;
create policy "sale_items_select_own_or_admin" on public.sale_items
  for select using (
    public.current_user_role() = 'admin' or exists (
      select 1 from public.sales s
      where s.id = sale_items.sale_id and s.barber_id = public.current_barber_id()
    )
  );
