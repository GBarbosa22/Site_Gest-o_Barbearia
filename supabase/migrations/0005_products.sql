-- =============================================================================
-- Barbearia Gentlemen — Produtos/estoque e "receita" de produtos por serviço
-- =============================================================================

create type stock_movement_type as enum ('compra', 'venda', 'consumo', 'ajuste', 'perda');

-- -----------------------------------------------------------------------------
-- PRODUCTS
-- -----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  unit text not null default 'un',
  cost numeric(10,2) not null default 0 check (cost >= 0),
  price numeric(10,2) not null default 0 check (price >= 0),
  quantity_on_hand numeric(10,3) not null default 0,
  min_quantity numeric(10,3) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_active_idx on public.products (active);

create trigger trg_products_updated_at before update on public.products
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- SERVICE_PRODUCTS — "receita" de um serviço: quais produtos e quanto de cada
-- um ele consome (ex.: Pigmentação = 1 sachê de tinta).
-- -----------------------------------------------------------------------------
create table public.service_products (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(10,3) not null check (quantity > 0),
  unique (service_id, product_id)
);

create index service_products_service_idx on public.service_products (service_id);

-- -----------------------------------------------------------------------------
-- STOCK_MOVEMENTS — histórico completo, nunca apagado.
-- -----------------------------------------------------------------------------
create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  type stock_movement_type not null,
  quantity numeric(10,3) not null check (quantity > 0),
  related_appointment_id uuid references public.appointments(id) on delete set null,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index stock_movements_product_idx on public.stock_movements (product_id);
create index stock_movements_created_at_idx on public.stock_movements (created_at);

-- -----------------------------------------------------------------------------
-- Consumo automático: desconta do estoque e registra o movimento numa única
-- operação seguindo a "receita" do serviço. security definer porque o
-- barbeiro que registra o atendimento não tem permissão de UPDATE direta em
-- products (só admin gerencia estoque manualmente).
-- -----------------------------------------------------------------------------
create function public.consume_product_stock(
  p_product_id uuid,
  p_quantity numeric,
  p_appointment_id uuid
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.products
  set quantity_on_hand = quantity_on_hand - p_quantity
  where id = p_product_id;

  insert into public.stock_movements (product_id, type, quantity, related_appointment_id, created_by)
  values (p_product_id, 'consumo', p_quantity, p_appointment_id, auth.uid());
end;
$$;

grant execute on function public.consume_product_stock(uuid, numeric, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.service_products enable row level security;
alter table public.stock_movements enable row level security;

create policy "products_select_authenticated" on public.products
  for select using (auth.role() = 'authenticated');
create policy "products_admin_write" on public.products
  for insert with check (public.current_user_role() = 'admin');
create policy "products_admin_update" on public.products
  for update using (public.current_user_role() = 'admin');
create policy "products_admin_delete" on public.products
  for delete using (public.current_user_role() = 'admin');

create policy "service_products_select_authenticated" on public.service_products
  for select using (auth.role() = 'authenticated');
create policy "service_products_admin_write" on public.service_products
  for all using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "stock_movements_select_admin" on public.stock_movements
  for select using (public.current_user_role() = 'admin');
create policy "stock_movements_admin_insert" on public.stock_movements
  for insert with check (public.current_user_role() = 'admin');
