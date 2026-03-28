-- Phase 6: Shop — products, variants (per-size stock), orders, entitlements, avatar equip
-- Prerequisites:
--   - docs/sql/phase-0-schema-bootstrap.sql (or existing legacy products/orders tables)
--   - docs/sql/phase-3-wallet-vac-migration.sql (users, wallets, transactions, touch_updated_at)
-- Optional: docs/sql/phase-5-slots-wallet-rounds-migration.sql (transactions.metadata, etc.)
--
-- Apply in Supabase SQL Editor (single run; safe to re-run where noted).
--
-- Compatible with the older bootstrap that already created public.products / orders / order_items
-- (e.g. products with price + image_url but no slug): this script ALTERs missing columns in place;
-- CREATE TABLE IF NOT EXISTS alone does not upgrade existing tables.
--
-- Design notes (aligned with client-portal mock):
-- - products.id = uuid PK; slug = stable URL id (e.g. vacant-tee)
-- - Images: bucket `shop-products`, column image_object_path = object key (e.g. vacant_tee.png)
-- - Inventory model B: product_variants one row per size; unsized products = one row with size IS NULL
-- - Avatar purchase: insert user_entitlements (entitlement_type = 'avatar'); profile center lists these
--   and user_avatar_selection stores which equipped avatar product (must be owned via entitlement)
-- - Checkout should insert transactions.type = 'purchase' with metadata.order_id (add enum value below)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 0) transaction_type: purchase (shop checkout debit)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'transaction_type'
      and e.enumlabel = 'purchase'
  ) then
    alter type transaction_type add value 'purchase';
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 1) Storage bucket: shop-products (public read). OK if you already created in UI.
-- ---------------------------------------------------------------------------
-- Minimal columns (compatible across Supabase versions). Tweak limits in Dashboard if needed.
insert into storage.buckets (id, name, public)
values ('shop-products', 'shop-products', true)
on conflict (id) do update set public = excluded.public;

-- Public read for catalog images (writes stay restricted)
drop policy if exists "shop_products_public_read" on storage.objects;
create policy "shop_products_public_read"
on storage.objects
for select
to public
using (bucket_id = 'shop-products');

-- Upload: use Dashboard or service role. Client uploads need separate policies.

-- ---------------------------------------------------------------------------
-- 2) products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  category text not null check (category in ('apparel', 'digital', 'collectible')),
  fulfillment_type text not null check (fulfillment_type in ('physical', 'digital')),
  is_avatar boolean not null default false,
  image_bucket text not null default 'shop-products',
  image_object_path text not null,
  price_vac numeric(18, 2) not null check (price_vac >= 0),
  is_active boolean not null default true,
  force_sold_out boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_avatar_digital_check check (
    (is_avatar = false) or (fulfillment_type = 'digital' and category = 'digital')
  )
);

-- If public.products already existed (bootstrap script: name, price, image_url, stock…),
-- CREATE TABLE IF NOT EXISTS is skipped — add every Phase-6 column here.
alter table public.products add column if not exists slug text;
alter table public.products add column if not exists description text default '';
alter table public.products add column if not exists category text;
alter table public.products add column if not exists fulfillment_type text;
alter table public.products add column if not exists is_avatar boolean default false;
alter table public.products add column if not exists image_bucket text default 'shop-products';
alter table public.products add column if not exists image_object_path text;
alter table public.products add column if not exists price_vac numeric(18, 2);
-- Legacy bootstrap uses `price`; keep it in sync with price_vac for seeds / old code.
alter table public.products add column if not exists price numeric(18, 2);
alter table public.products add column if not exists is_active boolean default true;
alter table public.products add column if not exists force_sold_out boolean default false;
alter table public.products add column if not exists sort_order integer not null default 0;
alter table public.products add column if not exists created_at timestamptz default now();
alter table public.products add column if not exists updated_at timestamptz default now();

-- Stable URL key; legacy rows may have null until seed/backfill.
create unique index if not exists ux_products_slug
  on public.products (slug)
  where slug is not null;

update public.products
set price_vac = price
where price_vac is null and price is not null;

update public.products
set price = price_vac
where price is null and price_vac is not null;

