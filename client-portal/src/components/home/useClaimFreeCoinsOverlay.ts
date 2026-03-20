"use client";

import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useWalletStore } from "@/src/store/walletStore";

export function useClaimFreeCoinsOverlay() {
  const userId = useAuthStore((s) => s.user?.id);
  const hydrateForCurrentUser = useWalletStore(
    (s) => s.hydrateForCurrentUser,
  );
  const claimFreeCoins = useWalletStore((s) => s.claimFreeCoins);

  const [claimedFeedback, setClaimedFeedback] = useState(false);
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 確保 overlay 掛載後 wallet 已載入，避免按鈕無反應。
    hydrateForCurrentUser();
  }, [hydrateForCurrentUser, userId]);

  useEffect(() => {
    // 讓音效在第一次交互前就準備好，提升點擊回饋體感。
    clickAudioRef.current = new Audio("/sounds/claim-click.mp3");
    clickAudioRef.current.preload = "auto";
  }, []);

  const onClaim = () => {
    // 音效播放失敗不應影響領取流程（例如瀏覽器擋住自動播放）。
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0;
      void clickAudioRef.current.play().catch(() => {});
    }

    claimFreeCoins();
    setClaimedFeedback(true);
    window.setTimeout(() => {
      setClaimedFeedback(false);
    }, 900);
  };

  return { onClaim, claimedFeedback };
}

