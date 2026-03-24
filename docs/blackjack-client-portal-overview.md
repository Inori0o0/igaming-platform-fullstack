# 二十一點（Blackjack）— client-portal 說明

本文件用**白話**說明 Blackjack 相關程式怎麼分工；細節以程式註解為準。  
對應計畫書：`vacant_igaming_portfolio_2dba8ef1.plan.md` **§4.2**。

---

## 整體在幹嘛？

玩家從**遊戲大廳**或首頁熱門區進 **`/games/blackjack`** → 下注（先扣 VAC）→ 發牌、要牌／停牌／雙倍／分牌 → 莊家依 **S17** 補牌 → **結算派彩**（寫入錢包與交易紀錄）。  
隨機性目前用**前端種子洗牌**（`roundId` 派生），介面預留日後改成伺服器 seed。

---

## 檔案對照表（白話）

### 規則與型別（`src/games/blackjack/logic/`）

| 檔案 | 做什麼 |
|------|--------|
| **`types.ts`** | 牌、手牌、回合階段、結算結果、**HandTier**（大／小過五關、Blackjack、一般點數等）的型別定義。 |
| **`game.ts`** | **純函式規則**：算點、`isBlackjack`（僅起手 A+10/J/Q/K）、能否分牌／雙倍、莊家是否補牌、`classifyHandTier`、`settleHands`（比階級與點數、算 net／總派彩）。不含 React。 |
| **`game.test.ts`** | 上述規則的單元測試（點數、S17、結算、過五關、分牌上限等）。 |
| **`rng.ts`** | **洗牌與 RandomProvider**：`xmur3` + `mulberry32` 偽隨機；可切 `pseudo` / `server-seeded` 擴充。 |

---

### 牌桌 UI 與狀態（`src/games/blackjack/components/`）

| 檔案 | 做什麼 |
|------|--------|
| **`BlackjackTable.tsx`** | **組裝層**：呼叫 `useBlackjackTableGame`，左邊 `TableStage`、右邊 `ControlPanel`。 |
| **`blackjack-table/useBlackjackTableGame.ts`** | **單一 hook 出口**：餘額／訊息／吉祥物 cue、把「結算」與「玩家動作」交給子 hook。 |
| **`blackjack-table/useRoundSettlement.ts`** | **莊家補牌 + settleHands + applyBlackjackPayout**，以及結算後延遲訊息／吉祥物。 |
| **`blackjack-table/useRoundActions.ts`** | **開局、Hit、Stand、Double、Split**、輪替多手牌、與錢包加扣款。 |
| **`blackjack-table/constants.ts`** | 下注上下限、籌碼 step、資產路徑、動畫毫秒、**RNG 單例**、Bombardiro 飛行時間。 |
| **`blackjack-table/types.ts`** | 前端一局狀態 `RoundState`、`MascotCue` 等。 |
| **`blackjack-table/helpers.ts`** | 抽牌、建手牌、莊家可見點數、牌面文字、過五關／21 顯示標籤等工具。 |
| **`blackjack-table/TableStage.tsx`** | 牌桌背景 + **吉祥物層** + Dealer／玩家區排版。 |
| **`blackjack-table/MascotLayer.tsx`** | 莊家與兩隻邊緣吉祥物；**贏局時 Bombardiro 飛向 Brr Brr、Brr 受傷圖、飛回 idle**。 |
| **`blackjack-table/DealerSection.tsx`** / **`PlayerHandsSection.tsx`** | 莊家／玩家牌列與結算標籤。 |
| **`blackjack-table/ControlPanel.tsx`** | 下注 step、操作鈕、`StatusPanel`、角色說明卡。 |
| **`blackjack-table/StatusPanel.tsx`** | **桌面訊息**：固定高度區塊、主訊息單行省略、派彩一行。 |

---

### 錢包（`src/store/walletStore.ts`）

| 區塊 | 做什麼 |
|------|--------|
| **`placeBlackjackWager`** | 本局／雙倍／分牌時**先扣款**（wager），`game_id: blackjack`，帶 `themeId`、`roundId`。 |
| **`applyBlackjackPayout`** | 結算後**派彩**（payout，含 0），寫 metadata 供對帳。 |

---

### 路由與大廳（`src/app/(lobby)/`）

| 檔案 | 做什麼 |
|------|--------|
| **`games/blackjack/page.tsx`** | 二十一點頁：標題 + `BlackjackTable`。 |
| **`games/page.tsx`** | 遊戲大廳：**單一圖卡網格**（老虎機多張 + 二十一點 + 百家樂 + 彩票占位），`GameThemeCard` + 右上角類型標籤。 |
| **`components/home/HomeHighlightsSection.tsx`** | 首頁熱門：**Italian Brainrot Slots** 與 **Blackjack 圖卡**並列。 |

---

### 共用 UI

| 檔案 | 做什麼 |
|------|--------|
| **`components/ui/GameThemeCard.tsx`** | 4:5 圖卡、底圖、底部標題、**右上角 `tag`（遊戲類型）**、維護／即將開放狀態。 |

---

## 資料流（一句話）

**`rng` 洗牌 → `useRoundActions` 推進手牌與扣款 → `useRoundSettlement` 莊家補牌與 `settleHands` → `applyBlackjackPayout` → UI 顯示結果與吉祥物。**

---

## 需要每個資料夾都放 README 嗎？

**不必。** 維護時以本檔 + `logic/*.ts`／hooks **檔頭註解**為主即可。

---

## 與計畫書角色差異（備註）

計畫書 §4.2 曾以 **Lirili Larila** 為莊家；**目前實作**牌桌莊家為 **Tung Tung Tung Sahur**，邊緣吉祥物為 **Brr Brr Patapim**（輸／受擊）與 **Bombardiro**（贏／衝刺），與計畫書「腦爛宇宙」一致，僅角色分工以程式與美術資產為準。計畫書已同步註記。
