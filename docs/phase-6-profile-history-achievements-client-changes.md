# Phase 6.2 / 6.3：本次前端與資料庫變更說明

這份文件整理本輪 `Profile 遊戲歷史 (6.2)` 與 `成就系統 (6.3)` 的變更，包含每個檔案做了什麼、為什麼要做，以及白話版解釋。

---

## 1) 這輪完成了什麼

- 完成 `6.2 /profile/history`：
  - 以交易資料顯示每局結算紀錄
  - 遊戲類型 / 日期篩選
  - 分頁、統計、錯誤重試
  - 手機版 RWD（表格可橫向滑動）
- 完成 `6.3 /profile/achievements`：
  - 成就頁從 placeholder 改為可用
  - 進頁批次補發尚未入庫的可解鎖成就
  - 成就進度與解鎖狀態顯示
  - 收藏家改為「擁有 3 個以上頭像」
- 補上必要測試與 migration：
  - history / achievements 的純邏輯單測
  - achievements 的 RLS 與唯一索引

---

## 2) 檔案變更總覽（程式 + 白話）

### `client-portal/src/app/(lobby)/profile/history/page.tsx`

- **程式做了什麼**
  - 由 placeholder 改成完整頁面。
  - 加入登入擋板、篩選器、表格、分頁與統計卡。
  - 針對手機版加上 RWD：篩選區堆疊、表格可橫向捲動。
- **白話解釋**
  - 使用者現在真的看得到自己的遊戲歷史，而且手機不會爆版。

### `client-portal/src/components/profile/history/useProfileGameHistory.ts`

- **程式做了什麼**
  - 專責處理 history 資料流（查詢、篩選、分頁、統計、重試）。
  - 資料來源採 `transactions` 的 `payout`（`VAC` + `completed`）。
  - 以 `safePage` 取代 effect 內 `setPage`，避免 React cascading render 警告。
- **白話解釋**
  - 把「撈資料＋整理資料」集中在 hook，頁面只負責渲染。

### `client-portal/src/components/profile/history/historyUtils.ts`

- **程式做了什麼**
  - 抽出可重用且可測試的純函式：
    - 數值轉換、日期區間、資料映射、總額聚合
- **白話解釋**
  - 這些函式不依賴 React，比較容易測試與維護。

### `client-portal/src/components/profile/history/historyUtils.test.ts`

- **程式做了什麼**
  - 針對 history 純函式補單元測試（日期、映射、聚合等）。
- **白話解釋**
  - 先守住最容易被改壞的邏輯，避免之後資料顯示錯誤。

### `client-portal/src/app/(lobby)/profile/achievements/page.tsx`

- **程式做了什麼**
  - 由 placeholder 改成可用成就頁。
  - 顯示解鎖進度、成就卡、解鎖時間、錯誤重試。
  - 保持登入擋板，未登入引導開啟 auth modal。
- **白話解釋**
  - 使用者能看到自己解鎖幾個、還差多少，體驗完整很多。

### `client-portal/src/components/profile/achievements/useProfileAchievements.ts`

- **程式做了什麼**
  - 進頁批次補發成就：
    1. 先讀已解鎖成就
    2. 查交易/訂單/頭像 entitlement 統計
    3. 計算新達標但未入庫項目
    4. 寫回 `achievements` 並重讀顯示
  - 收藏家統計改為只算 `entitlement_type = 'avatar'`。
- **白話解釋**
  - 不用在每個遊戲或下單流程都塞成就程式，先用「進頁補發」穩定落地。

### `client-portal/src/components/profile/achievements/achievementRules.ts`

- **程式做了什麼**
  - 集中管理成就規則與進度文字。
  - 提供 `evaluateUnlocks` 與數值工具函式。
  - 收藏家文案改為「擁有 3 個以上頭像」。
- **白話解釋**
  - 成就規則集中在一個檔案，未來改門檻比較不會漏改。

### `client-portal/src/components/profile/achievements/achievementRules.test.ts`

- **程式做了什麼**
  - 補齊成就規則測試（達標判斷、略過已解鎖、數值工具）。
- **白話解釋**
  - 確保「誰該解鎖、誰不該解鎖」判斷可靠。

### `docs/sql/phase-6-profile-achievements-migration.sql`

- **程式做了什麼**
  - 啟用 `public.achievements` RLS。
  - 新增 `(user_id, achievement_type)` 唯一索引防重複。
  - 新增 `select_own` / `insert_own` policy（只能看/寫自己的成就）。
- **白話解釋**
  - 前端可安全直連 Supabase，同時避免同一成就被重複塞多筆。

### `docs/sql/README.md`

- **程式做了什麼**
  - migration 順序新增 4c：`phase-6-profile-achievements-migration.sql`。
- **白話解釋**
  - 讓後續環境同步時，不會漏跑成就 migration。

### `vacant_igaming_portfolio_2dba8ef1.plan.md`

- **程式做了什麼**
  - 更新 6.2 / 6.3 實作狀態段落。
  - 成就表格「收藏家」條件同步改為 3 個以上頭像。
- **白話解釋**
  - 計畫文件與現況對齊，方便之後回顧與交接。

---

## 3) 設計決策摘要（為什麼這樣做）

- 6.2 採 `transactions.payout` 作為每局紀錄：避免 wager/payout 雙列造成重複計數。
- 日期篩選採本地時區日界線：符合使用者 UI 直覺。
- 6.3 採進頁批次補發：先快速穩定上線，再視需求改成事件驅動即時發放。
- 收藏家改為頭像數：符合目前 `user_entitlements` 實際寫入行為。

---

## 4) 後續建議（可選）

- 若未來成就數量變多，可將成就規則再拆為「資料定義」與「條件運算」兩層。
- 若要即時發放成就，可在遊戲結算/訂單完成流程加入事件通知或 RPC。
- 若想避免多次重複查詢，可考慮把成就統計下沉到單一 view 或 RPC。
