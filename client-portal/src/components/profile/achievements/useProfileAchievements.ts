"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";
import {
  achievementDefinitions,
  evaluateUnlocks,
  maxNumeric,
  type AchievementType,
} from "@/src/components/profile/achievements/achievementRules";

type DbAchievementRow = {
  id: string;
  achievement_type: AchievementType;
  unlocked_at: string;
};

type AchievementCardVm = {
  type: AchievementType;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progressText: string;
};

async function getDbUserId(authUserId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();
  if (error || !data?.id) {
    throw new Error("讀取使用者資料失敗");
  }
  return data.id as string;
}

async function listAchievements(dbUserId: string) {
  const { data, error } = await supabase
    .from("achievements")
    .select("id, achievement_type, unlocked_at")
    .eq("user_id", dbUserId);
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as DbAchievementRow[];
}

export function useProfileAchievements() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  const [cards, setCards] = useState<AchievementCardVm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    const timerId = window.setTimeout(() => {
      void (async () => {
        if (!user || user.is_guest) {
          if (!cancelled) {
            setCards([]);
            setLoading(false);
            setError(null);
          }
          return;
        }

        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        try {
          const dbUserId = await getDbUserId(user.id);
          const currentRows = await listAchievements(dbUserId);
          const existingTypes = new Set(currentRows.map((row) => row.achievement_type));

          // 批次補發策略：進頁時計算一次目前條件，將未解鎖但已達成的成就寫入 DB。
          const [payoutResult, ordersResult, entitlementResult] = await Promise.all([
            supabase
              .from("transactions")
              .select("amount")
              .eq("user_id", dbUserId)
              .eq("type", "payout")
              .eq("currency", "VAC")
              .eq("status", "completed"),
            supabase
              .from("orders")
              .select("id", { head: true, count: "exact" })
              .eq("user_id", dbUserId),
            supabase
              .from("user_entitlements")
              .select("id", { head: true, count: "exact" })
              .eq("user_id", dbUserId)
              .eq("entitlement_type", "avatar"),
          ]);

          if (payoutResult.error || ordersResult.error || entitlementResult.error) {
            throw new Error(
              payoutResult.error?.message ??
                ordersResult.error?.message ??
                entitlementResult.error?.message ??
                "讀取成就統計失敗",
            );
          }

          const payoutAmounts = (payoutResult.data ?? []).map((row) => row.amount);
          const stats = {
            // 6.3 定義：以 payout 筆數代表總遊戲次數（每局結算一筆 payout）。
            totalPlays: payoutAmounts.length,
            maxSingleWin: maxNumeric(payoutAmounts),
            orderCount: ordersResult.count ?? 0,
            // 收藏家目前只計 avatar entitlement。
            entitlementCount: entitlementResult.count ?? 0,
          };

          const toUnlock = evaluateUnlocks(stats, existingTypes);
          if (toUnlock.length > 0) {
            const { error: insertError } = await supabase.from("achievements").insert(
              toUnlock.map((type) => ({
                user_id: dbUserId,
                achievement_type: type,
              })),
            );
            if (insertError) {
              throw new Error(insertError.message);
            }
          }

          const latestRows = toUnlock.length > 0 ? await listAchievements(dbUserId) : currentRows;
          const latestByType = new Map(
            latestRows.map((row) => [row.achievement_type, row.unlocked_at]),
          );

          const nextCards = achievementDefinitions.map((definition) => {
            const unlockedAt = latestByType.get(definition.type) ?? null;
            // 有 unlocked_at 優先視為已解鎖；否則以即時計算結果顯示進度/狀態。
            const unlocked = Boolean(unlockedAt) || definition.isUnlocked(stats);
            return {
              type: definition.type,
              title: definition.title,
              description: definition.description,
              unlocked,
              unlockedAt,
              progressText: definition.progressText(stats),
            };
          });

          if (!cancelled) {
            setCards(nextCards);
            setLoading(false);
          }
        } catch (e) {
          if (!cancelled) {
            setError(e instanceof Error ? e.message : "讀取成就失敗");
            setCards([]);
            setLoading(false);
          }
        }
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [authLoading, retryNonce, user]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  const unlockedCount = cards.filter((item) => item.unlocked).length;

  return {
    user,
    authLoading,
    setOpenAuthModal,
    cards,
    loading,
    error,
    retry,
    unlockedCount,
    totalCount: cards.length,
  };
}
