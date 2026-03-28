"use client";

import { create } from "zustand";
import { shopProducts } from "@/src/shop/products";
import type { ApparelSize } from "@/src/shop/types";
import { useAuthStore } from "@/src/store/authStore";

const CART_STORAGE_KEY = "vacant_cart_v1";
const AVATAR_OWNERSHIP_KEY = "vacant_avatar_owned_v1";
const PHYSICAL_SHIPPING_FEE = 60;

type CartMode = "physical" | "digital" | null;
type CouponCode = "VAC10" | "SHIP60";

export type CartLineItem = {
  productId: string;
  quantity: number;
  /** 有 sizeOptions 的商品必填（由 UI 預設 M） */
  size?: ApparelSize;
};

type CouponState = {
  code: CouponCode;
  discountVac: number;
  description: string;
};

type AddResult =
  | { ok: true; message: string }
  | { ok: false; reason: "mixed_fulfillment" | "avatar_already_owned"; message: string };

type CartState = {
  items: CartLineItem[];
  mode: CartMode;
  coupon: CouponState | null;
  hydrate: () => void;
  addItem: (productId: string, quantity: number, size?: ApparelSize) => AddResult;
  removeItem: (productId: string, size?: ApparelSize) => void;
  updateItemQuantity: (productId: string, quantity: number, size?: ApparelSize) => void;
  clearCart: () => void;
  clearAndAdd: (productId: string, quantity: number, size?: ApparelSize) => AddResult;
  applyCoupon: (rawCode: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  checkoutSuccess: () => void;
};

type StoredCart = {
  items: CartLineItem[];
  coupon: CouponState | null;
};

function lineMatches(
  item: CartLineItem,
  productId: string,
  size?: ApparelSize,
): boolean {
  if (item.productId !== productId) return false;
  const product = shopProducts.find((p) => p.id === productId);
  if (product?.sizeOptions?.length) {
    return (item.size ?? "M") === (size ?? "M");
  }
  return true;
}

function normalizeStoredItems(raw: unknown): CartLineItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartLineItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const rec = entry as Partial<CartLineItem>;
    if (typeof rec.productId !== "string" || typeof rec.quantity !== "number") continue;
    const product = shopProducts.find((p) => p.id === rec.productId);
    if (!product) continue;
    const qty = Math.max(1, Math.min(99, Math.floor(rec.quantity)));
    if (product.sizeOptions?.length) {
      const s = rec.size;
      const size: ApparelSize =
        s && product.sizeOptions.includes(s) ? s : "M";
      out.push({ productId: rec.productId, quantity: qty, size });
    } else {
      out.push({ productId: rec.productId, quantity: qty });
    }
  }
  return out;
}

function getCurrentIdentityId() {
  const user = useAuthStore.getState().user;
  return user?.id ?? "guest";
}

function getAvatarOwnershipStorageKey(identityId: string) {
  return `${AVATAR_OWNERSHIP_KEY}:${identityId}`;
}

function getCartStorageKey(identityId: string) {
  return `${CART_STORAGE_KEY}:${identityId}`;
}

function saveCart(identityId: string, payload: StoredCart) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getCartStorageKey(identityId), JSON.stringify(payload));
}

function loadCart(identityId: string): StoredCart {
  if (typeof window === "undefined") {
    return { items: [], coupon: null };
  }
  const raw = window.localStorage.getItem(getCartStorageKey(identityId));
  if (!raw) {
    return { items: [], coupon: null };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<StoredCart>;
    return {
      items: normalizeStoredItems(parsed.items),
      coupon: parsed.coupon ?? null,
    };
  } catch {
    return { items: [], coupon: null };
  }
}

