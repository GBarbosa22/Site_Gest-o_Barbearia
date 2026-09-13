-- =============================================================================
-- Barbearia Gentlemen — Migração inicial
-- Fase 1: usuários/roles, barbeiros, clientes, serviços, agenda
-- (subscriptions, produtos, caixa, vendas e auditoria entram nas migrações
--  0002+ das próximas fases, mas as tabelas já são referenciadas onde fizer
--  sentido para as FKs ficarem corretas desde o início)
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
create type user_role as enum ('admin', 'barber');
create type appointment_status as enum (
  'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
);

-- -----------------------------------------------------------------------------
-- USERS (espelha auth.users; carrega o role usado pelas políticas de RLS)
-- -----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'barber',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.users is 'Perfil e role de cada usuário autenticado (admin ou barbeiro).';

-- Cria automaticamente uma linha em public.users quando um novo auth.users é criado.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'barber')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- BARBERS
-- -----------------------------------------------------------------------------
create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  full_name text not null,
  phone text,
  photo_url text,
  commission_percent numeric(5,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.barbers is 'Cadastro de barbeiros. user_id liga ao login (public.users) quando o barbeiro tem acesso ao sistema.';

-- -----------------------------------------------------------------------------
-- CLIENTS
-- -----------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  whatsapp text,
  birth_date date,
  notes text,
  preferred_barber_id uuid references public.barbers(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create extension if not exists pg_trgm;

create index clients_full_name_idx on public.clients using gin (full_name gin_trgm_ops);
create index clients_phone_idx on public.clients (phone);
create index clients_birth_date_idx on public.clients (birth_date);

-- -----------------------------------------------------------------------------
-- SERVICES
-- -----------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(10,2) not null check (price >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- APPOINTMENTS (agenda)
-- -----------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  barber_id uuid not null references public.barbers(id) on delete restrict,
  service_id uuid not null references public.services(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status appointment_status not null default 'scheduled',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_time_valid check (ends_at > starts_at)
);

create index appointments_barber_time_idx on public.appointments (barber_id, starts_at);
create index appointments_client_idx on public.appointments (client_id);
create index appointments_status_idx on public.appointments (status);

create extension if not exists btree_gist;

-- Impede conflito de horário para o mesmo barbeiro (exclui agendamentos cancelados/no-show).
alter table public.appointments add constraint appointments_no_overlap
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at) with &&
  )
  where (status not in ('cancelled', 'no_show'));

-- updated_at automático em todas as tabelas com essa coluna
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();
create trigger trg_barbers_updated_at before update on public.barbers
  for each row execute procedure public.set_updated_at();
create trigger trg_clients_updated_at before update on public.clients
  for each row execute procedure public.set_updated_at();
create trigger trg_services_updated_at before update on public.services
  for each row execute procedure public.set_updated_at();
create trigger trg_appointments_updated_at before update on public.appointments
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- HELPER: role do usuário logado (evita repetir subquery em toda policy)
-- -----------------------------------------------------------------------------
create function public.current_user_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create function public.current_barber_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.barbers where user_id = auth.uid();
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.barbers enable row level security;
alter table public.clients enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;

-- USERS: cada um vê o próprio perfil; admin vê e gerencia todos.
create policy "users_select_self_or_admin" on public.users
  for select using (id = auth.uid() or public.current_user_role() = 'admin');
create policy "users_admin_manage" on public.users
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

-- BARBERS: leitura liberada para qualquer usuário autenticado (agenda, seleção
-- de barbeiro em vendas, etc.); escrita só para admin.
create policy "barbers_select_authenticated" on public.barbers
  for select using (auth.role() = 'authenticated');
create policy "barbers_admin_write" on public.barbers
  for insert with check (public.current_user_role() = 'admin');
create policy "barbers_admin_update" on public.barbers
  for update using (public.current_user_role() = 'admin');
create policy "barbers_admin_delete" on public.barbers
  for delete using (public.current_user_role() = 'admin');

-- CLIENTS: admin vê tudo; barbeiro pode ver/cadastrar/editar (cadastro rápido
-- e consulta fazem parte do fluxo de atendimento dele).
create policy "clients_select_authenticated" on public.clients
  for select using (auth.role() = 'authenticated');
create policy "clients_insert_authenticated" on public.clients
  for insert with check (auth.role() = 'authenticated');
create policy "clients_update_authenticated" on public.clients
  for update using (auth.role() = 'authenticated');
create policy "clients_delete_admin_only" on public.clients
  for delete using (public.current_user_role() = 'admin');

-- SERVICES: leitura liberada; só admin cria/edita/desativa.
create policy "services_select_authenticated" on public.services
  for select using (auth.role() = 'authenticated');
create policy "services_admin_write" on public.services
  for insert with check (public.current_user_role() = 'admin');
create policy "services_admin_update" on public.services
  for update using (public.current_user_role() = 'admin');
create policy "services_admin_delete" on public.services
  for delete using (public.current_user_role() = 'admin');

-- APPOINTMENTS: admin vê/gerencia tudo; barbeiro vê e gerencia só a própria agenda.
create policy "appointments_select_own_or_admin" on public.appointments
  for select using (
    public.current_user_role() = 'admin' or barber_id = public.current_barber_id()
  );
create policy "appointments_insert_own_or_admin" on public.appointments
  for insert with check (
    public.current_user_role() = 'admin' or barber_id = public.current_barber_id()
  );
create policy "appointments_update_own_or_admin" on public.appointments
  for update using (
    public.current_user_role() = 'admin' or barber_id = public.current_barber_id()
  );
create policy "appointments_delete_admin_only" on public.appointments
  for delete using (public.current_user_role() = 'admin');
