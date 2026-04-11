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
            在這裡選擇 vAcAnt 服飾、數位收藏與限定造型，結帳時會使用錢包中的 vAcAnt Coins。
          </p>
        </div>

        <ProductCatalog products={products} />
      </main>
    </>
  );
}
