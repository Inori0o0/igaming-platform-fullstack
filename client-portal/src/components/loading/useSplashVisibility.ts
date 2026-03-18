"use client";

import { useEffect, useRef, useState } from "react";

type UseSplashVisibilityOptions = {
  /** 外部控制開關：true 顯示、false 隱藏（但會遵守 minVisibleMs） */
  show: boolean;
  /** 最短顯示時間（毫秒），避免載入很快時一閃而過 */
  minVisibleMs: number;
};

/**
 * 控制 Splash 是否可見的狀態機（只處理「何時顯示/何時隱藏」）。
 *
 * 設計目標（白話）：
 * - 外部只要把 `show` 設成 true，Splash 就「馬上能看到」
 * - 外部把 `show` 設成 false 時，若未達 `minVisibleMs`，會延後關閉
 *
 * 注意：
 * - 不把 `visible` 放進 effect 依賴，避免 setState 造成來回觸發
 * - setState 都排程在 callback（rAF/timeout）中，避開「effect 內同步 setState」的規則
 */
export function useSplashVisibility({
  show,
  minVisibleMs,
}: UseSplashVisibilityOptions) {
  const [visible, setVisible] = useState(show);
  const visibleRef = useRef(visible);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    let hideTimer: number | null = null;
    let frame: number | null = null;

    const schedule = (fn: () => void) => {
      frame = requestAnimationFrame(fn);
    };

    if (show) {
      // show=true 時「立刻可見」，並記錄顯示起點，讓 minVisibleMs 從此刻算起。
      if (shownAtRef.current === null) {
        shownAtRef.current = performance.now();
      }

      if (!visibleRef.current) {
        schedule(() => setVisible(true));
      }
    } else if (visibleRef.current) {
      const now = performance.now();
      const shownAt = shownAtRef.current ?? now;
      const elapsed = now - shownAt;
      const remaining = minVisibleMs - elapsed;

      if (remaining <= 0) {
        schedule(() => {
          setVisible(false);
          shownAtRef.current = null;
        });
      } else {
        hideTimer = window.setTimeout(() => {
          schedule(() => {
            setVisible(false);
            shownAtRef.current = null;
          });
        }, remaining);
      }
    }

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      if (hideTimer !== null) clearTimeout(hideTimer);
    };
  }, [show, minVisibleMs]);

  return visible;
}

