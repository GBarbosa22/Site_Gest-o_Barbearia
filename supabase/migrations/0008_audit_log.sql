-- =============================================================================
-- Barbearia Gentlemen — Auditoria (histórico completo, nunca apagado)
-- =============================================================================

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  actor_name text,
  action text not null,
  entity text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_logs is
  'Histórico completo de ações no sistema. Nunca é apagado nem editado — só inserido.';

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index audit_logs_entity_idx on public.audit_logs (entity, entity_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id);

alter table public.audit_logs enable row level security;

-- Qualquer usuário autenticado pode registrar uma entrada (a própria ação
-- dele), mas só admin pode ler o histórico. Ninguém pode editar ou apagar.
create policy "audit_logs_insert_authenticated" on public.audit_logs
  for insert with check (auth.role() = 'authenticated');
create policy "audit_logs_select_admin_only" on public.audit_logs
  for select using (public.current_user_role() = 'admin');
