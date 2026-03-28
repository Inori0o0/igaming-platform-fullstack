-- Phase 6 (stub): shop + admin readiness — superseded by applied migration:
--   docs/sql/phase-6-shop-orders-migration.sql
-- Full migration order: docs/sql/README.md
-- Keep this file for quick reference only, or delete once comfortable with the real migration.

-- Goals:
-- 1) Admin can create/update products and toggle listing state
-- 2) Product can be forced sold out from admin
-- 3) Inventory is tracked for all products; admin can increase/decrease stock
-- 4) Avatar products: each SKU can only be purchased once per account

-- Suggested enums (optional; text + check is also fine):
-- create type public.shop_product_category as enum ('apparel', 'digital', 'collectible');
-- create type public.shop_product_type as enum ('normal', 'avatar');

-- 1) Products
-- create table if not exists public.products (
--   id uuid primary key default gen_random_uuid(),
--   slug text not null unique,
--   name text not null,
--   description text not null default '',
--   category text not null check (category in ('apparel', 'digital', 'collectible')),
--   product_type text not null default 'normal' check (product_type in ('normal', 'avatar')),
--   price_vac numeric(18, 2) not null check (price_vac >= 0),
--   image_url text not null,
--   is_active boolean not null default true,        -- listed/unlisted
--   force_sold_out boolean not null default false,  -- admin manual sold-out
--   track_inventory boolean not null default true,  -- keep for flexibility; default tracked
--   stock_quantity integer not null default 0,      -- admin-managed stock
--   sort_order integer not null default 0,
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now(),
--   constraint products_stock_non_negative check (stock_quantity >= 0)
-- );

-- 2) Orders (minimal shape)
-- create table if not exists public.orders (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references public.users(id),
--   status text not null default 'created' check (status in ('created', 'paid', 'cancelled', 'refunded')),
--   total_vac numeric(18, 2) not null check (total_vac >= 0),
--   created_at timestamptz not null default now(),
--   updated_at timestamptz not null default now()
-- );

-- create table if not exists public.order_items (
--   id uuid primary key default gen_random_uuid(),
--   order_id uuid not null references public.orders(id) on delete cascade,
--   product_id uuid not null references public.products(id),
--   quantity integer not null check (quantity > 0),
--   unit_price_vac numeric(18, 2) not null check (unit_price_vac >= 0),
--   line_total_vac numeric(18, 2) not null check (line_total_vac >= 0)
-- );

-- 3) User entitlements for digital ownership
-- create table if not exists public.user_entitlements (
--   id uuid primary key default gen_random_uuid(),
--   user_id uuid not null references public.users(id) on delete cascade,
--   product_id uuid not null references public.products(id) on delete restrict,
--   entitlement_type text not null check (entitlement_type in ('avatar', 'digital_item')),
--   granted_at timestamptz not null default now(),
--   unique (user_id, product_id)
-- );

-- IMPORTANT:
-- The unique (user_id, product_id) above means:
-- "Each avatar SKU can only be purchased once per account."
-- This supports releasing new avatar SKUs continuously; users can buy new SKUs,
-- but cannot repurchase the same SKU.

-- 4) Helpful indexes
-- create index if not exists idx_products_active_sort
--   on public.products (is_active, sort_order, created_at desc);
-- create index if not exists idx_orders_user_created
--   on public.orders (user_id, created_at desc);
-- create index if not exists idx_entitlements_user
--   on public.user_entitlements (user_id, granted_at desc);

-- 5) RLS guidance (example)
-- products: read for all front users; write by admin/service role
-- orders/order_items: users read own rows; writes via server function/service
-- user_entitlements: users read own rows; writes via checkout service

