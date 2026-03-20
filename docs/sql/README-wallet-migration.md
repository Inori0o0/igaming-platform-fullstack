# Wallet Migration 使用說明（VAC 主幣）

## 檔案位置

- Migration 檔：`docs/sql/phase-3-wallet-vac-migration.sql`

## 使用步驟

1. 打開 Supabase SQL Editor
2. 新增一個 Query
3. 貼上 `phase-3-wallet-vac-migration.sql` 全部內容
4. 執行 SQL

> 建議：不要刪掉既有 schema 直接覆蓋；請在既有基礎上執行 migration。

## 執行後應該看到的變化

- `transaction_type` enum 新增 `claim`
- `wallets.user_id` 成為唯一（每個 user 一個 wallet）
- `transactions` 新增：
  - `status`（`pending` / `completed` / `failed`）
  - `balance_after`
- `transactions.currency` 限制為 `VAC`
- `users` / `wallets` / `transactions` 啟用 RLS 並建立對應 policy

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

