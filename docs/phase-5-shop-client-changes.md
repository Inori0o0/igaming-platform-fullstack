# Phase 5 商店／購物車／結帳 — 變更摘要（白話說明）

本文件對應 [`vacant_igaming_portfolio_2dba8ef1.plan.md`](../vacant_igaming_portfolio_2dba8ef1.plan.md) **Phase 5** 的實作與相關檔案說明，方便之後接手的人快速對應「檔案在幹嘛」。

**SQL 執行順序**請以 [`docs/sql/README.md`](./sql/README.md) 為準。

---

## 資料庫與遷移（`docs/sql/`）

| 檔案 | 做什麼（白話） |
|------|----------------|
| `phase-6-shop-orders-migration.sql` | 商店商品、variants、orders、order_items、entitlements、圖片 bucket 等；舊庫相容的 `ALTER`／補欄位（例如 `total_amount`、`price_at_purchase`）。**這是「真實 schema」的主要來源。** |
| `phase-6-shop-checkout-rpc-migration.sql` | 建立 **`checkout_shop_order`** RPC：扣錢、寫訂單、扣庫存、套用優惠券邏輯；`SECURITY DEFINER` + `GRANT authenticated`。前端用 `supabase.rpc('checkout_shop_order', …)` 呼叫。 |
| `phase-6-shop-coupons-*.sql` | 優惠券 enum／欄位（含 `free_shipping`）、seed；**須依 README 順序**（先跑 enum 再跑 fulfillment）。 |
| `phase-6-shop-admin-stub.sql` | **僅參考 stub**，實際表結構以 `phase-6-shop-orders-migration.sql` 為準；不要當成要執行的唯一指令稿。 |
| `README.md` | 遷移檔順序與注意事項；**不要對已有資料的庫重跑 phase-0 覆蓋**。 |

---

## 前端 — 型別與目錄（`client-portal/src/shop/`）

| 檔案 | 做什麼（白話） |
|------|----------------|
| `types.ts` | 商品型別：`Product` 含 **`dbProductId`**（後端 UUID），與前端 slug 的 `id` 分開，方便 RPC 對應 `products.id`。 |
| `products.ts` | 靜態／備援商品清單與映射（與 `fetchShopCatalog` 搭配）。 |
| `fetchShopCatalog.ts` | 從 Supabase 拉商品列並 map 成 `Product`（含 `dbProductId`）。 |
| `stock.ts` | 依 variant 庫存判斷「加車／加數量」是否允許；邏輯單元測試在 `stock.test.ts`。 |
| `cartLineKey.ts` | **React `key`**：同一商品多尺寸時用 `slug::尺寸`，避免列表 key 重複。 |

---

## 前端 — 購物車與金額（`client-portal/src/store/`）

| 檔案 | 做什麼（白話） |
|------|----------------|
| `cartTypes.ts` | 購物車專用型別（`CartLineItem`、`CouponState` 等），**不依賴 Supabase**，方便測試與 `cartSummary` 共用。 |
| `cartSummary.ts` | **純函式**：小計、運費、折扣、總額；結帳頁與 Vitest 共用，**不 import cartStore**（避免牽動 client）。 |
| `cartStore.ts` | Zustand：加車、改數量、優惠券、localStorage、`checkoutSuccess` 清空等；金額顯示請用 `calculateCartSummary`。 |
| `shopCatalogStore.ts` | （既有）商店目錄快取；`cartStore` 取 catalog 快照時會用到。 |

---

## 前端 — 結帳與 RPC（`client-portal/src/lib/`、`components/shop/`）

| 檔案 | 做什麼（白話） |
|------|----------------|
| `lib/shopCheckout.ts` | 組 **`checkout_shop_order`** 的 `p_lines`/`p_coupon_code`/`p_shipping`；**`product_id` 必須是資料庫 UUID**（`dbProductId`）。 |
| `useCheckoutViewModel.ts` | 結帳頁邏輯：表單、呼叫 RPC、解析回傳 `order_id`、成功後 **`router.replace` 到 `/checkout/success`**、錢包 hydrate；含防重複送出 lock。 |
| `addToCart/*`、`AddToCartPanel.tsx` | 商品詳情加車 UI 與 hook 拆分（view / message / hook）。 |
| `CartItemsCard.tsx`、`CartLineItem.tsx`、`useCartViewModel.ts`、`CartCouponCard.tsx`、`CartSummaryCard.tsx` 等 | 購物車頁面區塊與試算。 |

---

## 前端 — 頁面路由（`client-portal/src/app/(lobby)/`）

| 路徑 | 做什麼（白話） |
|------|----------------|
| `shop/page.tsx` | 商店入口與說明文案。 |
| `shop/[id]/page.tsx` | 商品詳情（加車面板）。 |
| `cart/page.tsx` | 購物車列表與前往結帳。 |
| `checkout/page.tsx` | 結帳表單（實體需填收件資訊）+ 確認扣款。 |
| `checkout/success/page.tsx` | 訂單完成頁（可帶 `orderId` query）。 |
| `profile/orders/page.tsx` | 訂單列表。 |
| `profile/orders/[id]/page.tsx` | 訂單詳情。 |

---

## 前端 — 個人中心訂單（`client-portal/src/components/profile/orders/`）

| 檔案 | 做什麼（白話） |
|------|----------------|
| `types.ts` | 列表／詳情列與 Supabase select 形狀對齊的型別。 |
| `useProfileOrders.ts` | 拉 orders 列表、重試、複製訂單 id；**effect 內用 `setTimeout(0)` 延後 setState** 以符合 lint／compiler 規則。 |
| `useProfileOrderDetail.ts` | 單筆訂單詳情；同上延後 setState 模式。 |
| `ProfileOrdersBody.tsx`、`ProfileOrderRow.tsx`、`ProfileOrderDetailView.tsx` | 列表／詳情 UI。 |
| `shopProductImageUrl.ts` | 由 bucket / object path 組出圖片 URL。 |
| `orderDisplay.ts` | 狀態／金額等顯示用 helper。 |

---

## 錢包與交易（`client-portal/src/components/wallet/`、`store/walletStore.ts`）

| 檔案 | 做什麼（白話） |
|------|----------------|
| `walletStore.ts` | 含 `purchase` 等交易類型；商店扣款會出現在交易紀錄。 |
| `constants.ts`、`TransactionFilters.tsx` | 交易列表篩選與顯示標籤（含購物相關）。 |

---

## 測試（`client-portal/src/`）

| 檔案 | 做什麼（白話） |
|------|----------------|
| `shop/stock.test.ts` | 庫存邊界（加車／數量上限）。 |
| `lib/shopCheckout.test.ts` | RPC payload 組裝（UUID、尺寸、運送欄位）。 |
| `store/cartStore.summary.test.ts` | `calculateCartSummary` 與優惠券／運費。 |

---

## 靜態資源（`client-portal/public/products/`）

商品圖片（例如 `vacant_*`、`triplet_*`）：供目錄 `image` 路徑使用，**不需在程式裡逐張列名**，只要與 `products.ts`／DB 設定的路徑一致即可。

---

## 與計畫書的對應

- **Phase 5.1～5.5**（商品展示、清單、購物車、結帳、訂單歷史）在 client 與 Supabase 端已可串成**實際扣款**流程（非純 mock）。細節仍以本 repo 程式與 `docs/sql` 為準。

若只記一個重點：**結帳時 `product_id` 用 DB 的 UUID（`dbProductId`），列表用 slug；RPC 與前端計算公式要與 migration 內邏輯一致。**
