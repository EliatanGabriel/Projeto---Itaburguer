-- Ita Burger — pedidos (cole no SQL Editor; rode UMA vez, mesmo se já rodou schema.sql)
-- TRAVADO: cliente (anon) só INSERE; dono (authenticated) lê/atualiza/exclui.

create table if not exists public.orders (
  id text primary key,
  t bigint not null,
  sig text default '',
  name text default '',
  mode text default '',
  hood text default '',
  items jsonb not null default '[]'::jsonb,
  sub numeric default 0,
  fee numeric default 0,
  total numeric default 0,
  pay text default '',
  st text default 'todo',
  created_at timestamptz not null default now()
);

create index if not exists orders_t_idx on public.orders (t desc);
create index if not exists orders_sig_idx on public.orders (sig);

alter table public.orders enable row level security;

drop policy if exists "orders select" on public.orders;
create policy "orders select" on public.orders for select to authenticated using (true);

drop policy if exists "orders insert" on public.orders;
create policy "orders insert" on public.orders for insert to anon, authenticated with check (true);

drop policy if exists "orders update" on public.orders;
create policy "orders update" on public.orders for update to authenticated using (true) with check (true);

drop policy if exists "orders delete" on public.orders;
create policy "orders delete" on public.orders for delete to authenticated using (true);
