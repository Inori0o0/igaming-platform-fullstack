import { Card } from "@/src/components/ui/Card";
import { ProductCatalog } from "@/src/components/shop/ProductCatalog";
import { shopProducts } from "@/src/shop/products";

export default function ShopPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Shop
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          商品商店
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          先以 mock data 完成 5.1 商品展示與 5.2 商品清單，後續可直接替換成真實資料來源。
        </p>
      </div>

      <ProductCatalog products={shopProducts} />

      <Card
        title="下一步"
        description="5.3 / 5.4 完成後，商品詳情頁可直接連動購物車與結帳。"
      >
        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
          <li>加入 / 移除購物車與數量調整</li>
          <li>優惠券驗證與折扣計算</li>
          <li>checkout 多步驟流程 + 扣 VAC</li>
        </ul>
      </Card>
    </main>
  );
}

