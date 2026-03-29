"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/src/components/ui/Card";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId")?.trim() ?? "";

  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Checkout
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          訂單已成立
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          感謝購買，款項已從錢包扣除。您可隨時在個人中心查看訂單明細。
        </p>
      </div>

      <Card
        title="訂單編號"
        description={
          orderId
            ? "請保留此編號以便查詢。"
            : "未帶入編號時，請至訂單歷史查看最新一筆。"
        }
      >
        {orderId ? (
          <p className="break-all rounded-xl border border-cyan-500/20 bg-neutral-950/70 px-4 py-3 font-mono text-sm text-cyan-100/95">
            {orderId}
          </p>
        ) : (
          <p className="text-sm text-neutral-400">
            若剛完成結帳，請到「訂單歷史」確認最新訂單。
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {orderId ? (
            <Link
              href={`/profile/orders/${orderId}`}
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-cyan-300/70 bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-neutral-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition hover:border-cyan-200 hover:bg-cyan-300 sm:min-w-40"
            >
              查看訂單詳情
            </Link>
          ) : (
            <Link
              href="/profile/orders"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-cyan-300/70 bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-neutral-950 shadow-[0_0_20px_rgba(34,211,238,0.35)] transition hover:border-cyan-200 hover:bg-cyan-300 sm:min-w-40"
            >
              前往訂單歷史
            </Link>
          )}
          <Link
            href="/shop"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-cyan-500/30 bg-neutral-950/80 px-4 py-3 text-center text-sm font-semibold text-cyan-100/95 transition hover:border-cyan-400/45 hover:bg-neutral-900/90 sm:min-w-40"
          >
            繼續逛逛
          </Link>
        </div>
      </Card>

      <p className="text-center text-xs text-neutral-500">
        <Link href="/cart" className="text-cyan-400/90 underline-offset-4 hover:underline">
          購物車
        </Link>
        {" · "}
        <Link href="/wallet" className="text-cyan-400/90 underline-offset-4 hover:underline">
          錢包
        </Link>
      </p>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="space-y-6">
          <p className="text-sm text-neutral-400">載入中…</p>
        </main>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
