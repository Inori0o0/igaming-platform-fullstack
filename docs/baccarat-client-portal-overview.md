# 百家樂（Baccarat）— client-portal 說明

本文件用**白話**說明百家樂在 `client-portal` 內的程式分工與流程；細節以程式註解為準。  
對應計畫書：`vacant_igaming_portfolio_2dba8ef1.plan.md` **§4.3**。

---

## 整體在幹嘛？

玩家從 `/games/baccarat` 進入 → 選 **閒／莊／和** 與下注金額 → **開始本局**（先扣 VAC）→ 系統洗牌並發兩手各兩張（先蓋牌）→ 玩家用**同一顆主按鈕**依序 **翻閒、翻莊**；若規則需要再 **補牌／翻補牌** → 最後 **結算派彩**（寫入錢包與交易紀錄）、更新路單與桌面訊息。

- **規則層**：標準百家樂計點（mod 10）、第三張判定表、派彩（閒 1:1、莊 0.95、和 8:1；非「和」下注遇到和局則 Push 退回本金）。
- **互動層**：翻牌／補牌／結算由按鈕逐步推進；最後一張牌翻開後，**結算在下一個 tick 執行**，避免「翻牌瞬間就等同出結果」的卡頓感。
- **隨機**：牌與 Blackjack 共用同一套 **52 張牌 + 洗牌 seed**（`roundId` 派生），日後可改 server seed。

---

## 檔案對照表（白話）

### 規則與型別（`src/games/baccarat/logic/`）

| 檔案 | 做什麼 |
|------|--------|
| **`game.ts`** | **純函式規則**：計點、天牌判斷、第三張要不要補、`settleWager`（含和局 Push、莊家 0.95 倍率四捨五入）。不含 React。 |
| **`game.test.ts`** | 上述規則的單元測試（計點、第三張表、派彩）。 |

---

### 牌桌 UI 與狀態（`src/games/baccarat/components/`）

| 檔案 | 做什麼 |
|------|--------|
| **`BaccaratTable.tsx`** | **組裝層**：呼叫 `useBaccaratTableGame`，左邊 `TableStage`、右邊 `ControlPanel`。 |
| **`baccarat-table/useBaccaratTableGame.ts`** | **單一 hook 出口**：下注、回合 `phase` 狀態機、`advance()` 處理逐步翻牌／補牌／`settleNow()` 結算與錢包派彩、路單。 |
| **`baccarat-table/types.ts`** | 前端一局 `BaccaratRoundState`（含 `phase`、`revealed` 計數）、路單 `RoadEntry`。 |
| **`baccarat-table/constants.ts`** | 下注上下限、籌碼 step、**共用 chip_card 路徑**、桌布／吉祥物圖、`DEAL_ANIMATION_MS` 等。 |
| **`baccarat-table/helpers.ts`** | 抽牌、`cardLabel`、結果中文、`outcomeLabel`。 |
| **`baccarat-table/TableStage.tsx`** | 桌布背景、**依 `revealed` 顯示牌背/正面**、莊上閒下區塊、吉祥物層；結算後可選「數秒後蓋回牌背」的顯示邏輯。 |
| **`baccarat-table/MascotLayer.tsx`** | Tralalero／Lirili 常駐、Tung 依規則出現（贏錢或和局）；位置與動畫。 |
| **`baccarat-table/ControlPanel.tsx`** | 下注區、籌碼 step、**主按鈕**（文案依 `phase` 變化）、狀態訊息、可收合路單。 |
| **`baccarat-table/StatusPanel.tsx`** | 桌面訊息區塊（色調、派彩摘要）。 |
| **`baccarat-table/RoadPanel.tsx`** | 簡化路單（最多 24 格，閒/莊/和）。 |

---

### 路由與大廳

| 檔案 | 做什麼 |
|------|--------|
| **`src/app/(lobby)/games/baccarat/page.tsx`** | `/games/baccarat` 頁面殼，載入 `BaccaratTable`。 |
| **`src/app/(lobby)/games/page.tsx`** | 遊戲大廳；百家樂卡片 `imageSrc` 指向 `public/games/baccarat/` 圖卡（如 `bc_card_v2.png`）。 |

---

### 錢包（`src/store/walletStore.ts`）

| 項目 | 做什麼 |
|------|--------|
| **`placeBaccaratWager`** | 開局前扣款（`game_id: baccarat`），訪客寫 local、登入寫 DB。 |
| **`applyBaccaratPayout`** | 結算後派彩（含 0），方便依 `round_id` 對帳。 |

---

## 與計畫書角色差異（備註）

計畫書舊稿曾寫閒莊和對應不同吉祥物；**目前實作**為：

- **閒**：Tralalero Tralala  
- **莊**：Lirili Larila  
- **Tung**：玩家贏錢或和局時出現（win/tie 圖）

若需完全對齊舊稿，可再替換 `MascotLayer` 與資產路徑。

---

## 註解

關鍵檔案（`types`、`helpers`、`constants`、`BaccaratTable`、`TableStage`、`MascotLayer`、`ControlPanel`、`RoadPanel`、`StatusPanel`、`useBaccaratTableGame` 內 tricky 分支、`game.test.ts`、路由 `page.tsx`）已補**繁體中文**檔頭或區塊註解，方便後續維護。

---

## 相關文件

- 二十一點：`docs/blackjack-client-portal-overview.md`（本文件不重複說明 Blackjack 細節）。
- 計畫書：`vacant_igaming_portfolio_2dba8ef1.plan.md` **§4.3** 已同步 client-portal 實作要點。
