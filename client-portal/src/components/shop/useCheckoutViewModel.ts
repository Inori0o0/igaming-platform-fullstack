"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildCheckoutRpcPayload } from "@/src/lib/shopCheckout";
import { supabase } from "@/src/lib/supabaseClient";
import { calculateCartSummary, useCartStore } from "@/src/store/cartStore";
import { useAuthStore } from "@/src/store/authStore";
import { useShopCatalogStore } from "@/src/store/shopCatalogStore";
import { useWalletStore } from "@/src/store/walletStore";

export type ShippingForm = {
  recipient: string;
  phone: string;
  address: string;
  note: string;
};

type CheckoutUiState = {
  error: string | null;
  isSubmitting: boolean;
};

/** 保留 Postgres exception 內文（含業務 RAISE），其餘回傳一般訊息。 */
function rpcErrorMessage(err: { message?: string; details?: string; hint?: string }): string {
  const raw = err.message ?? "結帳失敗";
  if (raw.includes("P0001") || raw.includes("raise_exception")) {
    return raw;
  }
  return raw;
}

/** RPC 可能回傳 JSON 字串或物件；統一取出 `order_id` 供成功頁 query 使用。 */
function parseRpcOrderId(data: unknown): string | null {
  let obj: unknown = data;
  if (typeof data === "string") {
    try {
      obj = JSON.parse(data) as unknown;
    } catch {
      return null;
    }
  }
  if (!obj || typeof obj !== "object") return null;
  const v = (obj as Record<string, unknown>).order_id;
  return typeof v === "string" && v.length > 0 ? v : null;
}

export function useCheckoutViewModel() {
  const router = useRouter();
  const hydrate = useCartStore((s) => s.hydrate);
  const hydrateWallet = useWalletStore((s) => s.hydrateForCurrentUser);
  const catalog = useShopCatalogStore((s) => s.products);
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const checkoutSuccess = useCartStore((s) => s.checkoutSuccess);

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    recipient: "",
    phone: "",
    address: "",
    note: "",
  });
  const [uiState, setUiState] = useState<CheckoutUiState>({
    error: null,
    isSubmitting: false,
  });

  /** 避免連點或 async 競態導致重複送出 RPC。 */
  const confirmLockRef = useRef(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const summary = useMemo(
    () => calculateCartSummary(items, coupon, catalog),
    [items, coupon, catalog],
  );

  const rows = useMemo(
    () =>
      items.flatMap((item) => {
        const product = catalog.find((p) => p.id === item.productId);
        if (!product) return [];
        return [{ product, quantity: item.quantity, size: item.size }];
      }),
    [items, catalog],
  );

  const mode = summary.mode;
  const isPhysical = mode === "physical";

  const setShippingField = useCallback(<K extends keyof ShippingForm>(
    key: K,
    value: ShippingForm[K],
  ) => {
    setShippingForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (confirmLockRef.current) {
      return;
    }

    const authUser = useAuthStore.getState().user;
    if (!authUser || authUser.is_guest) {
      setUiState((prev) => ({
        ...prev,
        error: "請先登入後再結帳",
        isSubmitting: false,
      }));
      return;
    }

    if (items.length === 0) {
      setUiState((prev) => ({ ...prev, error: "購物車是空的" }));
      return;
    }
    if (
      isPhysical &&
      (!shippingForm.recipient.trim() ||
        !shippingForm.phone.trim() ||
        !shippingForm.address.trim())
    ) {
      setUiState((prev) => ({
        ...prev,
        error: "請填寫收件人、手機與地址",
      }));
      return;
    }

    confirmLockRef.current = true;
    setUiState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const { lines, couponCode, shipping: shipPayload } = buildCheckoutRpcPayload(
        items,
        coupon,
        catalog,
        shippingForm,
        mode,
      );

      const { data, error } = await supabase.rpc("checkout_shop_order", {
        p_lines: lines,
        p_coupon_code: couponCode,
        p_shipping: shipPayload,
      });

      if (error) {
        throw error;
      }

      if (!data || typeof data !== "object") {
        throw new Error("結帳回傳異常");
      }

      const orderId = parseRpcOrderId(data);

      checkoutSuccess();
      await hydrateWallet();
      setUiState({ error: null, isSubmitting: false });
      confirmLockRef.current = false;

      const next =
        orderId != null
          ? `/checkout/success?orderId=${encodeURIComponent(orderId)}`
          : "/checkout/success";
      router.replace(next);
    } catch (e: unknown) {
      confirmLockRef.current = false;
      const msg =
        e && typeof e === "object" && "message" in e
          ? rpcErrorMessage(e as { message?: string })
          : "結帳失敗";
      setUiState((prev) => ({
        ...prev,
        error: msg,
        isSubmitting: false,
      }));
    }
  }, [
    catalog,
    checkoutSuccess,
    coupon,
    hydrateWallet,
    isPhysical,
    items,
    mode,
    router,
    shippingForm,
  ]);

  return {
    rows,
    summary,
    isPhysical,
    shippingForm,
    uiState,
    setShippingField,
    handleConfirm,
  };
}
