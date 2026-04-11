# Wallet Migration 使用說明（VAC 主幣）

> **文件時效**：最後對照本 repo 約 **2026-04-11**；若與實際程式或資料庫不一致，**以程式與線上 schema 為準**。

## 檔案位置

- **新庫／完整順序**：見 `docs/sql/README.md`（含 `phase-0-schema-bootstrap.sql` → phase-3 → phase-5 → phase-6 等）。
- Migration 檔（錢包本體）：`docs/sql/phase-3-wallet-vac-migration.sql`
- Slots 結算擴充：`docs/sql/phase-5-slots-wallet-rounds-migration.sql`

## 使用步驟

1. 打開 Supabase SQL Editor
2. 新增一個 Query
3. **空庫**：先執行 `docs/sql/phase-0-schema-bootstrap.sql`（若尚未建立 users / wallets 等基礎表）。
4. 貼上 `docs/sql/phase-3-wallet-vac-migration.sql` 全部內容並執行。

> 建議：不要刪掉既有 schema 直接覆蓋；請在既有基礎上執行 migration。  
> 已有表時可略過 phase-0，直接跑 phase-3。  
> 新增 slots 錢包結算欄位時，請在 phase-3 後再執行 `phase-5-slots-wallet-rounds-migration.sql`。

## 執行後應該看到的變化

- `transaction_type` enum 新增 `claim`
- `wallets.user_id` 成為唯一（每個 user 一個 wallet）
- `transactions` 新增：
  - `status`（`pending` / `completed` / `failed`）
  - `balance_after`
- `transactions.currency` 限制為 `VAC`
- `users` / `wallets` / `transactions` 啟用 RLS 並建立對應 policy
- 交易限制 trigger：
  - claim 必須 `6767 VAC`
  - claim 冷卻 `1.5s`
  - claim 每日最多 `677` 次
  - deposit 單筆最多 `200,000 VAC`
  - deposit 每分鐘最多 `10` 筆
  - deposit 每日總額最多 `5,000,000 VAC`

## 功能驗證（前端）

1. 登入一個測試帳號
2. 在錢包頁點一次充值
3. 確認 `wallets.coin_balance` 上升
4. 確認 `transactions` 新增一筆 `deposit` + `currency='VAC'`
5. 點免費領取，確認 `type='claim'`
6. 送出提領，確認 `type='withdraw'` 且 `status='pending'`

## 目前策略（和前端一致）

- 訪客：資料存在瀏覽器
- 登入用戶：資料寫入 Supabase
- VAC 為唯一可操作幣別
- BTC/ETH/USDT 僅作匯率估值顯示

