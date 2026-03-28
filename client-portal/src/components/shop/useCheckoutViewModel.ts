"use client";

import { useEffect, useMemo, useState } from "react";
import { shopProducts } from "@/src/shop/products";
import { calculateCartSummary, useCartStore } from "@/src/store/cartStore";

export type ShippingForm = {
  recipient: string;
  phone: string;
  address: string;
  note: string;
};

type CheckoutUiState = {
  completed: boolean;
  error: string | null;
};

export function useCheckoutViewModel() {
  const hydrate = useCartStore((s) => s.hydrate);
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
    completed: false,
    error: null,
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const summary = useMemo(() => calculateCartSummary(items, coupon), [items, coupon]);

  const rows = useMemo(
    () =>
      items.flatMap((item) => {
        const product = shopProducts.find((p) => p.id === item.productId);
        if (!product) return [];
        return [{ product, quantity: item.quantity }];
      }),
    [items],
  );

  const mode = summary.mode;
  const isPhysical = mode === "physical";

  const setShippingField = <K extends keyof ShippingForm>(
    key: K,
    value: ShippingForm[K],
  ) => {
    setShippingForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    if (items.length === 0) {
      setUiState((prev) => ({ ...prev, error: "購物車為空，請先加入商品。" }));
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
        error: "實體商品請完整填寫收件人、手機與地址。",
      }));
      return;
    }

    setUiState({ completed: true, error: null });
    checkoutSuccess();
  };

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

