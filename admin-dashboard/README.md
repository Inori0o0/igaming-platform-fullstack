# admin-dashboard

> 以目前程式碼與 `../docs/sql/schema.sql` 為準；若 README 與實作不一致，請以程式與 schema 為準。

## 中文（繁體）

### 這是什麼

後台管理系統（Vite + React 19），主要功能包含：

- Dashboard（KPI / 圖表）
- Users / User Detail
- Games 統計
- Transactions
- Products
- Orders
- Coupons（位於 `/settings`）

路由由 `src/App.tsx` 管理，登入後透過 `ProtectedRoute` 進入主殼。

### 安裝與啟動

```bash
npm install
```

建立 `.env`：

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

啟動：

```bash
npm run dev
```

### 常用指令

- `npm run dev`：開發
- `npm run build`：TypeScript build + Vite build
- `npm run preview`：預覽 build
- `npm run lint`：ESLint

### 驗收建議流程

1. 進入 `/login` 並完成登入
2. 檢查首頁 KPI 與圖表
3. 到 Users / Transactions / Products / Orders 查看列表與篩選
4. 到 `/settings` 驗證優惠券 CRUD（新增、編輯、啟用/停用、軟刪除）

### 與資料庫文件的關係

- SQL 順序：`../docs/sql/README.md`
- 參考 schema：`../docs/sql/schema.sql`
- 架構圖：`../docs/sql/ARCHITECTURE.md`
- 後台結構說明：`../docs/structure-admin-dashboard.md`

---

## English

### What this app is

Admin dashboard built with Vite + React 19.

Main areas:

- Dashboard (KPI/charts)
- Users / User Detail
- Games analytics
- Transactions
- Products
- Orders
- Coupons (served at `/settings`)

Routing is defined in `src/App.tsx` and protected by `ProtectedRoute`.

### Setup

```bash
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

### Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

### Database/docs references

- `../docs/sql/README.md`
- `../docs/sql/schema.sql`
- `../docs/sql/ARCHITECTURE.md`
