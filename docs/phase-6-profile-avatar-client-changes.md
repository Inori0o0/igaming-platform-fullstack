# Phase 6.1 個人資料：本次前端變更說明

> **文件時效**：最後對照本 repo 約 **2026-04-11**；若與實際程式或資料庫不一致，**以程式與線上 schema 為準**。

這份文件整理本輪「個人資料 / 頭像編輯」相關改動，包含每個檔案做了什麼、為什麼要這樣做，以及白話版說明。

---

## 1) 功能目標（本輪）

- 完成 `Profile 6.1` 的核心體驗：
  - 顯示名稱編輯
  - 使用者自傳頭像（Supabase Storage）
  - 商店頭像切換（未解鎖鎖定）
  - 頭像顯示優先序一致化
- 改善 UI：
  - 編輯頭像改用 modal，並拆成獨立元件
  - Profile 主區塊雙欄比例調整（左 3/5、右 2/5）
- 修正穩定性：
  - 上傳頭像 `onChange` 的 event 釋放錯誤
  - 頭像模糊（`next/image sizes` 與實際顯示尺寸不一致）

---

## 2) 檔案變更總覽（程式 + 白話）

### `client-portal/src/components/profile/useProfileAvatarEditor.ts`

- **程式做了什麼**
  - 集中處理 profile/avatar 的資料讀寫：
    - `users`（display_name、avatar_url）
    - `user_avatar_selection`（目前商店頭像）
    - `user_entitlements`（哪些頭像已解鎖）
  - 實作 `uploadCustomAvatar`、`clearCustomAvatar`、`selectShopAvatar`、`restoreGoogleAvatar`。
  - 自傳頭像改為「每位使用者僅保留一張」：上傳新圖成功後會清理舊圖；清除自傳/改回 Google 也會刪除既有自傳檔案。
  - 計算預覽頭像 `previewAvatarUrl`（有明確優先序）。
- **白話解釋**
  - 這支 hook 就是「頭像與名稱的總控台」。
  - UI 不需要知道 Supabase 細節，只要呼叫它提供的 action。

### `client-portal/src/components/profile/useProfileOverviewViewModel.ts`

- **程式做了什麼**
  - 管理 profile 頁面的 UI 狀態與操作（toast、儲存中、上傳中、統計資料）。
  - 聚合 `useProfileAvatarEditor` + `walletStore` + `orders` count。
- **白話解釋**
  - 這是 page 的 view-model，讓 `page.tsx` 只負責組裝畫面，不塞業務邏輯。

### `client-portal/src/store/authStore.ts`

- **程式做了什麼**
  - `initAuth()` 增加 profile 同步，讓顯示名稱與頭像來源更一致。
  - 頭像來源邏輯：`users.avatar_url` > `user_avatar_selection` > Google metadata。
  - 對 Google `avatar_url` 做解析度正規化（例如 `s96-c` 升為 `s512-c`），減少個人中心放大後模糊問題。
- **白話解釋**
  - Header、Profile 等地方不會各自亂抓頭像，來源有統一規則。
  - Google 原始圖常偏小，這裡會自動改抓較大尺寸。

### `client-portal/src/components/profile/ProfileIdentityCard.tsx`

- **程式做了什麼**
  - 負責 profile 主區塊（大頭像、編輯按鈕、顯示名稱輸入與儲存）。
  - `editOpen` 控制頭像編輯 modal 的開關。
  - 傳遞 `remainingShopAvatars` 給 modal。
  - 首屏主頭像加上 `loading="eager"`，避免被判定 LCP 時延後載入。
- **白話解釋**
  - 這張卡現在只專心做「主畫面」，不再塞一大段 modal 內容。
  - 使用者一打開頁面就會優先下載主頭像，體感更順。

### `client-portal/src/components/profile/ProfileAvatarEditorModal.tsx`（新增）

- **程式做了什麼**
  - 將頭像編輯 UI 單獨拆檔：
    - 目前頭像
    - 上傳頭像入口
    - 商店頭像列表（未解鎖遮罩）
  - 處理「第三排才開捲動」邏輯。
  - 修正 file input 在 `await` 後 `currentTarget` 可能為 `null` 的錯誤。
- **白話解釋**
  - 把複雜 modal 抽出來後，主卡片排版更好維護，也比較容易 debug。

### `client-portal/src/components/profile/ProfileStatsCard.tsx`

- **程式做了什麼**
  - 統計資訊卡（VAC、遊戲次數、總贏取、訂單數）版面調整。
- **白話解釋**
  - 右側統計卡獨立管理，避免跟左側編輯卡互相污染。

### `client-portal/src/components/profile/ProfileFeedbackToast.tsx`（新增）

- **程式做了什麼**
  - 提供 success/error 的簡單 toast UI。
- **白話解釋**
  - 儲存/上傳/切換頭像後，使用者會立即看到成功或失敗訊息。

### `client-portal/src/app/(lobby)/profile/page.tsx`

- **程式做了什麼**
  - 透過 view-model 取得狀態，組裝 `ProfileIdentityCard` + `ProfileStatsCard`。
  - 雙欄比例調整為 `3/5`、`2/5`（桌機）。
  - 補上 `min-w-0` 避免欄位互相擠壓。
- **白話解釋**
  - 這頁現在是「組件排版層」，不是業務邏輯層。

### `client-portal/src/components/ui/Avatar.tsx`

- **程式做了什麼**
  - 支援外部覆蓋 `sizes`，避免大頭像場景只載入小圖。
- **白話解釋**
  - 之前圖片糊，是因為宣告尺寸太小；現在可明確告訴瀏覽器要抓大圖。

### `client-portal/src/components/ui/Card.tsx`

- **程式做了什麼**
  - 調整為 `flex` 版容器，children 可吃滿高度（`hasMeta` 分支）。
- **白話解釋**
  - 某些卡片需要垂直置中或撐滿高度，這版更穩定。

### `client-portal/src/lib/supabaseStorage.ts`（新增）

- **程式做了什麼**
  - 統一產生 Supabase public object URL。
- **白話解釋**
  - 避免每個檔案重複拼 URL，出錯率更低。

### `docs/sql/phase-6-user-avatars-upload-migration.sql`（新增）

- **程式做了什麼**
  - 建立 `user-avatars` bucket 與對應 policy（自己的資料夾自己寫）。
- **白話解釋**
  - 沒這個 migration，前端上傳頭像會被 RLS 擋掉。

### `docs/sql/README.md`

- **程式做了什麼**
  - 補上 `4b phase-6-user-avatars-upload-migration.sql` 執行步驟說明。
- **白話解釋**
  - 讓 DBA/開發者知道這支 migration 是 Phase 6.1 必跑。

---

## 3) 本輪特別注意

- `ProfileShopAvatarCard.tsx` 目前不再掛在 `profile/page.tsx`，因為商店頭像已整合到 `ProfileAvatarEditorModal`。
- 頭像清晰度已改為可控：
  - 大頭像傳 `sizes="128px"`
  - modal 頭像傳 `sizes="96px"`
- `user-avatars` bucket 以「每位使用者保留一張」為策略，避免同一帳號長期累積多張舊圖。
- Google avatar URL 會自動升級到較高尺寸（目前設定 `s512`），改善 Google 頭像在大尺寸 UI 的清晰度。

---

## 4) 建議後續（可選）

- 若未來要做更大的頭像顯示，可再針對 `Avatar` 增加 `pixelSize` 顯式欄位，減少靠 className 推測的風險。
- 若 profile 區塊未來再複雜化，可把主區塊寬度常數（320/420 等）抽成共用常數。

