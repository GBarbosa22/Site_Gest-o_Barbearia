-- =============================================================================
-- Barbearia Gentlemen — Planos (assinatura de 4 cortes), data prevista de
-- recebimento em pagamentos pendentes, e remoção da comissão do barbeiro
-- =============================================================================

-- Comissão não é mais usada.
alter table public.barbers drop column if exists commission_percent;

-- "Vai pagar depois" agora carrega quando o dinheiro deve entrar.
alter table public.payments add column if not exists due_date date;

-- -----------------------------------------------------------------------------
-- SUBSCRIPTIONS (plano de 4 cortes)
-- -----------------------------------------------------------------------------
create type subscription_status as enum ('active', 'completed', 'expired', 'cancelled');

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  barber_id uuid references public.barbers(id) on delete set null,
  price numeric(10,2) not null check (price >= 0),
  total_credits integer not null default 4 check (total_credits > 0),
  purchased_at timestamptz not null default now(),
  status subscription_status not null default 'active',
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.subscriptions is
  'Plano de N cortes (hoje sempre 4), 1 crédito liberado por semana a partir de '
  'purchased_at. Crédito não usado na semana é perdido — não acumula.';

create index subscriptions_client_idx on public.subscriptions (client_id);
create index subscriptions_status_idx on public.subscriptions (status);

create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- SUBSCRIPTION_USES (cada corte consumido do plano)
-- -----------------------------------------------------------------------------
create table public.subscription_uses (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  week_number integer not null check (week_number > 0),
  appointment_id uuid references public.appointments(id) on delete set null,
  used_at timestamptz not null default now(),
  created_by uuid references public.users(id) on delete set null,
  unique (subscription_id, week_number)
);

comment on table public.subscription_uses is
  'Um crédito consumido do plano. unique(subscription_id, week_number) impede '
  'usar mais de 1 corte na mesma semana.';

create index subscription_uses_subscription_idx on public.subscription_uses (subscription_id);

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.subscriptions enable row level security;
alter table public.subscription_uses enable row level security;

create policy "subscriptions_select_authenticated" on public.subscriptions
  for select using (auth.role() = 'authenticated');
create policy "subscriptions_insert_authenticated" on public.subscriptions
  for insert with check (auth.role() = 'authenticated');
create policy "subscriptions_update_own_or_admin" on public.subscriptions
  for update using (
    public.current_user_role() = 'admin' or barber_id = public.current_barber_id()
  );
create policy "subscriptions_delete_admin_only" on public.subscriptions
  for delete using (public.current_user_role() = 'admin');

create policy "subscription_uses_select_authenticated" on public.subscription_uses
  for select using (auth.role() = 'authenticated');
create policy "subscription_uses_insert_authenticated" on public.subscription_uses
  for insert with check (auth.role() = 'authenticated');
create policy "subscription_uses_delete_admin_only" on public.subscription_uses
  for delete using (public.current_user_role() = 'admin');
