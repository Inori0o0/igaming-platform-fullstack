"use client";

import { useSyncExternalStore } from "react";

/** Viewport ≤1023px：手機／小平板，牌桌用較穩定高度與較少動畫位移。 */
const QUERY = "(max-width: 1023px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsCompactTableViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
