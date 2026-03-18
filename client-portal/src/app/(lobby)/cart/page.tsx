import Link from "next/link";
import { Card } from "@/src/components/ui/Card";

export default function CartPage() {
  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Cart
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            購物車
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            目前是 UI 殼。後續會接上 cart state、數量調整、總價與優惠券。
          </p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-50 transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
        >
          前往結帳 →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card title="商品列表（placeholder）" description="空狀態先放著。">
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-xs text-neutral-400">
            你的購物車目前是空的。
            <div className="mt-3">
              <Link
                href="/shop"
                className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
              >
                去逛逛商店
              </Link>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="金額（placeholder）" description="之後會顯示小計/折扣/總計。">
            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Subtotal</span>
                <span className="text-cyan-200">—</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Discount</span>
                <span className="text-cyan-200">—</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                <span>Total</span>
                <span className="text-cyan-200">—</span>
              </div>
            </div>
          </Card>

          <Card title="優惠券（placeholder）" description="輸入與驗證稍後接。">
            <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-4 text-xs text-neutral-400">
              Coupon input area
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

