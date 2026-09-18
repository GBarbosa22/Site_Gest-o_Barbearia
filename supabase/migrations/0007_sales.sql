-- =============================================================================
-- Barbearia Gentlemen — Venda de produtos
-- =============================================================================

-- Categoria própria pro caixa (senão venda de produto ficaria mal rotulada
-- como "corte" nas entradas automáticas).
alter type cash_movement_category add value if not exists 'venda';

-- -----------------------------------------------------------------------------
-- SALES / SALE_ITEMS
-- -----------------------------------------------------------------------------
create table public.sales (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete restrict,
  barber_id uuid not null references public.barbers(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  discount numeric(10,2) not null default 0 check (discount >= 0),
  method payment_method,
  paid boolean not null default true,
  due_date date,
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_method_matches_paid check (
    (paid and method is not null) or (not paid and method is null)
  )
);

comment on table public.sales is 'Venda de produtos (durante ou depois de um atendimento, ou avulsa).';

create index sales_client_idx on public.sales (client_id);
create index sales_barber_idx on public.sales (barber_id);
create index sales_created_at_idx on public.sales (created_at);

create trigger trg_sales_updated_at before update on public.sales
  for each row execute procedure public.set_updated_at();

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity numeric(10,3) not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  subtotal numeric(10,2) not null check (subtotal >= 0)
);

create index sale_items_sale_idx on public.sale_items (sale_id);

-- -----------------------------------------------------------------------------
-- STOCK_MOVEMENTS e CASH_MOVEMENTS ganham vínculo opcional com a venda.
-- -----------------------------------------------------------------------------
alter table public.stock_movements add column if not exists related_sale_id uuid references public.sales(id) on delete set null;
alter table public.cash_movements add column if not exists sale_id uuid references public.sales(id) on delete set null;

-- -----------------------------------------------------------------------------
-- Desconta estoque + registra o movimento (tipo 'venda') numa única operação,
-- mesmo padrão de consume_product_stock — security definer porque o barbeiro
-- não tem UPDATE direto em products.
-- -----------------------------------------------------------------------------
create function public.sell_product_stock(
  p_product_id uuid,
  p_quantity numeric,
  p_sale_id uuid
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.products
  set quantity_on_hand = quantity_on_hand - p_quantity
  where id = p_product_id;

  insert into public.stock_movements (product_id, type, quantity, related_sale_id, created_by)
  values (p_product_id, 'venda', p_quantity, p_sale_id, auth.uid());
end;
$$;

grant execute on function public.sell_product_stock(uuid, numeric, uuid) to authenticated;

-- Amplia a policy que deixa o barbeiro lançar a própria entrada automática no
-- caixa (antes só 'corte'/'plano') para incluir 'venda' de produto.
drop policy if exists "cash_movements_insert_barber_auto_entry" on public.cash_movements;
create policy "cash_movements_insert_barber_auto_entry" on public.cash_movements
  for insert with check (
    public.current_user_role() = 'barber'
    and type = 'entrada'
    and category in ('corte', 'plano', 'venda')
    and cash_register_id = public.get_open_cash_register_id()
  );

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

create policy "sales_select_own_or_admin" on public.sales
  for select using (
    public.current_user_role() = 'admin' or barber_id = public.current_barber_id()
  );
create policy "sales_insert_own_or_admin" on public.sales
  for insert with check (
    public.current_user_role() = 'admin' or barber_id = public.current_barber_id()
  );
create policy "sales_update_own_or_admin" on public.sales
  for update using (
    public.current_user_role() = 'admin' or barber_id = public.current_barber_id()
  );
create policy "sales_delete_admin_only" on public.sales
  for delete using (public.current_user_role() = 'admin');

create policy "sale_items_select_authenticated" on public.sale_items
  for select using (auth.role() = 'authenticated');
create policy "sale_items_insert_authenticated" on public.sale_items
  for insert with check (auth.role() = 'authenticated');
create policy "sale_items_delete_admin_only" on public.sale_items
  for delete using (public.current_user_role() = 'admin');