create index if not exists idx_products_active_sort
  on public.products (is_active, sort_order, created_at desc);

drop trigger if exists trg_products_touch_updated_at on public.products;
create trigger trg_products_touch_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 3) product_variants (per-size stock; one NULL-size row for unsized SKUs)
-- ---------------------------------------------------------------------------
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_size_allowed check (
    size is null or size in ('XS', 'S', 'M', 'L', 'XL')
  )
);

-- Exactly one "default" variant per product (no size)
create unique index if not exists ux_product_variants_one_null_size
  on public.product_variants (product_id)
  where size is null;

-- At most one row per (product, size) when size is set
create unique index if not exists ux_product_variants_product_size
  on public.product_variants (product_id, size)
  where size is not null;

create index if not exists idx_product_variants_product_id
  on public.product_variants (product_id);

drop trigger if exists trg_product_variants_touch_updated_at on public.product_variants;
create trigger trg_product_variants_touch_updated_at
before update on public.product_variants
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 4) orders + order_items
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'paid' check (status in ('created', 'paid', 'cancelled', 'refunded')),
  fulfillment_type text not null check (fulfillment_type in ('physical', 'digital')),
  subtotal_vac numeric(18, 2) not null default 0 check (subtotal_vac >= 0),
  shipping_fee_vac numeric(18, 2) not null default 0 check (shipping_fee_vac >= 0),
  discount_vac numeric(18, 2) not null default 0 check (discount_vac >= 0),
  total_vac numeric(18, 2) not null check (total_vac >= 0),
  coupon_code text,
  shipping_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Legacy bootstrap orders: total_amount, order_status enum, shipping_info — table already exists, so expand in place.
alter table public.orders add column if not exists fulfillment_type text;
alter table public.orders add column if not exists subtotal_vac numeric(18, 2);
alter table public.orders add column if not exists shipping_fee_vac numeric(18, 2) default 0;
alter table public.orders add column if not exists discount_vac numeric(18, 2) default 0;
alter table public.orders add column if not exists total_vac numeric(18, 2);
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists shipping_snapshot jsonb;
alter table public.orders add column if not exists updated_at timestamptz default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'total_amount'
  ) then
    update public.orders o
    set total_vac = o.total_amount
    where o.total_vac is null and o.total_amount is not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'orders' and column_name = 'shipping_info'
  ) then
    update public.orders o
    set shipping_snapshot = o.shipping_info
    where o.shipping_snapshot is null and o.shipping_info is not null;
  end if;
end
$$;

create index if not exists idx_orders_user_created
  on public.orders (user_id, created_at desc);

drop trigger if exists trg_orders_touch_updated_at on public.orders;
create trigger trg_orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_vac numeric(18, 2) not null check (unit_price_vac >= 0),
  line_total_vac numeric(18, 2) not null check (line_total_vac >= 0),
  size_snapshot text,
  created_at timestamptz not null default now()
);

-- Legacy order_items: product_id, quantity, price_at_purchase — add shop columns (variant_id nullable until backfill).
alter table public.order_items add column if not exists variant_id uuid;
alter table public.order_items add column if not exists unit_price_vac numeric(18, 2);
alter table public.order_items add column if not exists line_total_vac numeric(18, 2);
alter table public.order_items add column if not exists size_snapshot text;
alter table public.order_items add column if not exists created_at timestamptz default now();

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'order_items' and column_name = 'price_at_purchase'
  ) then
    update public.order_items i
    set unit_price_vac = i.price_at_purchase
    where i.unit_price_vac is null and i.price_at_purchase is not null;

    update public.order_items i
    set line_total_vac = i.price_at_purchase * i.quantity
    where i.line_total_vac is null and i.price_at_purchase is not null;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'order_items_variant_id_fkey'
  ) then
    alter table public.order_items
      add constraint order_items_variant_id_fkey
      foreign key (variant_id) references public.product_variants(id) on delete restrict;
  end if;
end
$$;

create index if not exists idx_order_items_order_id on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- 5) user_entitlements (avatar / digital ownership; unique per user+product)
-- ---------------------------------------------------------------------------
create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  entitlement_type text not null check (entitlement_type in ('avatar', 'digital_item')),
  source_order_id uuid references public.orders(id) on delete set null,
  granted_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_user_entitlements_user
  on public.user_entitlements (user_id, granted_at desc);

