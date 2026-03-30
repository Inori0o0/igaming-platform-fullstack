"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";
import {
  PAGE_SIZE,
  buildHistoryRow,
  dateRangeIso,
  gameOptions,
  sumWinAmount,
  type DbHistoryRow,
  type GameFilter,
  type ProfileGameHistoryRow,
} from "@/src/components/profile/history/historyUtils";

export function useProfileGameHistory() {
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.isLoading);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  const [rows, setRows] = useState<ProfileGameHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gameFilter, setGameFilter] = useState<GameFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalWinAmount, setTotalWinAmount] = useState(0);
  const [retryNonce, setRetryNonce] = useState(0);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    [totalCount],
  );
  // 避免在 effect 內同步 setState 造成 cascading render，改用衍生值夾住頁碼。
  const safePage = useMemo(() => Math.min(page, totalPages), [page, totalPages]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;
    const timerId = window.setTimeout(() => {
      void (async () => {
        if (!user || user.is_guest) {
          if (!cancelled) {
            setRows([]);
            setTotalCount(0);
            setTotalWinAmount(0);
            setLoading(false);
            setError(null);
          }
          return;
        }

        if (!cancelled) {
          setLoading(true);
          setError(null);
        }

        const from = (safePage - 1) * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const range = dateFilter ? dateRangeIso(dateFilter) : null;

        let listQuery = supabase
          .from("transactions")
          .select(
            "id, game_id, theme_id, round_id, amount, created_at, metadata",
            { count: "exact" },
          )
          .eq("type", "payout")
          .eq("currency", "VAC")
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .range(from, to);

        // 統計與列表共用同一組篩選條件，確保卡片數據與表格一致。
        let statsQuery = supabase
          .from("transactions")
          .select("amount")
          .eq("type", "payout")
          .eq("currency", "VAC")
          .eq("status", "completed");

        if (gameFilter !== "all") {
          listQuery = listQuery.eq("game_id", gameFilter);
          statsQuery = statsQuery.eq("game_id", gameFilter);
        }
        if (range) {
          listQuery = listQuery
            .gte("created_at", range.startIso)
            .lt("created_at", range.endIso);
          statsQuery = statsQuery
            .gte("created_at", range.startIso)
            .lt("created_at", range.endIso);
        }

        const [{ data: listData, count, error: listError }, { data: statsData, error: statsError }] =
          await Promise.all([listQuery, statsQuery]);

        if (cancelled) return;

        if (listError || statsError) {
          setError(listError?.message ?? statsError?.message ?? "讀取遊戲歷史失敗");
          setRows([]);
          setTotalCount(0);
          setTotalWinAmount(0);
          setLoading(false);
          return;
        }

        const historyRows = (listData ?? []) as DbHistoryRow[];
        const winTotal = sumWinAmount((statsData ?? []) as Array<{ amount: number | string }>);

        setRows(historyRows.map(buildHistoryRow));
        setTotalCount(count ?? 0);
        setTotalWinAmount(winTotal);
        setLoading(false);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [authLoading, user, gameFilter, dateFilter, safePage, retryNonce]);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  const onGameFilterChange = useCallback((next: GameFilter) => {
    setGameFilter(next);
    setPage(1);
  }, []);

  const onDateFilterChange = useCallback((next: string) => {
    setDateFilter(next);
    setPage(1);
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateFilter("");
    setPage(1);
  }, []);

  const goPrevPage = useCallback(() => {
    setPage((cur) => Math.max(1, cur - 1));
  }, []);

  const goNextPage = useCallback(() => {
    setPage((cur) => Math.min(totalPages, cur + 1));
  }, [totalPages]);

  return {
    user,
    authLoading,
    setOpenAuthModal,
    loading,
    error,
    rows,
    gameOptions,
    gameFilter,
    onGameFilterChange,
    dateFilter,
    onDateFilterChange,
    clearDateFilter,
    totalCount,
    totalWinAmount,
    page: safePage,
    totalPages,
    goPrevPage,
    goNextPage,
    retry,
  };
}
