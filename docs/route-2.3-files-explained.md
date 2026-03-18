## 2.3 主要頁面路由（本次新增檔案逐個解釋）

這份文件專門說明我在 `vacant_igaming_portfolio_2dba8ef1.plan.md` 的 **2.3 主要頁面路由**落地時，於 `client-portal/src/app/` 新增（以及搬移/刪除）了哪些檔案，並逐個用「工程角度」+「白話文」解釋它們的用途。

---

## 整體設計重點（先用白話說清楚）

- **我們把「主站殼」（Header/Sidebar/Footer）只套在主要頁面上**：例如 `/shop`、`/games`、`/wallet` 等。
- **登入 callback 頁不套主站殼**：避免 callback 畫面出現 Header/Sidebar 閃一下，造成 UI 抖動與 hydration 風險。
- **Profile 用 nested layout**：`/profile/*` 子頁共用同一組 tabs，後續加頁很省力。

---

## 你計畫文件 2.3 的路由清單（對照）

對照 `vacant_igaming_portfolio_2dba8ef1.plan.md` 2.3 的路由目標（節錄）：

- `/`
- `/games`、`/games/slots`、`/games/slots/[id]`、`/games/blackjack`、`/games/baccarat`、`/games/lottery`
- `/shop`、`/shop/[id]`
- `/cart`、`/checkout`
- `/profile`、`/profile/history`、`/profile/orders`、`/profile/achievements`
- `/wallet`

本次的改動就是把上面這些「入口頁」**先用一致的 UI 殼與 placeholder 內容鋪好**，讓導航可以完整跑通，後續再逐頁加真功能（遊戲引擎、購物車、錢包、資料庫串接）。

---

## Route Groups：為什麼會看到 `(lobby)`、`(auth)`

在 Next.js App Router 裡，資料夾名稱用括號包起來（例如 `(lobby)`）叫 **Route Group**：

- 它 **不會出現在 URL** 裡
- 但可以用來 **分不同的 layout 包層**

白話：把「需要主站殼」的頁面放到 `(lobby)`，把「不需要主站殼」的頁面放到 `(auth)`，URL 還是原本的 `/shop`、`/auth/callback`，但包的 layout 不一樣。

---

## 根層（全站）檔案：`client-portal/src/app/layout.tsx`

### `client-portal/src/app/layout.tsx`
- **用途（工程角度）**：全站最外層 Root Layout。這裡只保留「全站都需要」的 Provider 與元件，例如 `AuthProvider`、`AuthModal`，以及 `globals.css`。
- **白話文**：這是整個網站最外面那一層骨架。無論你在哪一頁，都會先經過這裡。

> 注意：本次改動把 `ClientLayoutShell` 從 root 拿掉，改由 `(lobby)` 才套，避免 `/auth/callback` 被套到主站殼。

---

## (lobby) 主站殼：`client-portal/src/app/(lobby)/layout.tsx`

### `client-portal/src/app/(lobby)/layout.tsx`
- **用途（工程角度）**：把 `ClientLayoutShell` 套到 `(lobby)` 底下所有頁面。也就是 Header/Sidebar/Footer + 主內容區。
- **白話文**：只要是「主站內正常瀏覽」的頁（大廳、商店、錢包、個人中心），就會長得一樣，有同一套導覽。

---

## (lobby) 首頁：`client-portal/src/app/(lobby)/page.tsx`

### `client-portal/src/app/(lobby)/page.tsx`（對應 `/`）
- **用途（工程角度）**：首頁入口；目前是 hero + 熱門遊戲/精選商品的版位，並使用 `authStore.isLoading` 做簡單載入狀態。
- **白話文**：這就是「你進站第一眼看到的首頁」，先把視覺與 CTA（登入/訪客）放好，之後再接真的內容。

---

## (lobby) Games 系列

### `client-portal/src/app/(lobby)/games/page.tsx`（對應 `/games`）
- **用途**：遊戲大廳入口頁，提供 Slots / Blackjack / Baccarat / Lottery 的導向卡片。
- **白話**：像遊戲選單首頁，先能點進各類遊戲。

### `client-portal/src/app/(lobby)/games/slots/page.tsx`（對應 `/games/slots`）
- **用途**：Slots 主題列表頁，列出 3 個主題並連到 `/games/slots/[id]`。
- **白話**：老虎機「選遊戲」頁面（先用假資料、假入口）。

### `client-portal/src/app/(lobby)/games/slots/[id]/page.tsx`（對應 `/games/slots/[id]`）
- **用途**：單一 Slots 遊戲殼頁；用 `params.id` 作為遊戲識別，並預留 reels grid 與 bet panel 的版位。
- **白話**：你點進某台老虎機後看到的「遊戲畫面」，目前先放框架，之後再把轉輪、下注、結算做進來。

### `client-portal/src/app/(lobby)/games/blackjack/page.tsx`（對應 `/games/blackjack`）
- **用途**：Blackjack 頁面殼（桌面區 + 操作區 placeholder）。
- **白話**：二十一點遊戲頁的框架，之後在這裡做發牌、操作按鈕。

