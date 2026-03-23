# Slots 功能（client-portal）說明

本文件用**白話**說明老虎機相關程式怎麼分工；細節以程式註解為準。  
**不含** `docs/sql/phase-4-game-availability-stub.sql`（僅為未來 DB 參考）。

---

## 整體在幹嘛？

玩家從**大廳列表**點一張遊戲卡 → 進 **`/games/slots/[主題id]`** → 若主題**開放**，就看到**轉輪、轉一下、算有沒有連線、顯示分數**（目前是示範用 VAC，沒接真錢包）。  
主題長什麼樣（符號、賠率、背景圖）全部寫在 **`SlotThemeConfig`** 裡。

---

## 檔案對照表（白話）

### 設定與型別（`src/games/slots/config/`）

| 檔案 | 做什麼 |
|------|--------|
| **`types.ts`** | 約定「一個主題要有什麼欄位」：符號、賠付線、賠率表、視覺 class 字串、下注範圍等。像一份 JSON schema 的 TypeScript 版。 |
| **`index.ts`** | 對外出口：用主題 **id** 查 `getSlotThemeConfig`；順便匯出**營運狀態**（開放／維護／即將開放）。 |
| **`gameAvailability.ts`** | 現在誰能玩、誰維修、誰還沒開：靜態表 + 之後可換成後台／API。另有「只有圖卡、還沒註冊主題」的 placeholder（例如 John Pork）。 |
| **`themes/cyber-neon.ts`** | **Cyber Neon** 主題的完整設定：符號用 unicode、無品牌圖、賽博風敘述。 |
| **`themes/vacant-classic.ts`** | **vAcAnt Classic**：符號多半是 **PNG**，並指定背景／機台框／橫幅路徑。 |
| **`themes/italian-brainrot.ts`** | **Italian Brainrot**：六個梗角色符號 + 賽博霓虹按鈕樣式 + 同上大圖路徑。 |

---

### 結算邏輯（`src/games/slots/logic/`）

| 檔案 | 做什麼 |
|------|--------|
| **`evaluateLineWins.ts`** | **核心數學**：每條 payline 從**左到右**數連續幾個**相同符號**，滿 3／4／5 就去 paytable 找倍率；總分 = 各線加總。這版只吃 `totalBet`，並固定用主題全部 paylines 分攤每線注。另提供 `winningCellKeys` 給畫面**亮哪幾格**。 |
| **`evaluateLineWins.test.ts`** | 連線規則單測：固定盤面驗證「多線結算」「左起連續才算」「`totalBet` 會平均分攤到全部 paylines」。 |

---

### 轉輪畫面（`src/games/slots/components/`）

| 檔案 | 做什麼 |
|------|--------|
| **`SlotThemedPlayfield.tsx`** | **一個主題的整張遊戲畫面**：記盤面、按轉、叫結算、排背景／橫幅／外框、塞五個 `ReelColumn`、結果與按鈕、側欄。已接錢包：下注成功先寫 `wager` 扣 VAC，停輪後寫 `payout` 加回獎勵；按鈕點下後動畫先啟動，下注失敗會回滾並提示。 |
| **`slot-playfield/constants.ts`** | 幾列幾欄、預設單格高度；以及每欄「滾動條要拉多長」的公式（讓五欄停輪時間錯開）。 |
| **`slot-playfield/reelStrip.ts`** | 生出**隨機結果欄**、**第一次載入可重現的盤面**、以及動畫用**長條符號帶**（上面假滾動、最後三格是真結果）。 |
| **`slot-playfield/highlightRows.ts`** | 把「中獎格子的座標字串」拆成**某一欄要亮哪幾列**，給 `ReelColumn` 畫圈。 |
| **`slot-playfield/useSlotCellPx.ts`** | 依**螢幕寬度**縮小單格高度，避免手機上轉輪比機台框還胖。 |
| **`slot-playfield/ReelColumn.tsx`** | **單一欄**：長條符號用 Framer Motion **往上捲**，停在最後三格；無動畫模式則直接畫三格。 |
| **`slot-playfield/ReelSymbolContent.tsx`** | **單一格**要顯示圖還是文字；有圖就限制高度別爆格。 |
| **`slot-playfield/SlotPlayfieldBanner.tsx`** | 上方橫幅圖 + **疊一層標題字**（漸層霓虹字）。 |
| **`slot-playfield/SlotPlayfieldReelFrame.tsx`** | 機台**外框 PNG**，中間用 `inset` 挖洞塞轉輪。 |
| **`slot-playfield/SlotPlayfieldShellHeader.tsx`** | 轉輪區上方一行小資訊（有無橫幅時版面略不同）。 |
| **`slot-playfield/SlotSpinResult.tsx`** | 顯示本局連線結果列表與**展示用**總分。 |
| **`slot-playfield/SlotPlayfieldSpinControls.tsx`** | 下注控制 + 轉動按鈕：`totalBet` 範圍固定 `100~100000`，用 `+/-` 與跳額按鈕（100/1000/10000）調整。 |
| **`slot-playfield/SlotPlayfieldSidebar.tsx`** | 下方兩張卡：下注參數摘要 + paytable 唯讀列表。 |

---

### 大廳 UI（`src/components/`、`src/app/(lobby)/games/slots/`）

| 檔案 | 做什麼 |
|------|--------|
| **`components/ui/GameThemeCard.tsx`** | **遊戲圖卡**：4:5、底圖、底部漸層、標題；可標**遊戲類型**（如 Slots）；非開放時灰階 + 不可點。 |
| **`components/home/HomeHighlightsSection.tsx`** | 首頁「熱門遊戲」：其中一張卡連到 Italian Brainrot。 |
| **`app/(lobby)/games/slots/page.tsx`** | **老虎機列表頁**：用靜態陣列畫多張 `GameThemeCard`，並帶入可用性。 |
| **`app/(lobby)/games/slots/[id]/page.tsx`** | **單一主題頁路由（薄）**：`await params` → 查 config／placeholder／可用性 → 交給對應的 view。 |
| **`app/(lobby)/games/slots/[id]/slot-game-page-views.tsx`** | **同一路由的四種畫面**：僅圖卡 placeholder、找不到 id、有主題但不可玩、可玩（轉輪 + 開發備註）。與 `page.tsx` 分檔避免一支檔案塞滿分支。 |

---

## 需要每個資料夾都放 README 嗎？

**不必。** 維護時以本檔 + 程式**檔頭註解**為主即可；若之後模組再變大，再拆「架構圖」或「ADR」較划算。

---

## 資料流（一句話）

**`themes/*.ts` → `getSlotThemeConfig` → `SlotThemedPlayfield` → `randomColumns` / `evaluateLineWins` → `SlotSpinResult` + 轉輪高亮。**
