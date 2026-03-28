# 本次對話修改檔案說明（Wallet + Home）

> 目的：整理這次對話中新增、修改、刪除過的檔案，並用「技術說明 + 白話文」快速理解。

## 一、Wallet 功能調整

### `client-portal/src/store/walletStore.ts`
- 技術說明：Wallet 的 Zustand 狀態管理已升級成「訪客本地 + 登入落 Supabase」雙模式；登入後會讀寫 `users/wallets/transactions`，訪客維持 localStorage，並加入 claim/deposit 防濫用限制（冷卻、次數、單筆與日上限）。
- 白話文：這是你錢包的「大腦」，現在不只記在瀏覽器，登入後會真的寫進資料庫，而且有防狂點/防爆量機制。

### `client-portal/src/components/layout/header/HeaderWalletSummary.tsx`
- 技術說明：Header 右上角錢包摘要改為讀取 store 真實資料，不再固定顯示 `0 vAcAnt Coins`。
- 白話文：頂部錢包數字現在會跟著你實際錢包變化，不是死資料。

### `client-portal/src/app/(lobby)/wallet/page.tsx`
- 技術說明：由 placeholder 升級為實際可操作頁，後續又調整為 VAC 主幣模式，接入匯率與拆分後元件。
- 白話文：錢包頁從空殼變成可用頁面，並且現在是「主打 VAC」。

### `client-portal/src/components/wallet/constants.ts`
- 技術說明：集中交易文案與分頁常數。
- 白話文：把常用固定值收在同一處，後續改字更方便。

### `client-portal/src/components/wallet/format.ts`
- 技術說明：集中金額與時間格式化函式。
- 白話文：顯示數字和時間的規則統一，避免每個檔案各寫各的。

### `client-portal/src/components/wallet/BalanceCards.tsx`
- 技術說明：改為 4 卡（VAC/BTC/ETH/USDT），其中 BTC/ETH/USDT 為由 VAC 換算的等值顯示。
- 白話文：現在看到 4 張卡，但真正持有還是 VAC；其他是「換算值」，不是獨立資產持有。

### `client-portal/src/components/wallet/WalletActionsCard.tsx`
- 技術說明：重構為組裝層，操作固定送 `VAC`，並拆分為三個 action 子元件。
- 白話文：這張卡只負責把「充值、提領、免費領取」拼起來，並且都只操作 VAC。

### `client-portal/src/components/wallet/actions/DepositAction.tsx`
- 技術說明：充值 UI 與輸入邏輯拆出，保留自訂輸入框並加上單筆 `200,000 VAC` 限制與提示。
- 白話文：專門管「加錢」的區塊，現在超過上限不能送出。

### `client-portal/src/components/wallet/actions/WithdrawAction.tsx`
- 技術說明：提領申請 UI 與輸入邏輯拆出。
- 白話文：專門管「提領申請」的區塊。

### `client-portal/src/components/wallet/actions/ClaimAction.tsx`
- 技術說明：免費領取 UI 區塊拆出，文案同步為每次 `+6767 VAC`。
- 白話文：專門管「領取免費 6767 coins」按鈕區塊。

### `client-portal/src/components/wallet/TransactionsCard.tsx`
- 技術說明：保留狀態（篩選/分頁）並改為組裝子元件；後續已移除「幣別篩選」，只留類型篩選。
- 白話文：交易列表這層只管邏輯，而且現在更符合 VAC-only 規則。

### `client-portal/src/components/wallet/TransactionFilters.tsx`
- 技術說明：交易篩選 UI 拆出。
- 白話文：專門管篩選下拉選單。

### `client-portal/src/components/wallet/TransactionTable.tsx`
- 技術說明：交易列表表格渲染拆出。
- 白話文：專門管表格長相與資料列。

### `client-portal/src/components/wallet/TransactionPagination.tsx`
- 技術說明：分頁 UI 與按鈕拆出。
- 白話文：專門管上一頁/下一頁。

### `client-portal/src/components/wallet/useUsdtRates.ts`
- 技術說明：封裝匯率抓取 hook，首次載入與每 60 秒輪詢。
- 白話文：定期去抓 BTC/ETH/VAC 對 USDT 的資料。

### `client-portal/src/components/wallet/UsdtRates.tsx`
- 技術說明：集中顯示匯率摘要（載入中/錯誤/正常/快取）。
- 白話文：用一個區塊統一顯示匯率，不用每張卡都重複。

