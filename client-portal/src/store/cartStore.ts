"use client";

/**
 * 購物車狀態（localStorage 持久化、加車規則、優惠券）。
 * 金額試算請用 `calculateCartSummary`（見 cartSummary）；型別見 cartTypes。
 */

import { create } from "zustand";
import type { ApparelSize } from "@/src/shop/types";
import { stockAvailableForLine } from "@/src/shop/stock";
import { couponAppliesToMode, deriveMode } from "@/src/store/cartSummary";
import type { CartLineItem, CartMode, CouponState } from "@/src/store/cartTypes";
import { useAuthStore } from "@/src/store/authStore";
import { getShopCatalogSnapshot } from "@/src/store/shopCatalogStore";

export type { CartLineItem, CouponState, CouponFulfillmentScope } from "@/src/store/cartTypes";
export { calculateCartSummary } from "@/src/store/cartSummary";

const CART_STORAGE_KEY = "vacant_cart_v1";
const AVATAR_OWNERSHIP_KEY = "vacant_avatar_owned_v1";

type AddResult =
  | { ok: true; message: string }
  | {
      ok: false;
      reason:
        | "mixed_fulfillment"
        | "avatar_already_owned"
        | "avatar_max_one_per_cart"
        | "out_of_stock"
        | "insufficient_stock";
      message: string;
    };

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
  const product = getShopCatalogSnapshot().find((p) => p.id === productId);
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
    const product = getShopCatalogSnapshot().find((p) => p.id === rec.productId);
    if (!product) continue;
    const cap = product.isAvatar ? 1 : 99;
    const qty = Math.max(1, Math.min(cap, Math.floor(rec.quantity)));
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

function sanitizeCoupon(raw: unknown): CouponState | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as { code?: unknown };
  if (typeof rec.code !== "string") return null;
  const built = buildCoupon(rec.code);
  if (built) return built;
  const legacy = rec.code.trim().toUpperCase();
  if (legacy === "SHIP60") return buildCoupon("SHIPFREE");
  return null;
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
    const items = normalizeStoredItems(parsed.items);
    let coupon = sanitizeCoupon(parsed.coupon);
    const mode = deriveMode(items, getShopCatalogSnapshot());
    if (coupon && mode && !couponAppliesToMode(coupon, mode)) {
      coupon = null;
    }
    return { items, coupon };
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

