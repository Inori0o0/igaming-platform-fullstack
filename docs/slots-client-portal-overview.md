# Slots 功能（client-portal）說明

> **文件時效**：最後對照本 repo 約 **2026-04-11**；若與實際程式或資料庫不一致，**以程式與線上 schema 為準**。

本文件整理目前 `client-portal` 的 Slots 實作現況（2026-03）。  
重點是：**頁面排版固定為一套**，主題差異只靠 config/資產注入。

---

## 目前產品行為

玩家從列表進入 `/games/slots/[id]`，頁面會：

1. 依 `id` 找主題；找不到就 fallback 到第一個已註冊主題。
2. 渲染固定版型的 `SlotThemedPlayfield`。
3. 按下轉動後：
   - 先嘗試寫入 `wager`（扣 VAC）
   - 啟動停輪動畫
   - 停輪後做 `evaluateLineWins`
   - 寫入 `payout`（加回中獎 VAC）
   - 若下注失敗則回滾盤面並提示錯誤

---

## 固定版型（重要）

`SlotThemedPlayfield` 現在是固定結構：

- 上方：Banner（或固定占位）
- 中段：Reel 區（5 欄）
- Reel 下方同一排三欄（桌面）：
  - 左：`SlotPlayfieldBetControls`
  - 中：`SlotPlayfieldSpinButton`
  - 右：`SlotSpinResult`（`compact` 摘要模式）
- 最下方：`SlotPlayfieldSidebar`

主題切換時不切版，只替換下列資料：

- `theme.symbols / paylines / paytable`
- `theme.visual.*`（色系 class）
- `pageBackgroundSrc / machineFrameSrc / titleBannerSrc`

---

## 主要檔案對照

### 路由層

| 檔案 | 作用 |
|------|------|
| `src/app/(lobby)/games/slots/[id]/page.tsx` | 單一路由頁；統一只渲染可玩畫面，並做主題 fallback。 |

### Playfield 組件層

| 檔案 | 作用 |
|------|------|
| `src/games/slots/components/SlotThemedPlayfield.tsx` | 固定排版總成（Banner / Reel / 三欄控制區 / Sidebar）。 |
| `slot-playfield/SlotPlayfieldBanner.tsx` | 顯示 banner 圖與主題標題疊字（支援 compact 文字樣式）。 |
| `slot-playfield/SlotPlayfieldShell.tsx` | 外層透明容器（目前僅做統一 padding + style 注入）。 |
| `slot-playfield/SlotReelGrid.tsx` | 5 欄 Reel 網格，並決定是否套用外框容器。 |
| `slot-playfield/SlotPlayfieldReelFrame.tsx` | Reel 外框圖容器（固定比例 `2:1` 與最大寬度，主題間一致）。 |
| `slot-playfield/ReelColumn.tsx` | 單欄滾動動畫與停輪顯示。 |
| `slot-playfield/SlotPlayfieldBetControls.tsx` | 下注控制（+100/+1000/+10000、梭哈、+-、餘額提示）。 |
| `slot-playfield/SlotPlayfieldSpinButton.tsx` | 中央大轉動按鈕。 |
| `slot-playfield/SlotSpinResult.tsx` | 連線結果顯示；`compact` 只顯示前幾筆。 |
| `slot-playfield/SlotPlayfieldSidebar.tsx` | 下方補充資訊與 paytable。 |

### 狀態與邏輯層

| 檔案 | 作用 |
|------|------|
| `slot-playfield/useSlotPlayfieldState.ts` | spin 狀態機（下注、回滾、結算、派彩、error）。 |
| `slot-playfield/useSlotPlayfieldView.ts` | 從 `theme.visual` 拆出 UI 所需資產與 style。 |
| `slot-playfield/reelStrip.ts` | 初始盤面、隨機欄位、滾動條帶生成。 |
| `slot-playfield/highlightRows.ts` | 中獎 key 轉欄位高亮列。 |
| `logic/evaluateLineWins.ts` | 核心連線結算。 |

### 主題與設定層

| 檔案 | 作用 |
|------|------|
| `config/types.ts` | Slots 主題型別定義。 |
| `config/index.ts` | 主題 registry 與查詢入口。 |
| `config/gameAvailability.ts` | 可玩狀態與 placeholder 資料。 |
| `config/themes/*.ts` | 各主題符號、賠率、美術資產設定。 |

---

## 近期結構調整（供維護者）

- 已移除 `slot-game-page-views.tsx`，改由 `[id]/page.tsx` 內部直接輸出可玩畫面。
- 已拆分舊 `SlotPlayfieldSpinControls.tsx` 為：
  - `SlotPlayfieldBetControls.tsx`
  - `SlotPlayfieldSpinButton.tsx`
- `SlotPlayfieldShell` 不再承擔主題背景/外框判斷，現在是簡化容器。

---

## 資料流（簡版）

`themes/*.ts` -> `getSlotThemeConfig` -> `SlotThemedPlayfield` -> `useSlotPlayfieldState` -> `evaluateLineWins` -> `SlotSpinResult / Reel 高亮`
