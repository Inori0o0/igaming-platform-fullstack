"use client";

import { useSyncExternalStore } from "react";

/** 牌桌共用的 viewport hooks：供版面與動畫分級使用。 */
const COMPACT_QUERY = "(max-width: 1023px)";
const MOBILE_QUERY = "(max-width: 767px)";
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1023px)";

function subscribe(query: string, onChange: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(query: string) {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => subscribe(query, onChange),
    () => getSnapshot(query),
    getServerSnapshot,
  );
}

/** 手機/平板寬度（<=1023px）時回傳 true，用於緊湊版面調整。 */
export function useIsCompactTableViewport() {
  return useMediaQuery(COMPACT_QUERY);
}

/** 回傳動畫分級用 viewport tier："mobile" | "tablet" | "desktop"。 */
export function useTableViewportTier() {
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const isTablet = useMediaQuery(TABLET_QUERY);

  if (isMobile) return "mobile" as const;
  if (isTablet) return "tablet" as const;
  return "desktop" as const;
}
