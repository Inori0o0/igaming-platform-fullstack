import { ProductCatalog } from "@/src/components/shop/catalog/ProductCatalog";
import { ShopCatalogSeed } from "@/src/components/shop/catalog/ShopCatalogSeed";
import { loadShopCatalogForApp } from "@/src/shop/fetchShopCatalog";
import { productCategories, type ProductCategory } from "@/src/shop/types";

export const dynamic = "force-dynamic";

function resolveActiveCategory(raw: string | string[] | undefined): ProductCategory {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (productCategories as readonly string[]).includes(value ?? "")
    ? (value as ProductCategory)
    : "all";
}

type ShopPageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [products, params] = await Promise.all([loadShopCatalogForApp(), searchParams]);
  const activeCategory = resolveActiveCategory(params.category);

  return (
    <main className="space-y-6">
      <ShopCatalogSeed products={products} />
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

      <ProductCatalog products={products} activeCategory={activeCategory} />
    </main>
  );
}
