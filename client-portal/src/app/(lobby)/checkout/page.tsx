import { Card } from "@/src/components/ui/Card";

export default function CheckoutPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Checkout
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          結帳
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          目前是流程殼。後續會做收件資訊（模擬）→ 確認訂單 → 扣 coins → 完成頁。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="步驟 1：收件資訊（placeholder）" description="先保留版位。">
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-5 text-xs text-neutral-400">
            Shipping form area
          </div>
        </Card>
        <Card title="步驟 2：訂單摘要（placeholder）" description="顯示商品與總價。">
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-5 text-xs text-neutral-400">
            Order summary area
          </div>
        </Card>
      </div>
    </main>
  );
}

