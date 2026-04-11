# SQL migrations（建議執行順序）

以下路徑皆相對於 repo 根目錄的 `docs/sql/`。

## 與線上庫對齊

- **[`schema.sql`](./schema.sql)**：`public` 表與 enum 的**參考快照**（非可重播的完整 DDL），已於 **2026-04-11** 依 Supabase 專案 **first-igaming-project**（ref `fjduloefmqtohtnkqtfp`）對齊。若你之後用控制台／MCP 直接改庫，請再更新此檔或註明漂移。
- **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**：簡化 ER 圖（Mermaid）、主要 RPC 與 storage 說明。

下方 **phase-*.sql** 仍為從空庫或舊 schema **漸進套用**的腳本；已有資料的庫請勿重跑會破壞資料的段落，並以實際庫為準驗證。

| 順序 | 檔案 | 說明 |
|------|------|------|
| 1 | [`phase-0-schema-bootstrap.sql`](./phase-0-schema-bootstrap.sql) | 新專案／空庫：建立 users、wallets、舊版 products/orders 等基礎表與 auth 同步 trigger |
| 2 | [`phase-3-wallet-vac-migration.sql`](./phase-3-wallet-vac-migration.sql) | VAC 錢包：`claim`、RLS、交易限制等（需已有 phase-0 的表） |
| 3 | [`phase-5-slots-wallet-rounds-migration.sql`](./phase-5-slots-wallet-rounds-migration.sql) | 選用：老虎機 wager/payout 與 round 欄位（在 phase-3 之後） |
| 4 | [`phase-6-shop-orders-migration.sql`](./phase-6-shop-orders-migration.sql) | 商店：商品擴充、variants、orders、entitlements、storage bucket、seed |
| 4b | [`phase-6-user-avatars-upload-migration.sql`](./phase-6-user-avatars-upload-migration.sql) | 使用者上傳頭像：`user-avatars` bucket + upload policy |
| 4c | [`phase-6-profile-achievements-migration.sql`](./phase-6-profile-achievements-migration.sql) | 成就系統：`achievements` RLS + `(user_id, achievement_type)` 唯一索引 |
| 5a | [`phase-6-shop-coupons-enum-free-shipping.sql`](./phase-6-shop-coupons-enum-free-shipping.sql) | 優惠券：單獨新增 enum `free_shipping`（**須先跑並 commit**，再跑 5b，避免 55P04） |
| 5b | [`phase-6-shop-coupons-fulfillment-migration.sql`](./phase-6-shop-coupons-fulfillment-migration.sql) | 優惠券：`applies_fulfillment`、後台 CRUD 預留、seed（依賴 5a） |
| 6c | [`phase-6-shop-checkout-rpc-migration.sql`](./phase-6-shop-checkout-rpc-migration.sql) | 商店結帳：`checkout_shop_order` RPC（SECURITY DEFINER）、`GRANT authenticated`（依賴 4、5b、phase-3） |
| — | [`phase-4-game-availability-stub.sql`](./phase-4-game-availability-stub.sql) | 僅參考 stub，預設不執行 |
| — | [`phase-6-shop-admin-stub.sql`](./phase-6-shop-admin-stub.sql) | 僅參考；實際 schema 以 `phase-6-shop-orders-migration.sql` 為準 |

錢包細節與驗證步驟見 [`README-wallet-migration.md`](./README-wallet-migration.md)。

> **已有資料的庫**：不要重跑 phase-0 覆蓋；在現有 schema 上依序補跑 phase-3、5、6 即可（phase-6 內含舊表相容的 `ALTER`）。