-- ---------------------------------------------------------------------------
-- 6) user_avatar_selection — which purchased avatar is shown in profile (Phase 6 UI)
--     Ownership is still enforced via user_entitlements + application logic (or trigger below).
-- ---------------------------------------------------------------------------
create table if not exists public.user_avatar_selection (
  user_id uuid primary key references public.users(id) on delete cascade,
  avatar_product_id uuid references public.products(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Must be is_avatar product AND owned (user_entitlements). Profile center reads this row + entitlements list.
create or replace function public.enforce_user_avatar_selection()
returns trigger as $$
begin
  if new.avatar_product_id is null then
    return new;
  end if;
  if not exists (
    select 1 from public.products p
    where p.id = new.avatar_product_id and p.is_avatar = true
  ) then
    raise exception 'avatar_product_id must reference a product with is_avatar = true';
  end if;
  if not exists (
    select 1 from public.user_entitlements e
    where e.user_id = new.user_id
      and e.product_id = new.avatar_product_id
      and e.entitlement_type = 'avatar'
  ) then
    raise exception 'Avatar product not owned by user (missing user_entitlements)';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_user_avatar_selection_rules on public.user_avatar_selection;
create trigger trg_user_avatar_selection_rules
before insert or update on public.user_avatar_selection
for each row execute function public.enforce_user_avatar_selection();

drop trigger if exists trg_user_avatar_selection_touch on public.user_avatar_selection;
create trigger trg_user_avatar_selection_touch
before update on public.user_avatar_selection
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 7) RLS (read-heavy; writes expect service role / future RPC)
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.user_avatar_selection enable row level security;

drop policy if exists products_select_active on public.products;
create policy products_select_active on public.products
for select
to anon, authenticated
using (is_active = true);

drop policy if exists product_variants_select_visible on public.product_variants;
create policy product_variants_select_visible on public.product_variants
for select
to anon, authenticated
using (
  exists (
    select 1 from public.products p
    where p.id = product_variants.product_id and p.is_active = true
  )
);

drop policy if exists orders_select_own on public.orders;
create policy orders_select_own on public.orders
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = orders.user_id and u.auth_user_id = auth.uid()
  )
);

drop policy if exists order_items_select_own on public.order_items;
create policy order_items_select_own on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders o
    join public.users u on u.id = o.user_id
    where o.id = order_items.order_id and u.auth_user_id = auth.uid()
  )
);

drop policy if exists user_entitlements_select_own on public.user_entitlements;
create policy user_entitlements_select_own on public.user_entitlements
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = user_entitlements.user_id and u.auth_user_id = auth.uid()
  )
);

drop policy if exists user_avatar_selection_select_own on public.user_avatar_selection;
create policy user_avatar_selection_select_own on public.user_avatar_selection
for select
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = user_avatar_selection.user_id and u.auth_user_id = auth.uid()
  )
);

drop policy if exists user_avatar_selection_upsert_own on public.user_avatar_selection;
create policy user_avatar_selection_upsert_own on public.user_avatar_selection
for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.id = user_avatar_selection.user_id and u.auth_user_id = auth.uid()
  )
);

drop policy if exists user_avatar_selection_update_own on public.user_avatar_selection;
create policy user_avatar_selection_update_own on public.user_avatar_selection
for update
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = user_avatar_selection.user_id and u.auth_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.id = user_avatar_selection.user_id and u.auth_user_id = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- 8) Seed (idempotent): matches client-portal/src/shop/products.ts
--     Fixed UUIDs so variants can reference products in raw SQL.
--     Image keys = filenames you uploaded to bucket shop-products
-- ---------------------------------------------------------------------------

