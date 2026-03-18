create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('pending','processing','paid','shipped','delivered','cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('payment-link');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.generate_ticket_code()
returns text
language plpgsql
set search_path = public
as $$
begin
  return 'TKT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
end;
$$;

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  image text,
  path text not null unique,
  coming_soon boolean not null default false,
  base_price numeric(12,2) not null default 0 check (base_price >= 0),
  source text not null default 'admin' check (source in ('default','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  wallet_address text not null,
  item_name text not null,
  collection_name text not null,
  size text,
  color text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total numeric(12,2) not null check (total >= 0),
  image text,
  payment_method public.payment_method not null default 'payment-link',
  status public.order_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  delivery_full_name text not null,
  delivery_email text not null,
  delivery_phone text not null,
  delivery_address text not null,
  delivery_city text not null,
  delivery_state text not null,
  delivery_postal_code text not null,
  delivery_country text not null
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text not null unique default public.generate_ticket_code(),
  name text not null,
  email text not null,
  message text not null,
  wallet_address text,
  status text not null default 'open' check (status in ('open','in_progress','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete set null,
  name text not null,
  description text,
  image text,
  price numeric(12,2) not null check (price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.users_profile (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  wallet_address text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_collections_source on public.collections(source);
create index if not exists idx_orders_wallet_address on public.orders(wallet_address);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_support_tickets_created_at on public.support_tickets(created_at desc);

drop trigger if exists trg_collections_updated_at on public.collections;
create trigger trg_collections_updated_at
before update on public.collections
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_support_tickets_updated_at on public.support_tickets;
create trigger trg_support_tickets_updated_at
before update on public.support_tickets
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

drop trigger if exists trg_users_profile_updated_at on public.users_profile;
create trigger trg_users_profile_updated_at
before update on public.users_profile
for each row execute procedure public.set_updated_at();

alter table public.collections enable row level security;
alter table public.orders enable row level security;
alter table public.support_tickets enable row level security;
alter table public.products enable row level security;
alter table public.users_profile enable row level security;

drop policy if exists collections_public_read on public.collections;
create policy collections_public_read
on public.collections
for select
using (true);

drop policy if exists products_public_read on public.products;
create policy products_public_read
on public.products
for select
using (true);

drop policy if exists orders_public_read on public.orders;
create policy orders_public_read
on public.orders
for select
to anon, authenticated
using (true);

drop policy if exists orders_public_insert on public.orders;
create policy orders_public_insert
on public.orders
for insert
to anon, authenticated
with check (
  wallet_address is not null
  and length(trim(wallet_address)) >= 8
  and item_name is not null
  and length(trim(item_name)) > 0
  and collection_name is not null
  and length(trim(collection_name)) > 0
  and color is not null
  and length(trim(color)) > 0
  and quantity > 0
  and unit_price >= 0
  and total >= 0
  and delivery_full_name is not null
  and delivery_email is not null
  and delivery_phone is not null
  and delivery_address is not null
  and delivery_city is not null
  and delivery_state is not null
  and delivery_postal_code is not null
  and delivery_country is not null
);

drop policy if exists support_tickets_public_insert on public.support_tickets;
create policy support_tickets_public_insert
on public.support_tickets
for insert
to anon, authenticated
with check (
  name is not null
  and length(trim(name)) > 0
  and email is not null
  and length(trim(email)) > 0
  and position('@' in email) > 1
  and message is not null
  and length(trim(message)) > 0
  and (wallet_address is null or length(trim(wallet_address)) >= 8)
  and status in ('open', 'in_progress', 'closed')
);

insert into public.collections (slug, name, description, image, path, coming_soon, base_price, source)
values
  ('hate', 'Hate Collection', 'Limited edition drops engineered for bold identities and unapologetic self-expression', '/hate.png', '/collections/hate', false, 22.00, 'default'),
  ('manga', 'Manga Collection', 'Anime-inspired graphics and vibrant colors. Launching soon.', '/locomotive_logo.png', '/collections/manga', true, 54.99, 'default')
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  image = excluded.image,
  path = excluded.path,
  coming_soon = excluded.coming_soon,
  base_price = excluded.base_price,
  source = excluded.source,
  updated_at = now();