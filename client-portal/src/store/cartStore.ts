"use client";

/**
 * 購物車狀態（localStorage 持久化、加車規則、優惠券）。
 * 金額試算請用 `calculateCartSummary`（見 cartSummary）；型別見 cartTypes。
 */

import { create } from "zustand";
import type { ApparelSize } from "@/src/shop/types";
import { stockAvailableForLine } from "@/src/shop/stock";
import { couponAppliesToMode, deriveMode } from "@/src/store/cartSummary";
import type { CartLineItem, CartMode, CouponFulfillmentScope, CouponState } from "@/src/store/cartTypes";
import { useAuthStore } from "@/src/store/authStore";
import { getShopCatalogSnapshot } from "@/src/store/shopCatalogStore";
import { supabase } from "@/src/lib/supabaseClient";

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
  hydrate: () => Promise<void>;
  addItem: (productId: string, quantity: number, size?: ApparelSize) => AddResult;
  removeItem: (productId: string, size?: ApparelSize) => void;
  updateItemQuantity: (productId: string, quantity: number, size?: ApparelSize) => void;
  clearCart: () => void;
  clearAndAdd: (productId: string, quantity: number, size?: ApparelSize) => AddResult;
  applyCoupon: (rawCode: string) => Promise<{ ok: boolean; message: string }>;
  clearCoupon: () => void;
  checkoutSuccess: () => void;
};

type StoredCart = {
  items: CartLineItem[];
  couponCode: string | null;
};

/** Supabase DB 的 coupons 列型別（僅前端需要的欄位） */
type DbCouponRow = {
  code: string;
  discount_type: "percentage" | "fixed" | "free_shipping";
  discount_value: number;
  min_purchase: number;
  expires_at: string | null;
  is_active: boolean;
  applies_fulfillment: string;
  title: string;
};

/** 查 Supabase：驗證優惠碼是否有效（active、未刪除、未過期） */
async function fetchCouponFromDb(code: string): Promise<DbCouponRow | null> {
  const { data, error } = await supabase
    .from("coupons")
    .select("code, discount_type, discount_value, min_purchase, expires_at, is_active, applies_fulfillment, title")
    .eq("code", code)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as DbCouponRow;
  if (row.expires_at && new Date(row.expires_at) < new Date()) return null;
  return row;
}

/** DB 列 → 前端 CouponState */
function dbRowToCouponState(row: DbCouponRow): CouponState {
  let description = row.title?.trim() || "";
  if (!description) {
    if (row.discount_type === "percentage") description = `${100 - row.discount_value} 折`;
    else if (row.discount_type === "fixed") description = `折 ${row.discount_value} VAC`;
    else description = "免運";
  }
  return {
    code: row.code,
    discountType: row.discount_type,
    percentOffPoints: row.discount_type === "percentage" ? row.discount_value : 0,
    fixedOffVac: row.discount_type === "fixed" ? row.discount_value : 0,
    description,
    appliesFulfillment: row.applies_fulfillment as CouponFulfillmentScope,
  };
}

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

type SavePayload = { items: CartLineItem[]; coupon: CouponState | null };

function saveCart(identityId: string, payload: SavePayload) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getCartStorageKey(identityId), JSON.stringify(payload));
}

/** localStorage 存的 coupon 只取 code，實際內容在 hydrate 時重新向 DB 取 */
function extractStoredCouponCode(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as { code?: unknown };
  if (typeof rec.code !== "string" || !rec.code.trim()) return null;
  return rec.code.trim().toUpperCase();
}

function loadCart(identityId: string): StoredCart {
  if (typeof window === "undefined") {
    return { items: [], couponCode: null };
  }
  const raw = window.localStorage.getItem(getCartStorageKey(identityId));
  if (!raw) {
    return { items: [], couponCode: null };
  }
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const items = normalizeStoredItems(parsed["items"]);
    const couponCode = extractStoredCouponCode(parsed["coupon"]);
    return { items, couponCode };
  } catch {
    return { items: [], couponCode: null };
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


export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  mode: null,
  coupon: null,

  hydrate: async () => {
    const identityId = getCurrentIdentityId();
    const stored = loadCart(identityId);
    const mode = deriveMode(stored.items, getShopCatalogSnapshot());
    // 先顯示商品，coupon 等 DB 驗證後再填入
    set({ items: stored.items, mode, coupon: null });

    if (stored.couponCode) {
      const row = await fetchCouponFromDb(stored.couponCode);
      if (row) {
        const coupon = dbRowToCouponState(row);
        if (!mode || couponAppliesToMode(coupon, mode)) {
          set({ coupon });
          saveCart(identityId, { items: stored.items, coupon });
          return;
        }
      }
      // 優惠碼已失效或不適用，清除 localStorage 記錄
      saveCart(identityId, { items: stored.items, coupon: null });
    }
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

  applyCoupon: async (rawCode) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return { ok: false, message: "請輸入優惠碼" };

    const row = await fetchCouponFromDb(code);
    if (!row) return { ok: false, message: "無效優惠碼" };

    // 驗證最低消費
    const items = get().items;
    const catalog = getShopCatalogSnapshot();
    if (row.min_purchase > 0) {
      const subtotal = items.reduce((sum, item) => {
        const p = catalog.find((product) => product.id === item.productId);
        return sum + (p?.priceVac ?? 0) * item.quantity;
      }, 0);
      if (subtotal < row.min_purchase) {
        return { ok: false, message: `最低消費 ${row.min_purchase} VAC 才可使用` };
      }
    }

    const coupon = dbRowToCouponState(row);
    const mode = deriveMode(items, catalog);
    if (items.length > 0 && mode && !couponAppliesToMode(coupon, mode)) {
      return { ok: false, message: "此優惠不適用目前購物車" };
    }

    const identityId = getCurrentIdentityId();
    saveCart(identityId, { items, coupon });
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

