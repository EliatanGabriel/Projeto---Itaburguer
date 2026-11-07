-- Ita Burger — TRAVAR escrita (cole no SQL Editor e Run uma vez)
-- Leitura do cardápio pública; escrita só para usuário logado (Auth).
-- Pedidos: cliente (anon) só INSERE; dono (logado) lê/atualiza/exclui.

-- store_state: select público, insert/update só authenticated
drop policy if exists "store_state insert" on public.store_state;
drop policy if exists "store_state update" on public.store_state;
create policy "store_state insert"
  on public.store_state for insert
  to authenticated
  with check (true);
create policy "store_state update"
  on public.store_state for update
  to authenticated
  using (true)
  with check (true);

-- orders: insert público, select/update/delete só authenticated
drop policy if exists "orders select" on public.orders;
drop policy if exists "orders insert" on public.orders;
drop policy if exists "orders update" on public.orders;
drop policy if exists "orders delete" on public.orders;
create policy "orders select"
  on public.orders for select
  to authenticated
  using (true);
create policy "orders insert"
  on public.orders for insert
  to anon, authenticated
  with check (true);
create policy "orders update"
  on public.orders for update
  to authenticated
  using (true)
  with check (true);
create policy "orders delete"
  on public.orders for delete
  to authenticated
  using (true);

-- Admin: login só com senha (itaburger) via hash local (S.pw). Sem campo de e-mail.
