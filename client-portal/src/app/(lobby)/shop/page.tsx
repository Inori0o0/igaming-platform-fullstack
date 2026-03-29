import { Card } from "@/src/components/ui/Card";
import { ProductCatalog } from "@/src/components/shop/ProductCatalog";
import { loadShopCatalogForApp } from "@/src/shop/fetchShopCatalog";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await loadShopCatalogForApp();

  return (
    <>
      <main className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Shop
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            商品商店
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            商品資料優先由 Supabase（products、product_variants）讀取；圖檔來自
            Storage 公開 bucket。若連線失敗或尚無資料，會改顯示本地備援目錄（僅供瀏覽，結帳需線上目錄與帳號）。
          </p>
        </div>

        <ProductCatalog products={products} />

        <Card
          title="購物與結帳"
          description="購物車、優惠券與結帳已串 Supabase；訂單與扣款以後端 RPC 為準。"
        >
          <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
            <li>加入／移除商品與調整數量、優惠券套用</li>
            <li>結帳時以錢包 VAC 扣款並建立訂單</li>
            <li>訂單紀錄請至個人中心「訂單歷史」查看</li>
          </ul>
        </Card>
      </main>
    </>
  );
}
