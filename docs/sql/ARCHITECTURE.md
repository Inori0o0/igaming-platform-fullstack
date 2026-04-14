# Database architecture (public)

This diagram matches the reference snapshot in [`schema.sql`](./schema.sql), synced from Supabase project **first-igaming-project** (`fjduloefmqtohtnkqtfp`) on **2026-04-11**.

`auth.users` is Supabase Auth; `public.users` links via `auth_user_id`. Orders store `coupon_code` as text (no FK to `coupons`).

## ER diagram (core relationships)

```mermaid
erDiagram
  USERS ||--o| WALLETS : "1:1 user_id"
  USERS ||--o{ TRANSACTIONS : "ledger"
  USERS ||--o{ ORDERS : "places"
  USERS ||--o{ ACHIEVEMENTS : "unlocks"
  USERS ||--o{ GAME_HISTORY : "plays"
  USERS ||--o{ WISHLISTS : "saves"
  USERS ||--|| USER_AVATAR_SELECTION : "current avatar"
  USERS ||--o{ USER_ENTITLEMENTS : "owns"

  PRODUCTS ||--o{ PRODUCT_VARIANTS : "sizes"
  PRODUCTS ||--o{ ORDER_ITEMS : "line"
  PRODUCTS ||--o{ WISHLISTS : "saved"
  PRODUCTS ||--o{ USER_ENTITLEMENTS : "grant"
  PRODUCTS ||--o| USER_AVATAR_SELECTION : "selected avatar"

  ORDERS ||--o{ ORDER_ITEMS : "contains"
  ORDERS ||--o{ USER_ENTITLEMENTS : "source_order"

  PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "variant_id"
```

`coupons` 為獨立表；結帳時依 `code` 套用，`orders.coupon_code` 僅存文字，**無外鍵**連到 `coupons`。

## Public RPCs (high level)

| Name | Role |
|------|------|
| `checkout_shop_order` | Client checkout: lines, optional coupon, shipping JSON → JSON result |
| `admin_search_orders` | Admin list/filter orders |
| `admin_search_transactions` | Admin list/filter transactions |
| `get_admin_dashboard_stats` | Aggregated dashboard JSON |

Triggers on the live DB include `handle_new_auth_user`, `touch_updated_at`, `enforce_transaction_limits`, `enforce_user_avatar_selection`, and an `rls_auto_enable` event trigger; DDL lives in the phase migration files, not in `schema.sql`.

## Authorization / RLS notes

- Admin authorization is unified on `auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'` (not `user_metadata`).
- `products`, `product_variants`, `coupons` write operations are admin-only via RLS.
- Coupon read model:
  - `anon` can read active, non-deleted coupons.
  - `authenticated` can also read active, non-deleted coupons (needed for logged-in client checkout).
- Coupon deletion is soft delete (`deleted_at`), so deleted rows remain queryable for audit/admin tooling.
- Sensitive RPC execute permissions are limited to `authenticated` / `postgres` / `service_role` (no `PUBLIC`/`anon`).

## Storage (conceptual)

Buckets used by the app (policies in migrations): e.g. `shop-products`, `user-avatars`. Not represented as SQL tables above.
