"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogoLoader } from "@/src/components/loading/LogoLoader";
import { LoadingImage } from "@/src/components/loading/LoadingImage";
import { Card } from "@/src/components/ui/Card";
import {
  formatVac,
  fulfillmentLabel,
  orderStatusLabel,
} from "@/src/components/profile/orders/orderDisplay";
import { shopProductPublicImageUrl } from "@/src/components/profile/orders/shopProductImageUrl";
import type { OrderDetail } from "@/src/components/profile/orders/types";
import { cn } from "@/src/lib/cn";

type ProfileOrderDetailViewProps = {
  order: OrderDetail | null;
  loading: boolean;
  error: string | null;
};

export function ProfileOrderDetailView({
  order,
  loading,
  error,
}: ProfileOrderDetailViewProps) {
  const router = useRouter();

  return (
    <main className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/profile/orders")}
          className="text-xs font-semibold text-cyan-300/85 hover:text-cyan-200"
        >
          ← 訂單列表
        </button>
      </div>

      <Card
        title="訂單明細"
        description={
          order
            ? `${new Date(order.created_at).toLocaleString("zh-TW", {
                dateStyle: "medium",
                timeStyle: "short",
              })} · ${orderStatusLabel(order.status)} · ${fulfillmentLabel(order.fulfillment_type)}`
            : loading
              ? "載入中…"
              : "—"
        }
      >
        {error ? (
          <p className="text-sm text-rose-300/90">{error}</p>
        ) : loading || !order ? (
          <div className="flex min-h-28 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-8 text-center text-sm text-neutral-400">
            {loading ? (
              <LogoLoader size="md" className="text-cyan-300" />
            ) : (
              "—"
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-neutral-500">
                  小計
                </dt>
                <dd className="tabular-nums text-neutral-100">
                  {formatVac(order.subtotal_vac)} VAC
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-neutral-500">
                  運費
                </dt>
                <dd className="tabular-nums text-neutral-100">
                  {formatVac(order.shipping_fee_vac)} VAC
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-neutral-500">
                  折扣
                </dt>
                <dd className="tabular-nums text-neutral-100">
                  −{formatVac(order.discount_vac)} VAC
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-neutral-500">
                  合計
                </dt>
                <dd className="text-lg font-semibold tabular-nums text-cyan-200/95">
                  {formatVac(order.total_vac)} VAC
                </dd>
              </div>
              {order.coupon_code ? (
                <div className="sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-wide text-neutral-500">
                    優惠碼
                  </dt>
                  <dd className="font-medium text-neutral-200">{order.coupon_code}</dd>
                </div>
              ) : null}
            </dl>

            {order.fulfillment_type === "physical" && order.shipping_snapshot ? (
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                  收件資訊
                </p>
                <dl className="mt-3 space-y-2 text-sm text-neutral-200">
                  <div>
                    <dt className="text-xs text-neutral-500">收件人</dt>
                    <dd>{String(order.shipping_snapshot.recipient ?? "—")}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">手機</dt>
                    <dd>{String(order.shipping_snapshot.phone ?? "—")}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500">地址</dt>
                    <dd className="whitespace-pre-wrap">
                      {String(order.shipping_snapshot.address ?? "—")}
                    </dd>
                  </div>
                  {order.shipping_snapshot.note != null &&
                  String(order.shipping_snapshot.note).trim() !== "" ? (
                    <div>
                      <dt className="text-xs text-neutral-500">備註</dt>
                      <dd className="whitespace-pre-wrap">
                        {String(order.shipping_snapshot.note)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}

            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                品項
              </p>
              <ul className="space-y-3">
                {(order.order_items ?? []).map((line) => {
                  const raw = line.products;
                  const p = Array.isArray(raw) ? raw[0] ?? null : raw;
                  const bucket = p?.image_bucket?.trim() || "shop-products";
                  const path = p?.image_object_path?.trim();
                  const img =
                    path && path.length > 0
                      ? shopProductPublicImageUrl(bucket, path)
                      : null;
                  const title = p?.name?.trim() || "商品";
                  const slug = p?.slug?.trim();
                  return (
                    <li
                      key={line.id}
                      className={cn(
                        "flex gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-3",
                      )}
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-900">
                        {img ? (
                          <LoadingImage
                            src={img}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-[10px] text-neutral-600">
                            —
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          {slug ? (
                            <Link
                              href={`/shop/${slug}`}
                              className="font-medium text-cyan-200/90 hover:underline"
                            >
                              {title}
                            </Link>
                          ) : (
                            <span className="font-medium text-neutral-100">{title}</span>
                          )}
                          <span className="text-sm font-semibold tabular-nums text-neutral-100">
                            {formatVac(line.line_total_vac)} VAC
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">
                          單價 {formatVac(line.unit_price_vac)} × {line.quantity}
                          {line.size_snapshot ? ` · 尺寸 ${line.size_snapshot}` : ""}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
