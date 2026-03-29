"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";
import type { ProfileOrderRow } from "@/src/components/profile/orders/types";

export function useProfileOrders() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const [orders, setOrders] = useState<ProfileOrderRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    // 見 useProfileOrderDetail：fetch 內的 setState 延後一幀，避免 effect 同步 setState 告警。
    const timerId = window.setTimeout(() => {
      void (async () => {
        if (!user || user.is_guest) {
          if (!cancelled) {
            setOrders(null);
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
            "id, status, fulfillment_type, subtotal_vac, shipping_fee_vac, discount_vac, total_vac, coupon_code, created_at",
          )
          .order("created_at", { ascending: false });

        if (cancelled) return;
        if (qErr) {
          setError(qErr.message);
          setOrders([]);
        } else {
          setOrders((data ?? []) as ProfileOrderRow[]);
        }
        setLoading(false);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [authLoading, user, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  const copyOrderId = useCallback(async (orderId: string) => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopiedId(orderId);
      window.setTimeout(() => {
        setCopiedId((cur) => (cur === orderId ? null : cur));
      }, 2000);
    } catch {
      setCopiedId(null);
    }
  }, []);

  return {
    user,
    authLoading,
    orders,
    loading,
    error,
    retry,
    copiedId,
    copyOrderId,
  };
}
