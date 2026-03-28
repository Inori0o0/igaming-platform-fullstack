# SQL migrations（建議執行順序）

以下路徑皆相對於 repo 根目錄的 `docs/sql/`。

| 順序 | 檔案 | 說明 |
|------|------|------|
| 1 | [`phase-0-schema-bootstrap.sql`](./phase-0-schema-bootstrap.sql) | 新專案／空庫：建立 users、wallets、舊版 products/orders 等基礎表與 auth 同步 trigger |
| 2 | [`phase-3-wallet-vac-migration.sql`](./phase-3-wallet-vac-migration.sql) | VAC 錢包：`claim`、RLS、交易限制等（需已有 phase-0 的表） |
| 3 | [`phase-5-slots-wallet-rounds-migration.sql`](./phase-5-slots-wallet-rounds-migration.sql) | 選用：老虎機 wager/payout 與 round 欄位（在 phase-3 之後） |
| 4 | [`phase-6-shop-orders-migration.sql`](./phase-6-shop-orders-migration.sql) | 商店：商品擴充、variants、orders、entitlements、storage bucket、seed |
| — | [`phase-4-game-availability-stub.sql`](./phase-4-game-availability-stub.sql) | 僅參考 stub，預設不執行 |
| — | [`phase-6-shop-admin-stub.sql`](./phase-6-shop-admin-stub.sql) | 僅參考；實際 schema 以 `phase-6-shop-orders-migration.sql` 為準 |

錢包細節與驗證步驟見 [`README-wallet-migration.md`](./README-wallet-migration.md)。

> **已有資料的庫**：不要重跑 phase-0 覆蓋；在現有 schema 上依序補跑 phase-3、5、6 即可（phase-6 內含舊表相容的 `ALTER`）。
