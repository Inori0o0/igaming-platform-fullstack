admin-dashboard/src/
├── components/
│ ├── layout/
│ │ ├── Sidebar.tsx ← 側邊導覽列（可收合）
│ │ ├── Header.tsx ← 頂部 Header（用戶資訊 + 登出）
│ │ └── Layout.tsx ← 整體框架
│ ├── ui/
│ │ ├── Button.tsx ← 5 種 variant
│ │ ├── Badge.tsx ← 6 種 variant
│ │ ├── Card.tsx ← Card + CardHeader + CardContent
│ │ ├── Input.tsx ← 帶 label/error/icon
│ │ ├── Select.tsx
│ │ ├── Table.tsx ← 完整 Table 元件組
│ │ └── StatCard.tsx ← KPI 卡片
│ └── ProtectedRoute.tsx ← Admin 角色保護
├── lib/
│ ├── supabase.ts ← Supabase client
│ └── utils.ts ← cn / formatNumber / formatDate
├── stores/
│ └── authStore.ts ← Zustand Auth（admin metadata 判斷）
├── types/index.ts ← 所有 DB 型別
└── pages/
├── LoginPage.tsx ← 登入頁
├── DashboardPage.tsx ← 儀表板（KPI + 折線圖 + 圓餅圖）
├── UsersPage.tsx ← 用戶列表（搜尋/分頁）
├── UserDetailPage.tsx ← 用戶詳情（錢包/遊戲/訂單）
├── GamesPage.tsx ← 遊戲統計（橫條圖）
├── TransactionsPage.tsx ← 交易紀錄（篩選/分頁）
├── ProductsPage.tsx ← 商品管理（上下架切換）
├── OrdersPage.tsx ← 訂單管理（狀態更新）
└── SettingsPage.tsx ← 優惠券管理 + 免費幣設定
