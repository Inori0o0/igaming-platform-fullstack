"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import type { OrderDetail } from "@/src/components/profile/orders/types";
import { useAuthStore } from "@/src/store/authStore";

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
          setOrder(data as unknown as OrderDetail);
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