function buildCoupon(rawCode: string): CouponState | null {
  const code = rawCode.trim().toUpperCase();
  if (code === "SHIPFREE") {
    return {
      code: "SHIPFREE",
      discountType: "free_shipping",
      percentOffPoints: 0,
      description: "免運",
      appliesFulfillment: "physical",
    };
  }
  if (code === "DIGI97") {
    return {
      code: "DIGI97",
      discountType: "percentage",
      percentOffPoints: 3,
      description: "97 折",
      appliesFulfillment: "digital",
    };
  }
  if (code === "ALL95") {
    return {
      code: "ALL95",
      discountType: "percentage",
      percentOffPoints: 5,
      description: "95 折",
      appliesFulfillment: "any",
    };
  }
  return null;
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
      mode: deriveMode(stored.items, getShopCatalogSnapshot()),
    });
  },

  addItem: (productId, quantity, size) => {
    const target = getShopCatalogSnapshot().find((product) => product.id === productId);
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

    const lineCap = stockAvailableForLine(target, resolvedSize);
    if (lineCap <= 0) {
      return {
        ok: false,
        reason: "out_of_stock",
        message: needsSize ? "此尺寸缺貨" : "缺貨",
      };
    }

    const currentItems = get().items;
    const currentMode = deriveMode(currentItems, getShopCatalogSnapshot());

    if (currentMode && currentMode !== target.fulfillmentType) {
      return {
        ok: false,
        reason: "mixed_fulfillment",
        message: "請先清空購物車",
      };
    }

    if (target.isAvatar) {
      const identityId = getCurrentIdentityId();
      const owned = getOwnedAvatarProductIds(identityId);
      if (owned.has(target.id)) {
        return {
          ok: false,
          reason: "avatar_already_owned",
          message: "您已擁有此商品",
        };
      }
    }

    const existing = currentItems.find((item) =>
      lineMatches(item, productId, resolvedSize),
    );
    const inCartQty = existing?.quantity ?? 0;

    if (target.isAvatar) {
      if (inCartQty >= 1) {
        return {
          ok: false,
          reason: "avatar_max_one_per_cart",
          message: "已在購物車",
        };
      }
      if (safeQuantity > 1) {
        return {
          ok: false,
          reason: "avatar_max_one_per_cart",
          message: "每款限 1 件",
        };
      }
    }

    const nextTotalQty = inCartQty + safeQuantity;
    if (nextTotalQty > lineCap) {
      const canAdd = Math.max(0, lineCap - inCartQty);
      return {
        ok: false,
        reason: "insufficient_stock",
        message:
          canAdd <= 0 ? "已達可購數量" : `尚可加入 ${canAdd} 件`,
      };
    }

    const qtyCap = target.isAvatar ? 1 : 99;
    const newLine: CartLineItem = needsSize
      ? { productId, quantity: Math.min(qtyCap, safeQuantity), size: resolvedSize }
      : { productId, quantity: Math.min(qtyCap, safeQuantity) };

    const nextItems = existing
      ? currentItems.map((item) =>
          lineMatches(item, productId, resolvedSize)
            ? {
                ...item,
                quantity: Math.min(qtyCap, item.quantity + safeQuantity),
              }
            : item,
        )
      : [...currentItems, newLine];

    const identityId = getCurrentIdentityId();
    const nextMode = deriveMode(nextItems, getShopCatalogSnapshot());
    let nextCoupon = get().coupon;
    if (nextCoupon && nextMode && !couponAppliesToMode(nextCoupon, nextMode)) {
      nextCoupon = null;
    }
    saveCart(identityId, { items: nextItems, coupon: nextCoupon });
    set({ items: nextItems, mode: nextMode, coupon: nextCoupon });
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
    const nextMode = deriveMode(nextItems, getShopCatalogSnapshot());
    let nextCoupon = get().coupon;
    if (nextItems.length === 0) {
      nextCoupon = null;
    } else if (nextCoupon && nextMode && !couponAppliesToMode(nextCoupon, nextMode)) {
      nextCoupon = null;
    }
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: nextItems, coupon: nextCoupon });
    set({ items: nextItems, mode: nextMode, coupon: nextCoupon });
  },

  updateItemQuantity: (productId, quantity, size) => {
    const product = getShopCatalogSnapshot().find((p) => p.id === productId);
    const maxQty = product?.isAvatar ? 1 : 99;
    const safeQuantity = Math.min(
      maxQty,
      Math.max(1, Math.floor(quantity)),
    );
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
    const items = get().items;
    const mode = deriveMode(items, getShopCatalogSnapshot());
    if (items.length > 0 && mode && !couponAppliesToMode(coupon, mode)) {
      return { ok: false, message: "此優惠不適用目前購物車" };
    }
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: get().items, coupon });
    set({ coupon });
    return { ok: true, message: `已套用 ${coupon.description}` };
  },

  clearCoupon: () => {
    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items: get().items, coupon: null });
    set({ coupon: null });
  },

  checkoutSuccess: () => {
    const identityId = getCurrentIdentityId();
    const avatarIds = get().items
      .map((item) =>
        getShopCatalogSnapshot().find((product) => product.id === item.productId),
      )
      .filter((product) => product?.isAvatar)
      .map((product) => product!.id);

    markAvatarAsOwned(identityId, avatarIds);
    saveCart(identityId, { items: [], coupon: null });
    set({ items: [], mode: null, coupon: null });
  },
}));

