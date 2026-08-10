"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isCheckoutSubmitLocked,
  setCheckoutSubmitLocked,
  subscribeCheckoutPageShow,
} from "@/src/components/shop/checkout/checkoutSubmitLock";
import {
  validateShippingField,
  validateShippingForm,
  type ShippingFieldErrors,
} from "@/src/lib/checkoutValidation";
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
  const userId = useAuthStore((s) => s.user?.id);
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
  const [fieldErrors, setFieldErrors] = useState<ShippingFieldErrors>({});
  // 初始值直接讀 sessionStorage 的鎖狀態：如果頁面是在一筆訂單處理中被重新
  // 載入（而不是單純的元件記憶體殘留 isSubmitting=false），這裡要如實反映。
  const [uiState, setUiState] = useState<CheckoutUiState>(() => ({
    error: null,
    isSubmitting: isCheckoutSubmitLocked(),
  }));

  /** 避免連點或 async 競態導致重複送出 RPC（元件記憶體內的第一層鎖）。 */
  const confirmLockRef = useRef(isCheckoutSubmitLocked());

  useEffect(() => {
    // 依賴 userId：登入/登出/切換帳號時（頁面未重新 mount）也要換成對應身份的購物車快照。
    hydrate();
  }, [hydrate, userId]);

  useEffect(() => {
    // P1 #5：bfcache 還原時（event.persisted），以 sessionStorage 的鎖狀態
    // 重新同步 ref 與 UI，避免瀏覽器還原出一個「看起來可以再送出一次」的畫面。
    return subscribeCheckoutPageShow((locked) => {
      confirmLockRef.current = locked;
      setUiState((prev) => ({ ...prev, isSubmitting: locked }));
    });
  }, []);

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
    // P1 #6：逐欄位即時反饋，不用等送出才知道哪裡填錯。note 是選填欄位，
    // 但仍套用同一個 schema（長度上限等）以維持單一驗證來源。
    if (key === "recipient" || key === "phone" || key === "address" || key === "note") {
      const message = validateShippingField(key, value);
      setFieldErrors((prev) => ({ ...prev, [key]: message ?? undefined }));
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    // 第一層鎖（元件記憶體）+ 第二層鎖（sessionStorage，跨 remount/bfcache 還原存活）。
    if (confirmLockRef.current || isCheckoutSubmitLocked()) {
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

    if (isPhysical) {
      const errors = validateShippingForm(shippingForm);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setUiState((prev) => ({
          ...prev,
          error: "請修正收件資訊中標示的欄位",
        }));
        return;
      }
    }

    confirmLockRef.current = true;
    setCheckoutSubmitLocked(true);
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
        p_coupon_code: couponCode ?? undefined,
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
      setCheckoutSubmitLocked(false);

      const next =
        orderId != null
          ? `/checkout/success?orderId=${encodeURIComponent(orderId)}`
          : "/checkout/success";
      router.replace(next);
    } catch (e: unknown) {
      confirmLockRef.current = false;
      setCheckoutSubmitLocked(false);
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
    fieldErrors,
    uiState,
    setShippingField,
    handleConfirm,
  };
}
