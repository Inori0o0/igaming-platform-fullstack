-- Phase 6b-a: coupon_discount_type — 僅新增 enum 值 free_shipping
--
-- 為何獨立一支檔？
-- PostgreSQL 規定：ALTER TYPE ... ADD VALUE 與「使用該新值」的語句不可在同一筆交易內。
-- Supabase SQL Editor 常把整份腳本包成一筆交易，會出現：
--   55P04: unsafe use of new value "free_shipping" ... must be committed before they can be used.
--
-- 作法：在 Supabase 先「執行本檔並送出」後，再執行
--   docs/sql/phase-6-shop-coupons-fulfillment-migration.sql
--
-- Prerequisites: phase-0（已有 enum coupon_discount_type）
-- 可重跑：已存在則略過

do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'coupon_discount_type'
      and e.enumlabel = 'free_shipping'
  ) then
    alter type coupon_discount_type add value 'free_shipping';
  end if;
end
$$;