-- Include legacy `price` when present so NOT NULL bootstrap columns stay satisfied.
insert into public.products (
  id, slug, name, description, category, fulfillment_type, is_avatar,
  image_object_path, price_vac, price, sort_order, is_active, image_bucket, force_sold_out
)
values
  ('11111111-1111-4111-8111-111111110001', 'vacant-tee', 'vAcAnt 黑色短T', '黑色短T搭配白色滴墨 vAcAnt Logo，日常百搭的入門款。', 'apparel', 'physical', false, 'vacant_tee.png', 2900, 2900, 10, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110002', 'vacant-hoodie', 'vAcAnt 黑色連帽上衣', '黑色連帽上衣，正面大面積滴墨 Logo，秋冬主力單品。', 'apparel', 'physical', false, 'vacant_hoodie.png', 5900, 5900, 20, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110003', 'vacant-shorts', 'vAcAnt 黑色短褲', '輕量黑色短褲，正面大字 Logo 設計，適合休閒與運動穿搭。', 'apparel', 'physical', false, 'vacant_shorts.png', 3200, 3200, 30, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110004', 'vacant-beanie', 'vAcAnt 黑色毛帽', '黑色針織毛帽，正面立體 Logo 布章，冬季穿搭必備。', 'apparel', 'physical', false, 'vacant_beanie.png', 2200, 2200, 40, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110005', 'vacant-tote-bag', 'vAcAnt 黑色托特包', '黑色帆布托特包，搭配滴墨 Logo 刺繡，通勤與日常外出皆適用。', 'apparel', 'physical', false, 'vacant_tote_bag.png', 2600, 2600, 50, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110006', 'triplet-golden-avatar-skin', 'Tung Tung Tung Sahur 黃金造型頭像', '金色 Tung Tung Tung Sahur 造型頭像主題，適用於個人頁與社群展示。', 'digital', 'digital', true, 'triplet_golden_avatar.png', 69999, 69999, 60, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110007', 'triplet-diamond-avatar-skin', 'Tung Tung Tung Sahur 鑽石造型頭像', '鑽石稜鏡質感 Tung Tung Tung Sahur 造型，主打高亮反射與收藏稀有感。', 'digital', 'digital', true, 'triplet_diamond_avatar.png', 99999, 99999, 70, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110008', 'triplet-devil-avatar-skin', 'Tung Tung Tung Sahur 惡魔造型頭像', '火焰地獄主題 Tung Tung Tung Sahur 角色造型，紅黑配色視覺衝擊強烈。', 'digital', 'digital', true, 'triplet_devil_avatar.png', 699999, 699999, 80, true, 'shop-products', false),
  ('11111111-1111-4111-8111-111111110009', 'triplet-god-avatar-skin', 'Tung Tung Tung Sahur 神聖造型頭像', '聖光與羽翼風格 Tung Tung Tung Sahur 造型，適合高階帳號展示。', 'digital', 'digital', true, 'triplet_god_avatar.png', 999999, 999999, 90, true, 'shop-products', false),
  ('11111111-1111-4111-8111-11111111000a', 'triplet-golden-statue', 'Tung Tung Tung 9999純金雕像', '實體風格金色 Tung Tung Tung Sahur 收藏雕像，附底座與限量序號感設定。', 'collectible', 'physical', false, 'triplet_golden_statue.png', 6777777, 6777777, 100, true, 'shop-products', false)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  fulfillment_type = excluded.fulfillment_type,
  is_avatar = excluded.is_avatar,
  image_object_path = excluded.image_object_path,
  price_vac = excluded.price_vac,
  price = excluded.price,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  image_bucket = excluded.image_bucket,
  force_sold_out = excluded.force_sold_out,
  updated_at = now();

-- Variants: per-size for tee / shorts / beanie (20000 each size); single null-size for others
insert into public.product_variants (product_id, size, stock_quantity)
select p.id, v.size::text, 20000
from public.products p
cross join (values ('XS'), ('S'), ('M'), ('L'), ('XL')) as v(size)
where p.slug in ('vacant-tee', 'vacant-shorts', 'vacant-beanie')
  and not exists (
    select 1 from public.product_variants x
    where x.product_id = p.id and x.size = v.size::text
  );

insert into public.product_variants (product_id, size, stock_quantity)
select p.id, null, 100000
from public.products p
where p.slug in ('vacant-hoodie', 'vacant-tote-bag', 'triplet-golden-avatar-skin', 'triplet-diamond-avatar-skin', 'triplet-devil-avatar-skin', 'triplet-god-avatar-skin', 'triplet-golden-statue')
  and not exists (select 1 from public.product_variants x where x.product_id = p.id);
