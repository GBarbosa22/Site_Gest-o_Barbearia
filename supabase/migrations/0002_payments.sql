-- =============================================================================
-- Barbearia Gentlemen — Pagamentos e ajuste de agenda -> registro de atendimento
-- =============================================================================

-- O produto mudou de "agendar horário futuro" (a barbearia já usa outro app
-- para isso) para "registrar o que acabou de acontecer" (cliente, serviço,
-- pagamento). Nesse uso, vários atendimentos são lançados em sequência rápida
-- pelo mesmo barbeiro, e o intervalo start/end é só informativo — a exclusão
-- de conflito de horário (pensada para impedir duplo agendamento futuro) passa
-- a gerar falso-positivo e precisa sair.
alter table public.appointments drop constraint if exists appointments_no_overlap;

-- -----------------------------------------------------------------------------
-- PAYMENTS
-- -----------------------------------------------------------------------------
create type payment_method as enum ('pix', 'dinheiro', 'credito', 'debito');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete restrict,
  amount numeric(10,2) not null check (amount >= 0),
  discount numeric(10,2) not null default 0 check (discount >= 0),
  method payment_method,
  paid boolean not null default true,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- pago sempre tem forma de pagamento; pendente ("vai pagar depois") ainda não tem.
  constraint payments_method_matches_paid check (
    (paid and method is not null) or (not paid and method is null)
  )
);

comment on table public.payments is 'Pagamento de um atendimento. paid=false + method=null representa "vai pagar depois".';

create index payments_appointment_idx on public.payments (appointment_id);
create index payments_created_at_idx on public.payments (created_at);

create trigger trg_payments_updated_at before update on public.payments
  for each row execute procedure public.set_updated_at();

alter table public.payments enable row level security;

create policy "payments_select_authenticated" on public.payments
  for select using (auth.role() = 'authenticated');
create policy "payments_insert_authenticated" on public.payments
  for insert with check (auth.role() = 'authenticated');
create policy "payments_update_own_or_admin" on public.payments
  for update using (
    public.current_user_role() = 'admin' or exists (
      select 1 from public.appointments a
      where a.id = payments.appointment_id and a.barber_id = public.current_barber_id()
    )
  );
create policy "payments_delete_admin_only" on public.payments
  for delete using (public.current_user_role() = 'admin');