function getOwnedAvatarProductIds(identityId: string) {
  if (typeof window === "undefined") return new Set<string>();
  const raw = window.localStorage.getItem(getAvatarOwnershipStorageKey(identityId));
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

function markAvatarAsOwned(identityId: string, avatarIds: string[]) {
  if (typeof window === "undefined" || avatarIds.length === 0) return;
  const current = getOwnedAvatarProductIds(identityId);
  avatarIds.forEach((id) => current.add(id));
  window.localStorage.setItem(
    getAvatarOwnershipStorageKey(identityId),
    JSON.stringify(Array.from(current)),
  );
}

function deriveMode(items: CartLineItem[]): CartMode {
  if (items.length === 0) return null;
  const first = shopProducts.find((product) => product.id === items[0]?.productId);
  return first?.fulfillmentType ?? null;
}

function buildCoupon(rawCode: string): CouponState | null {
  const code = rawCode.trim().toUpperCase();
  if (code === "VAC10") {
    return { code: "VAC10", discountVac: 0, description: "結帳 9 折" };
  }
  if (code === "SHIP60") {
    return { code: "SHIP60", discountVac: 0, description: "免運優惠" };
  }
  return null;
}

export function calculateCartSummary(
  items: CartLineItem[],
  coupon: CouponState | null,
): {
  subtotalVac: number;
  shippingVac: number;
  discountVac: number;
  totalVac: number;
  mode: CartMode;
} {
  const mode = deriveMode(items);
  const subtotalVac = items.reduce((sum, item) => {
    const product = shopProducts.find((p) => p.id === item.productId);
    if (!product) return sum;
    return sum + product.priceVac * item.quantity;
  }, 0);

  const baseShipping = mode === "physical" && subtotalVac > 0 ? PHYSICAL_SHIPPING_FEE : 0;
  const percentDiscount = coupon?.code === "VAC10" ? Math.floor(subtotalVac * 0.1) : 0;
  const shippingDiscount = coupon?.code === "SHIP60" ? Math.min(baseShipping, 60) : 0;
  const discountVac = percentDiscount + shippingDiscount;
  const shippingVac = Math.max(0, baseShipping - shippingDiscount);
  const totalVac = Math.max(0, subtotalVac + shippingVac - percentDiscount);

  return { subtotalVac, shippingVac, discountVac, totalVac, mode };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  mode: null,
  coupon: null,

  hydrate: () => {
    const identityId = getCurrentIdentityId();
    const stored = loadCart(identityId);
    set({
      items: stored.items,
      coupon: stored.coupon,
      mode: deriveMode(stored.items),
    });
  },

  addItem: (productId, quantity, size) => {
    const target = shopProducts.find((product) => product.id === productId);
    if (!target) {
      return { ok: false, reason: "mixed_fulfillment", message: "找不到商品" };
    }
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const needsSize = Boolean(target.sizeOptions?.length);
    const resolvedSize: ApparelSize | undefined = needsSize
      ? size && target.sizeOptions?.includes(size)
        ? size
        : "M"
      : undefined;
    const currentItems = get().items;
    const nextMode = deriveMode(currentItems);

    if (nextMode && nextMode !== target.fulfillmentType) {
      return {
        ok: false,
        reason: "mixed_fulfillment",
        message: "虛擬商品與實體商品需分開結帳，請先清空購物車。",
      };
    }

    if (target.isAvatar) {
      const identityId = getCurrentIdentityId();
      const owned = getOwnedAvatarProductIds(identityId);
      if (owned.has(target.id)) {
        return {
          ok: false,
          reason: "avatar_already_owned",
          message: "此頭像你已擁有，無法重複購買。",
        };
      }
    }

    const existing = currentItems.find((item) =>
      lineMatches(item, productId, resolvedSize),
    );
    const newLine: CartLineItem = needsSize
      ? { productId, quantity: Math.min(99, safeQuantity), size: resolvedSize }
      : { productId, quantity: Math.min(99, safeQuantity) };

    const nextItems = existing
      ? currentItems.map((item) =>
          lineMatches(item, productId, resolvedSize)
            ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity) }
            : item,
        )
      : [...currentItems, newLine];

    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: nextItems, coupon: get().coupon });
    set({ items: nextItems, mode: deriveMode(nextItems) });
    return { ok: true, message: "已加入購物車" };
  },

  clearAndAdd: (productId, quantity, size) => {
    set({ items: [], mode: null, coupon: null });
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: [], coupon: null });
    return get().addItem(productId, quantity, size);
  },

  removeItem: (productId, size) => {
    const nextItems = get().items.filter((item) => !lineMatches(item, productId, size));
    const nextMode = deriveMode(nextItems);
    const nextCoupon = nextItems.length === 0 ? null : get().coupon;
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: nextItems, coupon: nextCoupon });
    set({ items: nextItems, mode: nextMode, coupon: nextCoupon });
  },

  updateItemQuantity: (productId, quantity, size) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const nextItems = get().items.map((item) =>
      lineMatches(item, productId, size) ? { ...item, quantity: safeQuantity } : item,
    );
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: nextItems, coupon: get().coupon });
    set({ items: nextItems });
  },

  clearCart: () => {
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: [], coupon: null });
    set({ items: [], mode: null, coupon: null });
  },

  applyCoupon: (rawCode) => {
    const coupon = buildCoupon(rawCode);
    if (!coupon) {
      return { ok: false, message: "無效優惠碼" };
    }
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: get().items, coupon });
    set({ coupon });
    return { ok: true, message: `已套用優惠：${coupon.description}` };
  },

  clearCoupon: () => {
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: get().items, coupon: null });
    set({ coupon: null });
  },

  checkoutSuccess: () => {
    const identityId = getCurrentIdentityId();
    const avatarIds = get().items
      .map((item) => shopProducts.find((product) => product.id === item.productId))
      .filter((product) => product?.isAvatar)
      .map((product) => product!.id);

    markAvatarAsOwned(identityId, avatarIds);
    saveCart(identityId, { items: [], coupon: null });
    set({ items: [], mode: null, coupon: null });
  },
}));

