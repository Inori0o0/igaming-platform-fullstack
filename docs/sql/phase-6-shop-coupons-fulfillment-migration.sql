-- Phase 6b: Shop coupons — fulfillment scope + free shipping type + admin CRUD 預留 + seed
-- Prerequisites:
--   - 必須先單獨跑過並 commit：docs/sql/phase-6-shop-coupons-enum-free-shipping.sql
--     （避免與本檔同一交易使用新 enum 值而報 55P04）
--   - docs/sql/phase-0-schema-bootstrap.sql (public.coupons, enum coupon_discount_type)
--   - docs/sql/phase-3-wallet-vac-migration.sql（touch_updated_at；若無則觸發器建立會失敗，請先跑 phase-3）
--   - Recommended after: docs/sql/phase-6-shop-orders-migration.sql
--
-- 變更摘要
-- 1) coupon_discount_type 的 free_shipping 由 phase-6-shop-coupons-enum-free-shipping.sql 新增
-- 2) coupons.applies_fulfillment：'physical' | 'digital' | 'any'
-- 3) 後台新增／維護／移除（預留欄位）
--    - title：後台列表／編輯顯示名（與使用者輸入的 code 可分開）
--    - internal_note：後台備註（對客戶不可見）
--    - created_at / updated_at：審計與排序；updated_at 由 trigger 維護
--    - deleted_at：軟刪除；移除優惠建議設 deleted_at = now()，勿硬刪（以免日後 orders.coupon_id 參照）
--    - is_active：仍表示「是否開放套用」（可暫停而不刪除）
--    - code 唯一性改為「僅未刪除列」唯一：同一 code 可在舊列軟刪後由後台再新增一筆
-- 4) Seed 三組（ON CONFLICT 配合部分唯一索引）
--
-- orders.coupon_code / coupon_id：見檔案末註解

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1) coupons.applies_fulfillment（enum free_shipping 須已由 6b-a 檔案寫入並 commit）
-- ---------------------------------------------------------------------------
alter table public.coupons
  add column if not exists applies_fulfillment text not null default 'any';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'coupons_applies_fulfillment_check'
  ) then
    alter table public.coupons
      add constraint coupons_applies_fulfillment_check
      check (applies_fulfillment in ('physical', 'digital', 'any'));
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 1b) 後台 CRUD 預留欄位
-- ---------------------------------------------------------------------------
alter table public.coupons
  add column if not exists title text not null default '';

alter table public.coupons
  add column if not exists internal_note text;

alter table public.coupons
  add column if not exists created_at timestamptz not null default now();

alter table public.coupons
  add column if not exists updated_at timestamptz not null default now();

alter table public.coupons
  add column if not exists deleted_at timestamptz;

comment on column public.coupons.title is '後台顯示名稱（列表／編輯）';
comment on column public.coupons.internal_note is '後台備註，客戶端不展示';
comment on column public.coupons.created_at is '建立時間（審計）';
comment on column public.coupons.updated_at is '最後更新（審計；觸發器維護）';
comment on column public.coupons.deleted_at is '軟刪除：後台「移除」建議寫入此欄；套用端應排除 deleted_at is not null';
comment on column public.coupons.is_active is '是否開放套用（可與軟刪並用：下架僅關閉 is_active）';

-- phase-0 的 code unique 會阻擋「刪除後同 code 再建」—改為僅「未刪除」列唯一
alter table public.coupons drop constraint if exists coupons_code_key;

create unique index if not exists ux_coupons_code_alive
  on public.coupons (code)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- 2) free_shipping 僅能搭配實體
-- ---------------------------------------------------------------------------
alter table public.coupons drop constraint if exists coupons_free_shipping_physical_only;

alter table public.coupons
  add constraint coupons_free_shipping_physical_only
  check (
    discount_type <> 'free_shipping'::coupon_discount_type
    or applies_fulfillment = 'physical'
  );

create index if not exists idx_coupons_applies_fulfillment
  on public.coupons (applies_fulfillment)
  where is_active = true and deleted_at is null;

create index if not exists idx_coupons_admin_list
  on public.coupons (deleted_at, created_at desc);

-- ---------------------------------------------------------------------------
-- 3) updated_at 觸發器（依賴 phase-3 touch_updated_at）
-- ---------------------------------------------------------------------------
drop trigger if exists trg_coupons_touch_updated_at on public.coupons;

create trigger trg_coupons_touch_updated_at
before update on public.coupons
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 4) Seed（discount_value：percentage = 扣除的百分比，97 折 => 3）
-- ---------------------------------------------------------------------------
insert into public.coupons (
  code,
  title,
  discount_type,
  discount_value,
  min_purchase,
  expires_at,
  is_active,
  applies_fulfillment,
  internal_note
)
values
  (
    'SHIPFREE',
    '免運券（僅實體）',
    'free_shipping',
    0,
    0,
    null,
    true,
    'physical',
    '後台可編輯／軟刪除'
  ),
  (
    'DIGI97',
    '97 折（僅虛擬）',
    'percentage',
    3,
    0,
    null,
    true,
    'digital',
    null
  ),
  (
    'ALL95',
    '95 折（實體／虛擬）',
    'percentage',
    5,
    0,
    null,
    true,
    'any',
    null
  )
on conflict (code) where deleted_at is null
do update
set
  title = excluded.title,
  discount_type = excluded.discount_type,
  discount_value = excluded.discount_value,
  min_purchase = excluded.min_purchase,
  expires_at = excluded.expires_at,
  is_active = excluded.is_active,
  applies_fulfillment = excluded.applies_fulfillment,
  internal_note = coalesce(excluded.internal_note, coupons.internal_note),
  updated_at = now();

-- orders：coupon_code（text）足夠記錄結帳代碼。
-- 後台若需 FK／報表，可加：alter table public.orders add column if not exists coupon_id uuid references public.coupons(id);