### `client-portal/src/app/api/rates/route.ts`
- 技術說明：新增 server route 對外提供匯率資料；來源 CoinGecko、60 秒快取、失敗時回傳 stale 快取；VAC 固定 0.01 USDT。
- 白話文：前端不直接打第三方 API，而是先打你自己的 API，比較穩定也好換來源。

### `docs/sql/phase-0-schema-bootstrap.sql`
- 技術說明：新庫用的基礎 schema（users、wallets、舊版 products/orders 等）；與錢包／商店後續 migration 的順序見 `docs/sql/README.md`。
- 白話文：從零建資料庫時先跑這包，後面 phase-3 才有表可以改。

### `docs/sql/phase-3-wallet-vac-migration.sql`
- 技術說明：新增錢包升級 migration，包含 `claim` enum、`transactions.status`、`balance_after`、VAC-only constraint、wallet 唯一約束與 RLS policy。
- 白話文：這份 SQL 是把資料庫升級成「能正式支援 VAC 主幣真實儲存」的關鍵腳本。

### `client-portal/src/types/rates.ts`
- 技術說明：抽共用型別 `UsdtRates`，供 API/Hook/UI 共用。
- 白話文：匯率資料格式只定義一次，改起來不會漏。

## 二、Home 首頁免費領取區塊

### `client-portal/src/components/home/HomeHeroSection.tsx`
- 技術說明：右側 hero 圖下方加入 `HomeClaimFreeCoinsOverlay`，形成同一視覺區塊。
- 白話文：首頁右邊圖片下面直接看到大顆「免費領取」按鈕，動線更直覺。

### `client-portal/src/components/home/HomeClaimFreeCoinsOverlay.tsx`
- 技術說明：改為精簡組裝層，負責外層高亮框與呼叫 hook + CTA button（大按鈕樣式與回饋提示已拆分）。
- 白話文：這層現在只負責「包裝外觀」，按鈕行為與樣式分開維護。

### `client-portal/src/components/home/useClaimFreeCoinsOverlay.ts`
- 技術說明：封裝首頁領取邏輯（hydrate、播放 `claim-click.mp3`、成功提示定時顯示）。
- 白話文：把按鈕背後行為集中在 hook，元件更乾淨。

### `client-portal/src/components/home/ClaimFreeCoinsCTAButton.tsx`
- 技術說明：純 UI 大按鈕元件，包含按壓感、hover/active、成功 badge。
- 白話文：這顆就是你首頁那顆超大可點擊按鈕。

## 三、靜態資產

### `client-portal/public/sounds/claim-click.mp3`
- 技術說明：首頁領取按鈕點擊音效。
- 白話文：按下大按鈕時的回饋聲音。

### `client-portal/public/point_down.png`
- 技術說明：首頁 Hero 圖片素材。
- 白話文：首頁右側展示圖。

### `client-portal/public/triplet_hero.png`
- 技術說明：新增的備用 Hero 素材（目前未直接引用）。
- 白話文：備用主視覺圖檔。

## 四、曾出現但已移除/替換

### `client-portal/src/components/wallet/CurrencySwitcherCard.tsx`
- 技術說明：已移除，不再提供 VAC/BTC/ETH 切換持有操作。
- 白話文：錢包不再讓你切成 BTC/ETH 來操作。

### `client-portal/src/components/wallet/WalletRatesBanner.tsx`
- 技術說明：由 `UsdtRates.tsx` 取代。
- 白話文：匯率區塊換成新的版本，命名也更直觀。

### `client-portal/src/components/home/HomeSplashGate.tsx`
- 技術說明：已移除；首頁不再單獨控制 Splash，改由主站殼統一控制。
- 白話文：首頁不再自己管開場動畫，避免重疊與行為不一致。

### `client-portal/src/components/loading/useInitialSplash.ts`
- 技術說明：已移除；Splash 策略簡化為 `isAuthLoading` 直接控制。
- 白話文：不再用 session 首次判斷，邏輯更直觀。

## 五、目前整體狀態（一句話）

- 技術說明：錢包流程已收斂為 VAC 主幣操作；BTC/ETH/USDT 以匯率換算顯示為主；首頁有高亮的大型免費領取按鈕，含音效與成功回饋。
- 白話文：現在主線很清楚：玩家主要用 VAC，其他幣種拿來看換算，首頁也有很醒目的一鍵領幣入口。

