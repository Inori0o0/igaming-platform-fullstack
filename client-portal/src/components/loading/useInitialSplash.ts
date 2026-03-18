"use client";

import { useEffect, useMemo, useState } from "react";

type UseInitialSplashOptions = {
  isAuthLoading: boolean;
  storageKey?: string;
};

export function useInitialSplash({
  isAuthLoading,
  storageKey = "vacant.initialSplashShown.v1",
}: UseInitialSplashOptions) {
  // 這個 hook 的目的，是讓 `ClientLayoutShell` 盡量只負責「版面」而不是「狀態機」。
  // 它集中管理「每個分頁 session 只出現一次的首次進站 Splash」邏輯，並確保 SSR/CSR
  // 初次 render 的 HTML 一致，避免 hydration mismatch。
  const [mounted, setMounted] = useState(false);
  const [hasShownInitialSplash, setHasShownInitialSplash] = useState(true);

  useEffect(() => {
    // 某些 lint 規則不允許在 effect body 內「同步」setState；
    // 這裡用 requestAnimationFrame 把 setState 延到下一個 frame，避免告警，
    // 同時也確保 mounted 只會在 client 端 mount 後才變成 true。
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    // sessionStorage 只存在於瀏覽器端；延後讀取可以保持 SSR 初始輸出穩定，
    // 避免 server/client 初次 HTML 不一致。
    const frame = requestAnimationFrame(() => {
      const previouslyShown = window.sessionStorage.getItem(storageKey) === "1";
      setHasShownInitialSplash(previouslyShown);
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => {
    // 當 auth 第一次結束 loading，就把「已看過 Splash」寫入 sessionStorage，
    // 讓同一個分頁 session 之後不會再跑全螢幕 Splash。
    if (!isAuthLoading && !hasShownInitialSplash) {
      const frame = requestAnimationFrame(() => {
        setHasShownInitialSplash(true);
        window.sessionStorage.setItem(storageKey, "1");
      });
      return () => cancelAnimationFrame(frame);
    }
    return;
  }, [hasShownInitialSplash, isAuthLoading, storageKey]);

  return useMemo(() => {
    const shouldShowInitialSplash =
      mounted && isAuthLoading && !hasShownInitialSplash;
    const shouldShowInlineLoading =
      mounted && isAuthLoading && hasShownInitialSplash;

    return {
      mounted,
      hasShownInitialSplash,
      shouldShowInitialSplash,
      shouldShowInlineLoading,
    };
  }, [hasShownInitialSplash, isAuthLoading, mounted]);
}

