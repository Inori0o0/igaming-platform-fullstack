import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/src/components/shop/AddToCartPanel";
import { Card } from "@/src/components/ui/Card";
import { getProductById } from "@/src/shop/products";
import { productCategoryLabels } from "@/src/shop/types";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProductById(id);

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
          <div className="relative aspect-square">
            <Image
              src={product.imageSrc}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 60vw, 100vw"
            />
          </div>
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

          <Card title="商品描述" description="可於 products 資料表直接調整">
            <p className="text-xs leading-relaxed text-neutral-300">
              目前為 Phase 5.1 / 5.2 可用版本，資料源為本地 mock。待 Phase 5.3
              會把按鈕串接到 cart state。
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}
