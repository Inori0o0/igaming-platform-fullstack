# client-portal

> 以目前程式碼與 `../docs/sql/schema.sql` 為準；若 README 與實作不一致，請以程式與 schema 為準。

## 中文（繁體）

### 這是什麼

玩家端入口網站（Next.js 16 + React 19），包含：

- Auth（訪客/登入）
- Wallet（VAC）
- Games（Slots / Blackjack / Baccarat / Lottery）
- Shop / Cart / Checkout
- Profile（identity / history / orders / achievements）

### 安裝與啟動

```bash
npm install
```

建立 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

啟動：

```bash
npm run dev
```

### 常用指令

- `npm run dev`：本機開發
- `npm run build`：建置
- `npm run start`：啟動 production build
- `npm run lint`：ESLint
- `npm test`：Vitest
- `npm run test:coverage`：覆蓋率

### 測試現況

- 現有 8 個測試檔（slots、blackjack、baccarat、shop、profile）
- 最近一次 coverage：Statements 84.56%、Branches 83.03%、Functions 82.53%、Lines 86.79%

### Loading 行為（現況）

- 全站 Auth 初始化：`ClientLayoutShell` 掛 `SplashScreen mode="fullscreen"`
- `/shop` 路由 loading：`ShopPageSplashLoading` 使用 `SplashScreen mode="inline"`（保留 Header/Sidebar）

詳細見：`src/components/loading/README.md`

### 資料庫與文件

- SQL 執行順序：`../docs/sql/README.md`
- 參考 schema：`../docs/sql/schema.sql`
- 架構圖：`../docs/sql/ARCHITECTURE.md`
- Shop 變更說明：`../docs/phase-5-shop-client-changes.md`

---

## English

### What this app is

Player-facing portal built with Next.js 16 + React 19, including:

- Auth (guest/login)
- Wallet (VAC)
- Games (Slots / Blackjack / Baccarat / Lottery)
- Shop / Cart / Checkout
- Profile (identity / history / orders / achievements)

### Setup

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Run:

```bash
npm run dev
```

### Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm test`
- `npm run test:coverage`

### Database & docs

- `../docs/sql/README.md`
- `../docs/sql/schema.sql`
- `../docs/sql/ARCHITECTURE.md`
