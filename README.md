# vAcAnt iGaming Portfolio

> 文件以目前 repo 程式碼與 `docs/sql/schema.sql` 為準；若文字與實作不一致，請以程式與資料庫 schema 為準。

## 中文（繁體）

### 專案簡介

這是一個 iGaming 作品集 monorepo，包含：

- `client-portal/`：玩家端（Next.js 16 + React 19）
- `admin-dashboard/`：管理後台（Vite + React 19）
- `docs/`：資料庫、功能對照與模組說明文件

資料層使用 Supabase（Auth、Postgres、Storage），前後台共用同一組核心資料表與 API。

### 專案結構

```text
.
├── client-portal/        # 玩家端（Next.js）
├── admin-dashboard/      # 管理後台（Vite）
├── docs/                 # 文件索引、SQL、架構說明
└── vacant_igaming_portfolio_2dba8ef1.plan.md
```

### 快速開始

#### 1) 啟動 client-portal

```bash
cd client-portal
npm install
```

建立 `client-portal/.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

執行：

```bash
npm run dev
```

#### 2) 啟動 admin-dashboard

```bash
cd admin-dashboard
npm install
```

建立 `admin-dashboard/.env`：

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

執行：

```bash
npm run dev
```

### 測試與品質

- `client-portal` 目前使用 Vitest：
  - `npm test`
  - `npm run test:coverage`
- 最近一次覆蓋率：Statements 84.56%、Branches 83.03%、Functions 82.53%、Lines 86.79%

### 資料庫與文件入口

- 文件索引：`docs/README.md`
- SQL 執行順序：`docs/sql/README.md`
- 參考 schema：`docs/sql/schema.sql`
- ER/架構說明：`docs/sql/ARCHITECTURE.md`

### 驗收建議流程

1. 起 `client-portal`，確認 Auth、Shop/Cart/Checkout、Games、Profile 主要流程。
2. 起 `admin-dashboard`，確認登入、儀表板、商品/訂單/優惠券管理流程。
3. 若需對齊資料庫，先看 `docs/sql/README.md` 的 migration 順序再操作。

---

## English

### Overview

This repository is an iGaming portfolio monorepo with:

- `client-portal/` (player-facing app, Next.js 16 + React 19)
- `admin-dashboard/` (admin app, Vite + React 19)
- `docs/` (database docs, architecture notes, implementation guides)

Supabase (Auth/Postgres/Storage) is used as the shared backend.

### Quick Start

For `client-portal`:

```bash
cd client-portal
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

For `admin-dashboard`:

```bash
cd admin-dashboard
npm install
```

Create `.env`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Run:

```bash
npm run dev
```

### Testing

`client-portal` uses Vitest:

- `npm test`
- `npm run test:coverage`

### Docs Entry Points

- `docs/README.md`
- `docs/sql/README.md`
- `docs/sql/schema.sql`
- `docs/sql/ARCHITECTURE.md`

