"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";
import { publicObjectUrl } from "@/src/lib/supabaseStorage";

type DbUserRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  auth_user_id: string;
};

type AvatarSelectionRow = {
  avatar_product_id: string | null;
} | null;

type AvatarProductRow = {
  id: string;
  name: string;
  image_bucket: string | null;
  image_object_path: string;
  sort_order: number | null;
};

export type AvatarProductOption = {
  productId: string;
  name: string;
  imageSrc: string;
  isUnlocked: boolean;
  sortOrder: number;
};

const DEFAULT_AVATAR_BUCKET = "shop-products";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.-]+/g, "_");
}

export function useProfileAvatarEditor() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const initAuth = useAuthStore((s) => s.initAuth);

  const [dbUser, setDbUser] = useState<DbUserRow | null>(null);
  const [equippedAvatarProductId, setEquippedAvatarProductId] = useState<
    string | null
  >(null);

  const [avatarProducts, setAvatarProducts] = useState<AvatarProductOption[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user || user.is_guest) return;

    setLoading(true);
    setError(null);
    try {
      // 先定位當前 auth user 對應的 public.users（後續關聯都用 db user id）。
      const { data: userRow, error: userErr } = await supabase
        .from("users")
        .select("id, display_name, avatar_url, auth_user_id")
        .eq("auth_user_id", user.id)
        .single();

      if (userErr || !userRow) {
        throw new Error(userErr?.message ?? "找不到 users 資料列");
      }

      // 1) 讀目前裝備的商店頭像
      const { data: selectionData, error: selectionErr } = await supabase
        .from("user_avatar_selection")
        .select("avatar_product_id")
        .eq("user_id", userRow.id)
        .maybeSingle();

      if (selectionErr) throw new Error(selectionErr.message);
      const selection = (selectionData ?? null) as AvatarSelectionRow;

      // 2) 讀所有頭像商品（用鎖/解鎖決定可選）
      const { data: products, error: productsErr } = await supabase
        .from("products")
        .select("id, name, image_bucket, image_object_path, sort_order")
        .eq("is_avatar", true)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (productsErr) throw new Error(productsErr.message);
      const productRows = (products ?? []) as AvatarProductRow[];

      // 3) 讀擁有的頭像（user_entitlements）
      const { data: entitlements, error: entErr } = await supabase
        .from("user_entitlements")
        .select("product_id")
        .eq("user_id", userRow.id)
        .eq("entitlement_type", "avatar");

      if (entErr) throw new Error(entErr.message);
      const owned = new Set((entitlements ?? []).map((e) => e.product_id as string));

      const mapped = productRows
        .map((p) => {
          const bucket = (p.image_bucket ?? DEFAULT_AVATAR_BUCKET).trim();
          return {
            productId: p.id,
            name: p.name,
            imageSrc: publicObjectUrl(bucket, p.image_object_path),
            isUnlocked: owned.has(p.id),
            sortOrder: Number(p.sort_order ?? 0),
          } satisfies AvatarProductOption;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder);

      setDbUser(userRow as DbUserRow);
      setEquippedAvatarProductId(selection?.avatar_product_id ?? null);
      setAvatarProducts(mapped);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError(e instanceof Error ? e.message : "載入失敗");
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.is_guest) {
      setDbUser(null);
      setEquippedAvatarProductId(null);
      setAvatarProducts([]);
      setLoading(false);
      setError(null);
      return;
    }

    void reload();
  }, [authLoading, reload, user]);

  const customAvatarUrl = dbUser?.avatar_url ?? null;

  const previewAvatarUrl = useMemo(() => {
    // 頭像顯示優先序：使用者上傳 > 商店裝備 > Google OAuth metadata
    if (customAvatarUrl) return customAvatarUrl;
    if (equippedAvatarProductId) {
      return (
        avatarProducts.find((p) => p.productId === equippedAvatarProductId)
          ?.imageSrc ?? null
      );
    }
    return user && !user.is_guest ? user.avatar_url ?? null : null;
  }, [avatarProducts, customAvatarUrl, equippedAvatarProductId, user]);

  const updateDisplayName = useCallback(
    async (nextName: string) => {
      if (!user || user.is_guest) return;
      const trimmed = nextName.trim();
      if (!trimmed) throw new Error("顯示名稱不能為空");

      const { error: upErr } = await supabase
        .from("users")
        .update({ display_name: trimmed })
        .eq("auth_user_id", user.id);

      if (upErr) throw upErr;
      await initAuth();
      await reload();
    },
    [initAuth, reload, user],
  );

  const uploadCustomAvatar = useCallback(
    async (file: File) => {
      if (!user || user.is_guest) return;
      if (!file.type.startsWith("image/")) {
        throw new Error("請上傳圖片檔");
      }
      // 這裡只做簡單上限；若你有更嚴格需求可再調整
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("圖片太大（上限 5MB）");
      }

      const ext = file.name.includes(".")
        ? file.name.split(".").pop()
        : "img";
      const safeName = sanitizeFileName(file.name);
      const objectPath = `${user.id}/${crypto.randomUUID()}-${safeName || `avatar.${ext}`}`;

      const { error: upErr } = await supabase.storage
        .from("user-avatars")
        .upload(objectPath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (upErr) {
        if (upErr.message.toLowerCase().includes("row-level security")) {
          throw new Error("沒有上傳權限，請確認已執行 user-avatars migration。");
        }
        throw upErr;
      }

      const url = publicObjectUrl("user-avatars", objectPath);
      const { error: userUpErr } = await supabase
        .from("users")
        .update({ avatar_url: url })
        .eq("auth_user_id", user.id);

      if (userUpErr) throw userUpErr;

      await initAuth();
      await reload();
    },
    [initAuth, reload, user],
  );

  const clearCustomAvatar = useCallback(async () => {
    if (!user || user.is_guest) return;
    const { error } = await supabase
      .from("users")
      .update({ avatar_url: null })
      .eq("auth_user_id", user.id);
    if (error) throw error;

    await initAuth();
    await reload();
  }, [initAuth, reload, user]);

  const selectShopAvatar = useCallback(
    async (productId: string) => {
      if (!user || user.is_guest) return;
      if (!dbUser) throw new Error("尚未載入使用者資料");

      const option = avatarProducts.find((p) => p.productId === productId);
      if (!option?.isUnlocked) throw new Error("此頭像尚未解鎖");

      const { error: upErr } = await supabase
        .from("user_avatar_selection")
        .upsert(
          { user_id: dbUser.id, avatar_product_id: productId },
          { onConflict: "user_id" },
        );

      if (upErr) throw upErr;

      // 切商店頭像時清掉 custom avatar，避免 display precedence 被 custom 蓋住。
      const { error: clearErr } = await supabase
        .from("users")
        .update({ avatar_url: null })
        .eq("auth_user_id", user.id);
      if (clearErr) throw clearErr;

      await initAuth();
      await reload();
    },
    [avatarProducts, dbUser, initAuth, reload, user],
  );

  return {
    user,
    authLoading,

    dbUser,
    customAvatarUrl,
    equippedAvatarProductId,
    avatarProducts,

    previewAvatarUrl,

    loading,
    error,

    refresh: reload,
    updateDisplayName,
    uploadCustomAvatar,
    clearCustomAvatar,
    selectShopAvatar,
  };
}

