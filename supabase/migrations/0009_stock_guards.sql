-- =============================================================================
-- Barbearia Gentlemen — Impede estoque negativo
-- =============================================================================
-- consume_product_stock() e sell_product_stock() descontavam o estoque sem
-- checar se havia saldo suficiente, permitindo quantity_on_hand ficar
-- negativo. Agora ambas levantam exceção (e a app propaga isso como erro
-- para quem tentou registrar o atendimento/venda) quando não há estoque.

create or replace function public.consume_product_stock(
  p_product_id uuid,
  p_quantity numeric,
  p_appointment_id uuid
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_available numeric;
  v_name text;
begin
  select quantity_on_hand, name into v_available, v_name
  from public.products
  where id = p_product_id
  for update;

  if v_available is null then
    raise exception 'Produto não encontrado.';
  end if;

  if v_available < p_quantity then
    raise exception 'Estoque insuficiente de "%": disponível %, solicitado %.', v_name, v_available, p_quantity;
  end if;

  update public.products
  set quantity_on_hand = quantity_on_hand - p_quantity
  where id = p_product_id;

  insert into public.stock_movements (product_id, type, quantity, related_appointment_id, created_by)
  values (p_product_id, 'consumo', p_quantity, p_appointment_id, auth.uid());
end;
$$;

create or replace function public.sell_product_stock(
  p_product_id uuid,
  p_quantity numeric,
  p_sale_id uuid
)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_available numeric;
  v_name text;
begin
  select quantity_on_hand, name into v_available, v_name
  from public.products
  where id = p_product_id
  for update;

  if v_available is null then
    raise exception 'Produto não encontrado.';
  end if;

  if v_available < p_quantity then
    raise exception 'Estoque insuficiente de "%": disponível %, solicitado %.', v_name, v_available, p_quantity;
  end if;

  update public.products
  set quantity_on_hand = quantity_on_hand - p_quantity
  where id = p_product_id;

  insert into public.stock_movements (product_id, type, quantity, related_sale_id, created_by)
  values (p_product_id, 'venda', p_quantity, p_sale_id, auth.uid());
end;
$$;

-- Cinto e suspensório: mesmo se algum caminho no futuro escrever direto na
-- tabela sem passar pelas funções acima, o banco nunca aceita ficar negativo.
alter table public.products add constraint products_quantity_non_negative
  check (quantity_on_hand >= 0);