### `client-portal/src/app/(lobby)/games/baccarat/page.tsx`（對應 `/games/baccarat`）
- **用途**：Baccarat 頁面殼（閒/莊/和 placeholder + 簡化路單 placeholder）。
- **白話**：百家樂遊戲頁框架，先把主要區塊擺好。

### `client-portal/src/app/(lobby)/games/lottery/page.tsx`（對應 `/games/lottery`）
- **用途**：Lottery 頁面殼（轉盤/刮刮樂/數字彩入口的卡片版位）。
- **白話**：彩票區頁面，先把三種玩法入口放上去，之後做動畫與歷史。

---

## (lobby) Shop 系列

### `client-portal/src/app/(lobby)/shop/page.tsx`（對應 `/shop`）
- **用途**：商品列表頁殼（目前用假商品陣列），點商品進 `/shop/[id]`。
- **白話**：商店首頁，先能看到商品卡片並點進去。

### `client-portal/src/app/(lobby)/shop/[id]/page.tsx`（對應 `/shop/[id]`）
- **用途**：商品詳情殼頁；用 `params.id` 做識別，預留圖片、資訊、描述、加入購物車區塊。
- **白話**：單一商品的詳情頁，先擺好之後要放圖片/價格/加入購物車的位置。

---

## (lobby) 購物車與結帳

### `client-portal/src/app/(lobby)/cart/page.tsx`（對應 `/cart`）
- **用途**：購物車殼頁（空狀態 + 前往結帳的入口）。
- **白話**：你加了商品後會在這裡看到列表；現在先做空狀態。

### `client-portal/src/app/(lobby)/checkout/page.tsx`（對應 `/checkout`）
- **用途**：結帳流程殼頁（收件資訊/訂單摘要 placeholder）。
- **白話**：你按結帳後會來這裡，後續會把表單、扣 coins、完成頁加進來。

---

## (lobby) Wallet

### `client-portal/src/app/(lobby)/wallet/page.tsx`（對應 `/wallet`）
- **用途**：錢包殼頁（Coins/BTC/ETH 卡片 + 充值/提領/交易紀錄 placeholder）。
- **白話**：顯示你有多少幣、以及之後要放充值、提領、交易紀錄的位置。

---

## (lobby) Profile（nested layout）

### `client-portal/src/app/(lobby)/profile/layout.tsx`
- **用途**：`/profile/*` 的共用 layout，提供 tabs（總覽/歷史/訂單/成就）並包住子頁內容。
- **白話**：你進個人中心之後，上面那排切換頁籤每頁都一樣；這個檔案就是專門處理那個「共用外框」。

### `client-portal/src/app/(lobby)/profile/page.tsx`（對應 `/profile`）
- **用途**：個人中心總覽殼頁（摘要卡 + 快捷入口）。
- **白話**：個人中心的首頁，先放總覽版位，讓你之後接 user/wallet 統計。

### `client-portal/src/app/(lobby)/profile/history/page.tsx`（對應 `/profile/history`）
- **用途**：遊戲歷史殼頁（table + 統計 placeholder）。
- **白話**：你玩過哪些遊戲、贏多少，之後會在這頁看到。

### `client-portal/src/app/(lobby)/profile/orders/page.tsx`（對應 `/profile/orders`）
- **用途**：訂單歷史殼頁（orders table placeholder）。
- **白話**：你買過哪些商品、狀態如何，之後會在這頁看到。

### `client-portal/src/app/(lobby)/profile/achievements/page.tsx`（對應 `/profile/achievements`）
- **用途**：成就殼頁（先用 sample achievements 渲染卡片）。
- **白話**：成就牆，之後你達成條件就會解鎖。

---

## (auth) Auth Callback（不套主站殼）

### `client-portal/src/app/(auth)/auth/callback/page.tsx`（對應 `/auth/callback`）
- **用途（工程角度）**：處理 Google OAuth 回跳 `code`，呼叫 Supabase `exchangeCodeForSession`，成功後初始化 auth 並導回 `next` 或 `/`。
- **白話文**：Google 登入完成後會回到這頁，這頁負責把「臨時 code」換成「真的登入狀態」，然後把你送回你原本要去的頁面。

---

## 本次「搬移/刪除」的檔案（為什麼要這樣做）

### 刪除：`client-portal/src/app/page.tsx`
- **原因**：首頁改放到 `(lobby)/page.tsx`，讓 `/` 自然套到主站殼。
- **白話**：原本首頁在根目錄，現在把它搬到「主站區」裡，讓它自動有 Header/Sidebar。

### 刪除：`client-portal/src/app/auth/callback/page.tsx`
- **原因**：callback 改放到 `(auth)` group，避免套主站殼。
- **白話**：登入回跳頁不需要導覽列，所以把它搬到「不套殼」的區域。

---

## 你接下來最常用的「加功能入口」建議

- **先做 Slots 一個可玩版本**：從 `client-portal/src/app/(lobby)/games/slots/[id]/page.tsx` 開始把 reels/下注/結算做進來。
- **先做 Wallet 的 coins 與交易紀錄假資料**：在 `client-portal/src/app/(lobby)/wallet/page.tsx` 補上列表與篩選 UI。
- **Profile 的 tabs active 狀態**：可以在 `profile/layout.tsx` 用 `usePathname()` 做當前 tab 高亮。

