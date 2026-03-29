import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/src/components/shop/AddToCartPanel";
import { ProductDetailImage } from "@/src/components/shop/ProductDetailImage";
import { Card } from "@/src/components/ui/Card";
import { fetchProductBySlug } from "@/src/shop/fetchShopCatalog";
import { productCategoryLabels } from "@/src/shop/types";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = await fetchProductBySlug(id);

  if (!product) {
    notFound();
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Product
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            {product.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            {product.description}
          </p>
          <p className="mt-2 text-[11px] text-neutral-500">
            規格與庫存以本頁為準
          </p>
        </div>
        <Link
          href="/shop"
          className="rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
        >
          ← 回商店
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl border border-cyan-500/20 bg-neutral-950/70">
          <ProductDetailImage src={product.imageSrc} alt={product.name} />
        </div>

        <div className="space-y-4">
          <Card title="商品資訊" description="價格 / 分類">
            <div className="grid gap-2 text-[11px] text-neutral-300">
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Price</span>
                <span className="text-cyan-200">
                  {product.priceVac.toLocaleString()} VAC
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Category</span>
                <span className="text-cyan-200">
                  {productCategoryLabels[product.category]}
                </span>
              </div>
              <AddToCartPanel key={product.id} product={product} />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
