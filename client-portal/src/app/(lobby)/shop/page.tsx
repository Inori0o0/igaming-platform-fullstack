import Link from "next/link";
import { Card } from "@/src/components/ui/Card";

const products = [
  {
    id: "neon-horse-hoodie",
    name: "Neon Horse Hoodie",
    price: 8800,
    category: "服飾",
  },
  {
    id: "brainrot-avatar-pack",
    name: "Italian Brainrot Avatar Pack",
    price: 3200,
    category: "數位商品",
  },
  {
    id: "vacant-logo-tee",
    name: "vAcAnt Logo Tee",
    price: 2600,
    category: "服飾",
  },
] as const;

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
          目前是 UI 殼 + 假資料。後續會接上真實商品資料、圖片與庫存。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <Link
            key={p.id}
            href={`/shop/${p.id}`}
            className="group rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-4 transition hover:border-cyan-400/35 hover:bg-neutral-950/85"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-50">{p.name}</p>
                <p className="mt-1 text-[11px] text-neutral-400">{p.category}</p>
              </div>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
                {p.price.toLocaleString()} Coins
              </span>
            </div>
            <p className="mt-4 text-[11px] font-semibold text-cyan-200/90 group-hover:text-cyan-100">
              查看詳情 →
            </p>
          </Link>
        ))}
      </div>

      <Card
        title="下一步"
        description="等購物車/結帳流程完成後，這裡就能直接加入購物車。"
      >
        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
          <li>商品分類篩選 + 搜尋</li>
          <li>商品詳情頁 + 數量選擇</li>
          <li>加入購物車 + cart state</li>
        </ul>
      </Card>
    </main>
  );
}

