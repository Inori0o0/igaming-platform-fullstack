-- Phase 0: Initial schema bootstrap (greenfield Supabase project)
--
-- Creates core tables used before wallet / slots / shop migrations: enums, users, wallets,
-- transactions, game_history, achievements, legacy-shaped products & orders, wishlists, coupons,
-- and the auth.users → public.users sync trigger.
--
-- Suggested order for a new database: docs/sql/README.md
--   1) This file (phase-0-schema-bootstrap.sql)
--   2) docs/sql/phase-3-wallet-vac-migration.sql
--   3) docs/sql/phase-5-slots-wallet-rounds-migration.sql  (optional, if you use slots settlement)
--   4) docs/sql/phase-6-shop-orders-migration.sql
--   5a) docs/sql/phase-6-shop-coupons-enum-free-shipping.sql
--   5b) docs/sql/phase-6-shop-coupons-fulfillment-migration.sql
--
-- Safe to re-run: uses IF NOT EXISTS / guarded constraints where practical.
-- Shop note: public.products here is the older minimal shape; phase-6 ALTERs and seeds extend it.

create extension if not exists "pgcrypto";

-- === ENUM types ===

do $$
begin
  if not exists (select 1 from pg_type where typname = 'transaction_type') then
    create type transaction_type as enum ('deposit', 'withdraw', 'bet', 'win', 'purchase');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type order_status as enum ('pending', 'paid', 'shipped', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'coupon_discount_type') then
    create type coupon_discount_type as enum ('percentage', 'fixed');
  end if;
end
$$;

-- === 1) users ===

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique,
  display_name text,
  avatar_url text,
  is_guest boolean default false,
  created_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'users_auth_user_id_fkey'
  ) then
    alter table public.users
      add constraint users_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id)
      on delete cascade
      deferrable initially deferred;
  end if;
end
$$;

-- === 2) wallets ===

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  coin_balance numeric(18, 2) default 0,
  btc_balance numeric(18, 8) default 0,
  eth_balance numeric(18, 8) default 0,
  updated_at timestamptz default now()
);

create index if not exists idx_wallets_user_id on public.wallets(user_id);

-- === 3) transactions ===

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type transaction_type not null,
  currency text not null,
  amount numeric(18, 8) not null,
  description text,
  created_at timestamptz default now()
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_type on public.transactions(type);

-- === 4) game_history ===

create table if not exists public.game_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  game_type text not null,
  bet_amount numeric(18, 8) default 0,
  win_amount numeric(18, 8) default 0,
  result jsonb,
  played_at timestamptz default now()
);

create index if not exists idx_game_history_user_id on public.game_history(user_id);
create index if not exists idx_game_history_game_type on public.game_history(game_type);

-- === 5) achievements ===

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  achievement_type text not null,
  unlocked_at timestamptz default now()
);

create index if not exists idx_achievements_user_id on public.achievements(user_id);
create index if not exists idx_achievements_type on public.achievements(achievement_type);

-- === 6) products (legacy minimal shape; phase-6 extends with slug, variants, etc.) ===

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(18, 2) not null,
  category text,
  image_url text,
  stock integer,
  is_active boolean default true
);

create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_is_active on public.products(is_active);

-- === 7) orders ===

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  total_amount numeric(18, 2) not null,
  status order_status default 'pending',
  shipping_info jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

-- === 8) order_items ===

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  quantity integer not null default 1,
  price_at_purchase numeric(18, 2) not null
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);

-- === 9) wishlists ===

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlists_user_id on public.wishlists(user_id);
create index if not exists idx_wishlists_product_id on public.wishlists(product_id);

-- === 10) coupons ===
-- 後台列表／軟刪／審計欄位見 docs/sql/phase-6-shop-coupons-fulfillment-migration.sql

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type coupon_discount_type not null,
  discount_value numeric(18, 2) not null,
  min_purchase numeric(18, 2) default 0,
  expires_at timestamptz,
  is_active boolean default true
);

create index if not exists idx_coupons_is_active on public.coupons(is_active);
create index if not exists idx_coupons_expires_at on public.coupons(expires_at);

-- === Sync: auth.users -> public.users ===

create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (auth_user_id, email, created_at, is_guest)
  values (new.id, new.email, now(), false)
  on conflict (auth_user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
