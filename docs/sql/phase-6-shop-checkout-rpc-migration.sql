-- Phase 6c: Shop checkout — atomic RPC (方法一：前端 supabase.rpc，SECURITY DEFINER)
-- Prerequisites:
--   - docs/sql/phase-6-shop-orders-migration.sql
--   - docs/sql/phase-6-shop-coupons-fulfillment-migration.sql（coupons.applies_fulfillment、enum free_shipping）
--   - docs/sql/phase-3-wallet-vac-migration.sql（wallets、transactions、RLS）
--
-- 執行後請在 Supabase SQL Editor 跑一次；再於 Dashboard → Database → Functions 確認
-- public.checkout_shop_order 存在，且 Authenticated 可 execute（本檔含 GRANT）。
--
-- p_lines: jsonb array，每筆 { "product_id": "uuid", "quantity": int, "size": "M" | null }
-- p_coupon_code: 可 null／空；對應 SHIPFREE / DIGI97 / ALL95（與 client cartStore 一致）
-- p_shipping: 實體訂單必填 { "recipient", "phone", "address", "note" }；虛擬可 null

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- checkout_shop_order
-- ---------------------------------------------------------------------------
create or replace function public.checkout_shop_order(
  p_lines jsonb,
  p_coupon_code text default null,
  p_shipping jsonb default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth uuid := auth.uid();
  v_db_user_id uuid;
  v_wallet numeric;
  v_balance numeric;
  v_subtotal numeric := 0;
  v_base_ship numeric := 0;
  v_pct_disc numeric := 0;
  v_ship_disc numeric := 0;
  v_ship_final numeric := 0;
  v_disc_total numeric := 0;
  v_total numeric;
  v_first_fulfillment text;
  line_json jsonb;
  v_product record;
  v_variant record;
  v_coupon record;
  v_code text;
  v_order_id uuid;
  v_lines_agg jsonb := '[]'::jsonb;
  v_physical_fee constant numeric := 60;
begin
  if v_auth is null then
    raise exception '請先登入';
  end if;

  select u.id into v_db_user_id
  from public.users u
  where u.auth_user_id = v_auth;

  if v_db_user_id is null then
    raise exception '找不到使用者資料';
  end if;

  if p_lines is null or jsonb_typeof(p_lines) <> 'array' or jsonb_array_length(p_lines) = 0 then
    raise exception '購物車是空的';
  end if;

  -- 第一階段：驗證品項、庫存、頭像重複、計算小計
  for line_json in select jsonb_array_elements(p_lines)
  loop
    select * into v_product
    from public.products p
    where p.id = (line_json->>'product_id')::uuid
      and p.is_active = true;

    if not found then
      raise exception '商品不存在或已下架';
    end if;

    if v_product.force_sold_out then
      raise exception '商品暫停販售';
    end if;

    if v_first_fulfillment is null then
      v_first_fulfillment := v_product.fulfillment_type;
    elsif v_product.fulfillment_type <> v_first_fulfillment then
      raise exception '實體／虛擬商品請分開結帳';
    end if;

    if v_product.is_avatar and coalesce((line_json->>'quantity')::int, 0) > 1 then
      raise exception '頭像每款限 1 件';
    end if;

    if v_product.is_avatar and exists (
      select 1
      from public.user_entitlements e
      where e.user_id = v_db_user_id
        and e.product_id = v_product.id
        and e.entitlement_type = 'avatar'
    ) then
      raise exception '您已擁有此商品';
    end if;

    -- 解析 variant
    if exists (
      select 1 from public.product_variants pv
      where pv.product_id = v_product.id and pv.size is not null
    ) then
      if (line_json->>'size') is null or btrim(line_json->>'size') = '' then
        raise exception '請選擇尺寸';
      end if;
      select * into v_variant
      from public.product_variants pv
      where pv.product_id = v_product.id
        and pv.size = (line_json->>'size');
    else
      select * into v_variant
      from public.product_variants pv
      where pv.product_id = v_product.id
        and pv.size is null;
    end if;

    if not found then
      raise exception '找不到庫存規格';
    end if;

    if v_variant.stock_quantity < (line_json->>'quantity')::int then
      raise exception '庫存不足';
    end if;

    v_lines_agg := v_lines_agg || jsonb_build_array(
      jsonb_build_object(
        'product_id', v_product.id,
        'variant_id', v_variant.id,
        'quantity', (line_json->>'quantity')::int,
        'unit_price_vac', v_product.price_vac,
        'line_total_vac', v_product.price_vac * (line_json->>'quantity')::int,
        'size_snapshot', v_variant.size,
        'is_avatar', v_product.is_avatar
      )
    );

    v_subtotal := v_subtotal + v_product.price_vac * (line_json->>'quantity')::int;
  end loop;

  if v_first_fulfillment = 'physical' and v_subtotal > 0 then
    v_base_ship := v_physical_fee;
  end if;

  -- 優惠券（與 client cartStore 對齊）
  v_code := nullif(upper(btrim(coalesce(p_coupon_code, ''))), '');

  if v_code is not null then
    select * into v_coupon
    from public.coupons c
    where upper(c.code) = v_code
      and c.deleted_at is null
      and c.is_active = true;

    if not found then
      raise exception '無效優惠碼';
    end if;

    if v_coupon.applies_fulfillment = 'physical' and v_first_fulfillment <> 'physical' then
      raise exception '此優惠不適用目前購物車';
    end if;
    if v_coupon.applies_fulfillment = 'digital' and v_first_fulfillment <> 'digital' then
      raise exception '此優惠不適用目前購物車';
    end if;

    if v_coupon.discount_type = 'percentage'::coupon_discount_type then
      v_pct_disc := floor(v_subtotal * v_coupon.discount_value / 100.0);
    elsif v_coupon.discount_type = 'free_shipping'::coupon_discount_type then
      v_ship_disc := least(v_base_ship, v_physical_fee);
    end if;
  end if;

  v_disc_total := v_pct_disc + v_ship_disc;
  v_ship_final := greatest(v_base_ship - v_ship_disc, 0);
  v_total := greatest(v_subtotal + v_ship_final - v_pct_disc, 0);

  -- 實體收件驗證
  if v_first_fulfillment = 'physical' then
    if p_shipping is null
      or btrim(coalesce(p_shipping->>'recipient', '')) = ''
      or btrim(coalesce(p_shipping->>'phone', '')) = ''
      or btrim(coalesce(p_shipping->>'address', '')) = ''
    then
      raise exception '請填寫收件人、手機與地址';
    end if;
  end if;

  -- 錢包（鎖列）
  insert into public.wallets (user_id, coin_balance, btc_balance, eth_balance)
  values (v_db_user_id, 0, 0, 0)
  on conflict (user_id) do nothing;

  select w.coin_balance into v_balance
  from public.wallets w
  where w.user_id = v_db_user_id
  for update;

  if not found then
    raise exception '無法讀取錢包';
  end if;

  v_wallet := coalesce(v_balance, 0);

  if v_wallet < v_total then
    raise exception '餘額不足';
  end if;

  insert into public.orders (
    user_id,
    status,
    fulfillment_type,
    subtotal_vac,
    shipping_fee_vac,
    discount_vac,
    total_vac,
    total_amount,
    coupon_code,
    shipping_snapshot
  )
  values (
    v_db_user_id,
    'paid',
    v_first_fulfillment,
    v_subtotal,
    v_ship_final,
    v_disc_total,
    v_total,
    v_total,
    v_code,
    case when v_first_fulfillment = 'physical' then p_shipping else null end
  )
  returning id into v_order_id;

  -- order_items + 扣庫存
  for line_json in select jsonb_array_elements(v_lines_agg)
  loop
    insert into public.order_items (
      order_id,
      variant_id,
      product_id,
      quantity,
      unit_price_vac,
      line_total_vac,
      price_at_purchase,
      size_snapshot
    )
    values (
      v_order_id,
      (line_json->>'variant_id')::uuid,
      (line_json->>'product_id')::uuid,
      (line_json->>'quantity')::int,
      (line_json->>'unit_price_vac')::numeric,
      (line_json->>'line_total_vac')::numeric,
      (line_json->>'unit_price_vac')::numeric,
      line_json->>'size_snapshot'
    );

    update public.product_variants pv
    set stock_quantity = pv.stock_quantity - (line_json->>'quantity')::int,
        updated_at = now()
    where pv.id = (line_json->>'variant_id')::uuid;

    if coalesce((line_json->>'is_avatar')::boolean, false) then
      insert into public.user_entitlements (user_id, product_id, entitlement_type, source_order_id)
      values (v_db_user_id, (line_json->>'product_id')::uuid, 'avatar', v_order_id)
      on conflict (user_id, product_id) do nothing;
    end if;
  end loop;

  -- 扣款 + 交易紀錄
  update public.wallets
  set coin_balance = coin_balance - v_total,
      updated_at = now()
  where user_id = v_db_user_id;

  insert into public.transactions (
    user_id,
    type,
    currency,
    amount,
    description,
    status,
    balance_after,
    metadata
  )
  values (
    v_db_user_id,
    'purchase',
    'VAC',
    v_total,
    '商店購物',
    'completed',
    (select coin_balance from public.wallets where user_id = v_db_user_id),
    jsonb_build_object('order_id', v_order_id)
  );

  return jsonb_build_object('order_id', v_order_id);
end;
$$;

grant execute on function public.checkout_shop_order(jsonb, text, jsonb) to authenticated;

comment on function public.checkout_shop_order(jsonb, text, jsonb) is
  '商店結帳：驗證品項／優惠／餘額，寫入 orders、order_items、扣庫存、user_entitlements（頭像）、扣錢包、transactions。';
