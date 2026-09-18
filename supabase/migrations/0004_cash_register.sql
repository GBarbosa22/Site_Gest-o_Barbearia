-- =============================================================================
-- Barbearia Gentlemen — Caixa (abertura, movimentações, fechamento)
-- =============================================================================

-- O plano também é uma forma de pagamento no momento da venda (o cliente paga
-- os R$100 na hora, mesmo usando os cortes ao longo de 4 semanas).
alter table public.subscriptions add column if not exists payment_method payment_method;

create type cash_register_status as enum ('open', 'closed');
create type cash_movement_type as enum ('entrada', 'saida');
create type cash_movement_category as enum ('corte', 'plano', 'despesa', 'compra', 'sangria', 'ajuste', 'outro');

-- -----------------------------------------------------------------------------
-- CASH_REGISTERS
-- -----------------------------------------------------------------------------
create table public.cash_registers (
  id uuid primary key default gen_random_uuid(),
  opened_at timestamptz not null default now(),
  opened_by uuid references public.users(id) on delete set null,
  opening_balance numeric(10,2) not null default 0 check (opening_balance >= 0),
  status cash_register_status not null default 'open',
  closed_at timestamptz,
  closed_by uuid references public.users(id) on delete set null,
  expected_balance numeric(10,2),
  informed_balance numeric(10,2),
  difference numeric(10,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cash_registers is
  'Um registro por período de caixa aberto. Fechamentos nunca são apagados.';

-- Garante que só existe 1 caixa aberto por vez.
create unique index cash_registers_single_open on public.cash_registers (status) where (status = 'open');

create trigger trg_cash_registers_updated_at before update on public.cash_registers
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- CASH_MOVEMENTS
-- -----------------------------------------------------------------------------
create table public.cash_movements (
  id uuid primary key default gen_random_uuid(),
  cash_register_id uuid not null references public.cash_registers(id) on delete restrict,
  type cash_movement_type not null,
  category cash_movement_category not null,
  amount numeric(10,2) not null check (amount >= 0),
  description text,
  payment_id uuid references public.payments(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

comment on table public.cash_movements is
  'Entradas (corte/plano pagos em dinheiro, lançadas automaticamente) e saídas '
  '(despesa/compra/sangria, lançadas manualmente). Nunca apagadas.';

create index cash_movements_register_idx on public.cash_movements (cash_register_id);
create index cash_movements_created_at_idx on public.cash_movements (created_at);

-- Permite que um barbeiro (sem acesso de leitura à tabela) saiba apenas QUAL é
-- o caixa aberto agora, sem expor saldo/histórico — usado para lançar a
-- entrada automática do próprio atendimento/plano pago em dinheiro.
create function public.get_open_cash_register_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.cash_registers where status = 'open' limit 1;
$$;

grant execute on function public.get_open_cash_register_id() to authenticated;

-- -----------------------------------------------------------------------------
-- RLS — abrir/fechar caixa e ver o financeiro é exclusivo do administrador;
-- o barbeiro só pode lançar a entrada automática de um pagamento em dinheiro
-- que ele mesmo registrou (nunca saídas, nunca histórico).
-- -----------------------------------------------------------------------------
alter table public.cash_registers enable row level security;
alter table public.cash_movements enable row level security;

create policy "cash_registers_admin_only" on public.cash_registers
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "cash_movements_select_admin" on public.cash_movements
  for select using (public.current_user_role() = 'admin');

create policy "cash_movements_insert_admin" on public.cash_movements
  for insert with check (public.current_user_role() = 'admin');

create policy "cash_movements_insert_barber_auto_entry" on public.cash_movements
  for insert with check (
    public.current_user_role() = 'barber'
    and type = 'entrada'
    and category in ('corte', 'plano')
    and cash_register_id = public.get_open_cash_register_id()
  );

create policy "cash_movements_update_admin" on public.cash_movements
  for update using (public.current_user_role() = 'admin');

create policy "cash_movements_delete_admin" on public.cash_movements
  for delete using (public.current_user_role() = 'admin');
