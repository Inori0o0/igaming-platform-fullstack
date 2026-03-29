"use client";

import Link from "next/link";
import { useCheckoutViewModel } from "@/src/components/shop/useCheckoutViewModel";
import { Card } from "@/src/components/ui/Card";
import { cn } from "@/src/lib/cn";
import { cartLineReactKey } from "@/src/shop/cartLineKey";

export default function CheckoutPage() {
  const {
    rows,
    summary,
    isPhysical,
    shippingForm,
    uiState,
    setShippingField,
    handleConfirm,
  } = useCheckoutViewModel();

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
            Checkout
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
            結帳
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-300">
            虛擬免填地址，實體需填收件。
          </p>
        </div>
        <Link
          href="/cart"
          className="rounded-full border border-cyan-500/20 bg-neutral-950/70 px-4 py-2 text-xs font-semibold text-neutral-200 transition hover:border-cyan-400/40 hover:bg-neutral-950/90"
        >
          ← 返回購物車
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          title={isPhysical ? "步驟 1：收件資訊" : "步驟 1：付款確認"}
          description={
            isPhysical ? "請填寫收件資訊" : "付款後發放至帳號"
          }
        >
          {isPhysical ? (
            <div className="space-y-3 text-xs text-neutral-300">
              <input
                value={shippingForm.recipient}
                onChange={(event) => setShippingField("recipient", event.target.value)}
                className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
                placeholder="收件人"
              />
              <input
                value={shippingForm.phone}
                onChange={(event) => setShippingField("phone", event.target.value)}
                className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
                placeholder="手機號碼"
              />
              <input
                value={shippingForm.address}
                onChange={(event) => setShippingField("address", event.target.value)}
                className="w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
                placeholder="完整地址"
              />
              <textarea
                value={shippingForm.note}
                onChange={(event) => setShippingField("note", event.target.value)}
                className="min-h-20 w-full rounded-lg border border-cyan-500/25 bg-black/30 px-3 py-2 text-xs text-neutral-100 outline-none focus:border-cyan-400/60"
                placeholder="備註（選填）"
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-cyan-500/20 bg-neutral-950/60 p-5 text-xs text-neutral-300">
              虛擬商品免填地址，付款後發放。
            </div>
          )}
        </Card>

        <Card title="步驟 2：訂單摘要" description="確認後送出">
          <div className="space-y-3 text-xs text-neutral-300">
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-5 text-center text-neutral-400">
                購物車是空的
              </div>
            ) : (
              <>
                {rows.map((row) => (
                  <div
                    key={cartLineReactKey(row.product, row.size)}
                    className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2"
                  >
                    <span className="truncate pr-3">
                      {row.product.name}
                      {row.product.sizeOptions && row.product.sizeOptions.length > 0 && row.size
                        ? `（${row.size}）`
                        : ""}{" "}
                      x {row.quantity}
                    </span>
                    <span className="text-cyan-200">
                      {(row.product.priceVac * row.quantity).toLocaleString()}{" "}
                      VAC
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                  <span>小計</span>
                  <span className="text-cyan-200">
                    {summary.subtotalVac.toLocaleString()} VAC
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                  <span>運費</span>
                  <span className="text-cyan-200">
                    {summary.shippingVac.toLocaleString()} VAC
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                  <span>折扣</span>
                  <span className="text-cyan-200">
                    -{summary.discountVac.toLocaleString()} VAC
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2">
                  <span className="text-sm font-medium">應付總額</span>
                  <span className="text-lg font-semibold tabular-nums text-cyan-100">
                    {summary.totalVac.toLocaleString()} VAC
                  </span>
                </div>
                <div className="border-t border-cyan-500/20 pt-4">
                  <form
                    className="contents"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleConfirm();
                    }}
                  >
                    <button
                      type="submit"
                      disabled={rows.length === 0 || uiState.isSubmitting}
                      className={cn(
                        "flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-base font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03030a]",
                        rows.length === 0 || uiState.isSubmitting
                          ? "cursor-not-allowed border border-neutral-700/60 bg-neutral-900/60 text-neutral-500 opacity-70"
                          : "border border-cyan-300/70 bg-cyan-400 text-neutral-950 shadow-[0_0_20px_rgba(34,211,238,0.55),0_0_44px_rgba(34,211,238,0.22)] hover:border-cyan-200 hover:bg-cyan-300 hover:shadow-[0_0_28px_rgba(34,211,238,0.75),0_0_52px_rgba(34,211,238,0.3)] active:translate-y-px disabled:pointer-events-none",
                      )}
                    >
                      {uiState.isSubmitting ? "處理中…" : "確認結帳"}
                    </button>
                  </form>
                </div>
                {uiState.error && (
                  <p className="text-sm text-amber-200/95">{uiState.error}</p>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
