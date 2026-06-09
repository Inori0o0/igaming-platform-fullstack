"use client";

import { useEffect, useRef } from "react";

/**
 * 遊戲主視覺圖片預載 hook。
 *
 * 掛載後立刻建立 Image 物件，對 primarySrc 發出網路請求；
 * onLoad / onError 任一觸發，或超過 3 秒後 timeout，才呼叫 onReady。
 * 採 one-shot 設計：once called，後續不再重複觸發。
 *
 * 用於搭配 *Client.tsx 的 isReady state：
 *   遊戲 JS bundle 下載期間 + 圖片載入期間，SplashScreen 持續可見。
 *
 * 跨 baccarat / blackjack / slots 三個模組共用，因此放在 src/hooks/。
 */
export function useGameImagePreload(
  primarySrc: string | null | undefined,
  onReady?: () => void,
) {
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    let called = false;
    const done = () => {
      if (!called) {
        called = true;
        onReadyRef.current?.();
      }
    };

    if (!primarySrc) {
      done();
      return;
    }

    const img = new window.Image();
    img.onload = done;
    img.onerror = done;
    img.src = primarySrc;

    const id = window.setTimeout(done, 3000);
    return () => window.clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}
