"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import type {
  OrderDetail,
  OrderDetailLineItem,
  OrderDetailProductRow,
} from "@/src/components/profile/orders/types";
import { useAuthStore } from "@/src/store/authStore";

function normalizeProduct(
  products: OrderDetailProductRow | OrderDetailProductRow[] | null,
): OrderDetailProductRow | OrderDetailProductRow[] | null {
  return products;
}

function mapOrderDetail(data: {
  id: string;
  status: string | null;
  fulfillment_type: string | null;
  subtotal_vac: number | null;
  shipping_fee_vac: number | null;
  discount_vac: number | null;
  total_vac: number | null;
  coupon_code: string | null;
  shipping_snapshot: unknown;
  created_at: string | null;
  order_items:
    | {
        id: string;
        quantity: number;
        unit_price_vac: number | null;
        line_total_vac: number | null;
        size_snapshot: string | null;
        products:
          | {
              name: string;
              slug: string | null;
              image_bucket: string | null;
              image_object_path: string | null;
            }
          | {
              name: string;
              slug: string | null;
              image_bucket: string | null;
              image_object_path: string | null;
            }[]
          | null;
      }[]
    | null;
}): OrderDetail {
  const items: OrderDetailLineItem[] | null = data.order_items
    ? data.order_items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        unit_price_vac: item.unit_price_vac ?? 0,
        line_total_vac: item.line_total_vac ?? 0,
        size_snapshot: item.size_snapshot,
        products: normalizeProduct(item.products),
      }))
    : null;

  return {
    id: data.id,
    status: data.status ?? "pending",
    fulfillment_type: data.fulfillment_type ?? "digital",
    subtotal_vac: data.subtotal_vac ?? 0,
    shipping_fee_vac: data.shipping_fee_vac ?? 0,
    discount_vac: data.discount_vac ?? 0,
    total_vac: data.total_vac ?? 0,
    coupon_code: data.coupon_code,
    shipping_snapshot:
      data.shipping_snapshot !== null &&
      typeof data.shipping_snapshot === "object" &&
      !Array.isArray(data.shipping_snapshot)
        ? (data.shipping_snapshot as Record<string, unknown>)
        : null,
    created_at: data.created_at ?? "",
    order_items: items,
  };
}

export function useProfileOrderDetail(orderId: string) {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    // 將 setState 延後到下一個 macrotask，避免在 effect 同步階段更新而觸發 react-compiler／eslint 規則誤報。
    const timerId = window.setTimeout(() => {
      void (async () => {
        if (!orderId) {
          if (!cancelled) {
            setError("無效的訂單編號");
            setLoading(false);
          }
          return;
        }
        if (!user || user.is_guest) {
          if (!cancelled) {
            setOrder(null);
            setLoading(false);
          }
          return;
        }

        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const { data, error: qErr } = await supabase
          .from("orders")
          .select(
            `
            id,
            status,
            fulfillment_type,
            subtotal_vac,
            shipping_fee_vac,
            discount_vac,
            total_vac,
            coupon_code,
            shipping_snapshot,
            created_at,
            order_items (
              id,
              quantity,
              unit_price_vac,
              line_total_vac,
              size_snapshot,
              products (
                name,
                slug,
                image_bucket,
                image_object_path
              )
            )
          `,
          )
          .eq("id", orderId)
          .maybeSingle();

        if (cancelled) return;
        if (qErr) {
          setError(qErr.message);
          setOrder(null);
        } else if (!data) {
          setError("找不到此訂單或無權限查看");
          setOrder(null);
        } else {
          setOrder(mapOrderDetail(data));
        }
        setLoading(false);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [authLoading, orderId, user]);

  return { user, authLoading, order, loading, error };
}
