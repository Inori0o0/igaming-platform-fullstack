"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";
import { useWalletStore } from "@/src/store/walletStore";
import { useProfileAvatarEditor } from "@/src/components/profile/useProfileAvatarEditor";
import type { AvatarProductOption } from "@/src/components/profile/useProfileAvatarEditor";

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

export function useProfileOverviewViewModel() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  const hydrateForCurrentUser = useWalletStore(
    (s) => s.hydrateForCurrentUser,
  );
  const balances = useWalletStore((s) => s.balances);
  const transactions = useWalletStore((s) => s.transactions);

  const {
    dbUser,
    customAvatarUrl,
    equippedAvatarProductId,
    avatarProducts,
    previewAvatarUrl,
    loading: profileLoading,
    error: profileError,
    updateDisplayName,
    uploadCustomAvatar,
    clearCustomAvatar,
    selectShopAvatar,
    restoreGoogleAvatar,
  } = useProfileAvatarEditor();

  const [nameDraft, setNameDraft] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [toast, setToast] = useState<ToastState>(null);

  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.is_guest) return;
    hydrateForCurrentUser();
  }, [authLoading, hydrateForCurrentUser, user]);

  useEffect(() => {
    if (!dbUser) return;
    // 若 users.display_name 尚未存在，使用 authStore 的 display_name 作預填
    setNameDraft(dbUser.display_name ?? user?.display_name ?? "");
  }, [dbUser, user?.display_name]);

  useEffect(() => {
    if (!dbUser) return;

    let cancelled = false;
    setOrdersLoading(true);
    setOrdersCount(null);

    void (async () => {
      const { count, error } = await supabase
        .from("orders")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", dbUser.id);

      if (cancelled) return;
      if (error) {
        setOrdersCount(0);
        setOrdersLoading(false);
        return;
      }

      setOrdersCount(count ?? 0);
      setOrdersLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [dbUser]);

  const stats = useMemo(() => {
    // 目前統計基於 walletStore 已載入交易（現行上限 200 筆），屬於前端快照統計。
    const plays = transactions.filter((t) => t.type === "wager").length;
    const totalWin = transactions
      .filter((t) => t.type === "payout" && t.status === "completed")
      .reduce((sum, t) => sum + t.amount, 0);
    return { plays, totalWin };
  }, [transactions]);

  const onSaveName = async () => {
    setSavingName(true);
    try {
      await updateDisplayName(nameDraft);
      setToast({ tone: "success", message: "顯示名稱已更新。" });
    } catch (e) {
      setToast({
        tone: "error",
        message: e instanceof Error ? e.message : "顯示名稱更新失敗。",
      });
    } finally {
      setSavingName(false);
    }
  };

  const onUploadFile = async (file: File) => {
    setUploading(true);
    try {
      await uploadCustomAvatar(file);
      setToast({ tone: "success", message: "頭像上傳成功。" });
    } catch (e) {
      setToast({
        tone: "error",
        message: e instanceof Error ? e.message : "頭像上傳失敗。",
      });
    } finally {
      setUploading(false);
    }
  };

  const onClearCustomAvatar = async () => {
    try {
      await clearCustomAvatar();
      setToast({
        tone: "success",
        message: "已刪除自傳頭像，現在會回退到商店/Google 頭像。",
      });
    } catch (e) {
      setToast({
        tone: "error",
        message: e instanceof Error ? e.message : "刪除自傳頭像失敗。",
      });
    }
  };

  const onSelectShopAvatar = async (
    productId: string,
    isUnlocked: boolean,
  ) => {
    if (!isUnlocked) {
      setToast({ tone: "error", message: "尚未解鎖，請先購買此頭像。" });
      return;
    }

    try {
      await selectShopAvatar(productId);
      setToast({ tone: "success", message: "頭像切換成功。" });
    } catch (e) {
      setToast({
        tone: "error",
        message: e instanceof Error ? e.message : "頭像切換失敗。",
      });
    }
  };

  const onRestoreGoogleAvatar = async () => {
    try {
      await restoreGoogleAvatar();
      setToast({ tone: "success", message: "已切換回 Google 頭像。" });
    } catch (e) {
      setToast({
        tone: "error",
        message: e instanceof Error ? e.message : "切換 Google 頭像失敗。",
      });
    }
  };

  return {
    user,
    authLoading,
    setOpenAuthModal,

    dbUser,
    profileLoading,
    profileError,

    balances,
    transactions,
    stats,

    // Identity card
    nameDraft,
    setNameDraft,
    savingName,
    uploading,
    previewAvatarUrl,
    customAvatarUrl,

    // Shop avatar card
    equippedAvatarProductId,
    avatarProducts: avatarProducts as AvatarProductOption[],

    // Orders card
    ordersLoading,
    ordersCount,

    // Toast
    toast,

    // Actions
    onSaveName,
    onUploadFile,
    onClearCustomAvatar,
    onSelectShopAvatar,
    onRestoreGoogleAvatar,
  };
}

