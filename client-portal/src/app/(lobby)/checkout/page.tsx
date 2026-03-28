"use client";

import Link from "next/link";
import { useCheckoutViewModel } from "@/src/components/shop/useCheckoutViewModel";
import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";

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
            依商品類型分開結帳：虛擬商品免填地址，實體商品需填收件資訊。
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
            isPhysical
              ? "實體商品需填寫收件資訊。"
              : "虛擬商品將在付款後直接發放到帳號。"
          }
        >
          {uiState.completed ? (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 text-sm text-cyan-50">
              訂單已完成（模擬），可回商店繼續購物。
            </div>
          ) : isPhysical ? (
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
              虛擬商品無須填寫地址，付款成功後將直接發放。
            </div>
          )}
        </Card>

        <Card title="步驟 2：訂單摘要" description="確認商品與總價後送出。">
          <div className="space-y-3 text-xs text-neutral-300">
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-5 text-center text-neutral-400">
                購物車為空，請先回商店加入商品。
              </div>
            ) : (
              <>
                {rows.map((row) => (
                  <div
                    key={row.product.id}
                    className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2"
                  >
                    <span className="truncate pr-3">
                      {row.product.name} x {row.quantity}
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
                <div className="flex items-center justify-between rounded-xl bg-neutral-950/70 px-3 py-2 text-sm font-semibold">
                  <span>應付總額</span>
                  <span className="text-cyan-100">
                    {summary.totalVac.toLocaleString()} VAC
                  </span>
                </div>
                <Button onClick={handleConfirm}>確認結帳（模擬）</Button>
                {uiState.error && <p className="text-cyan-200">{uiState.error}</p>}
              </>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
