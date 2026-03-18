import Link from "next/link";
import { Card } from "@/src/components/ui/Card";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Product
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            商品詳情：{id}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            這頁是 /shop/[id] 的殼。後續會接上商品圖片、描述、加入購物車。
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
        <div className="rounded-3xl border border-cyan-500/20 bg-neutral-950/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
            Image (placeholder)
          </p>
          <div className="mt-3 aspect-video rounded-2xl border border-dashed border-cyan-500/25 bg-black/20" />
        </div>

        <div className="space-y-4">
          <Card title="資訊（placeholder）" description="價格/庫存/分類等。">
            <div className="grid gap-2 text-[11px] text-neutral-300">
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Price</span>
                <span className="text-cyan-200">— Coins</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Stock</span>
                <span className="text-cyan-200">—</span>
              </div>
              <div className="rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-3 text-neutral-400">
                這裡會放「數量選擇」與「加入購物車」按鈕。
              </div>
            </div>
          </Card>

          <Card title="描述（placeholder）" description="之後接上真實內容。">
            <p className="text-xs leading-relaxed text-neutral-300">
              這是示意頁面。後續你可以把 products 資料表接到 Supabase，並在這裡做 SSR/ISR。
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
}

