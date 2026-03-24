"use client";

/**
 * 莊家立繪（右上）與桌邊 Brr／Bombardiro 吉祥物。
 * 贏局時 Bombardiro 飛向 Brr（outbound→returning），期間 Brr 受傷圖；用 queueMicrotask 避免 effect 內同步 setState。
 */
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { BLACKJACK_ASSETS, BOMBARDIRO_WIN_DASH_MS } from "./constants";

type MascotLayerProps = {
  dealerMood: "idle" | "win" | "lose";
  brrTriggered: boolean;
  bombardiroTriggered: boolean;
};

type WinDashPhase = "idle" | "outbound" | "returning" | "done";

export function MascotLayer({ dealerMood, brrTriggered, bombardiroTriggered }: MascotLayerProps) {
  const [winDashPhase, setWinDashPhase] = useState<WinDashPhase>("idle");
  const [brrInjured, setBrrInjured] = useState(false);
  const prevWinRef = useRef(false);

  // 同步 props（贏 cue）與本地飛行狀態：避免在 effect 內同步 setState（eslint 規則），改為 microtask 排程。
  useLayoutEffect(() => {
    if (!bombardiroTriggered) {
      prevWinRef.current = false;
      queueMicrotask(() => {
        setWinDashPhase("idle");
        setBrrInjured(false);
      });
      return;
    }
    if (!prevWinRef.current && winDashPhase === "idle") {
      prevWinRef.current = true;
      queueMicrotask(() => {
        setWinDashPhase("outbound");
      });
    }
  }, [bombardiroTriggered, winDashPhase]);

  // outbound 結束 → Brr 鼻青臉腫 + 開始飛回
  useEffect(() => {
    if (winDashPhase !== "outbound") return;
    const id = window.setTimeout(() => {
      setBrrInjured(true);
      setWinDashPhase("returning");
    }, BOMBARDIRO_WIN_DASH_MS);
    return () => window.clearTimeout(id);
  }, [winDashPhase]);

  // returning 結束 → Bombardiro 回右下角並恢復未 triggered 外觀
  useEffect(() => {
    if (winDashPhase !== "returning") return;
    const id = window.setTimeout(() => {
      setWinDashPhase("done");
    }, BOMBARDIRO_WIN_DASH_MS);
    return () => window.clearTimeout(id);
  }, [winDashPhase]);

  const bombardiroShowTriggered = bombardiroTriggered && winDashPhase !== "done";

  const brrSrc = brrTriggered
    ? BLACKJACK_ASSETS.mascot.brrTriggered
    : brrInjured
      ? BLACKJACK_ASSETS.mascot.brrInjured
      : BLACKJACK_ASSETS.mascot.brrIdle;

  const isDashFlying = winDashPhase === "outbound" || winDashPhase === "returning";

  return (
    <>
      <motion.div
        className="pointer-events-none absolute right-1 top-1 z-10 h-24 w-24 sm:right-2 sm:top-2 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-56 lg:w-56 xl:h-64 xl:w-64"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image
          src={BLACKJACK_ASSETS.dealer[dealerMood]}
          alt="Tung Tung Tung Sahur dealer"
          fill
          unoptimized
          sizes="(min-width: 1280px) 256px, (min-width: 1024px) 224px, (min-width: 768px) 128px, (min-width: 640px) 112px, 96px"
          className="object-contain drop-shadow-[0_0_25px_rgba(56,189,248,0.45)]"
        />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute bottom-2 left-1 z-10 h-20 w-20 sm:left-2 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-48 lg:w-48 xl:h-52 xl:w-52"
        animate={{ scale: brrTriggered ? [1, 1.12, 1] : [1, 1.04, 1] }}
        transition={{ duration: brrTriggered ? 0.5 : 2.2, repeat: Infinity }}
      >
        <Image
          src={brrSrc}
          alt="Brr Brr Patapim mascot"
          fill
          unoptimized
          sizes="(min-width: 1280px) 208px, (min-width: 1024px) 192px, (min-width: 768px) 112px, (min-width: 640px) 96px, 80px"
          className="object-contain drop-shadow-[0_0_16px_rgba(34,211,238,0.4)]"
        />
      </motion.div>

      <motion.div
        className={`pointer-events-none absolute bottom-2 right-1 h-20 w-20 sm:right-2 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-48 lg:w-48 xl:h-52 xl:w-52 ${isDashFlying ? "z-30" : "z-10"}`}
        initial={false}
        animate={{
          x: winDashPhase === "outbound" ? "-48vw" : "0vw",
          y: isDashFlying ? -8 : 0,
          scale: isDashFlying ? 1.06 : 1,
          rotate: isDashFlying ? -4 : 0,
        }}
        transition={{
          duration: BOMBARDIRO_WIN_DASH_MS / 1000,
          ease: "easeInOut",
        }}
      >
        <Image
          src={
            bombardiroShowTriggered
              ? BLACKJACK_ASSETS.mascot.bombardiroTriggered
              : BLACKJACK_ASSETS.mascot.bombardiroIdle
          }
          alt="Bombardiro Crocodilo mascot"
          fill
          unoptimized
          sizes="(min-width: 1280px) 208px, (min-width: 1024px) 192px, (min-width: 768px) 112px, (min-width: 640px) 96px, 80px"
          className="object-contain drop-shadow-[0_0_18px_rgba(245,158,11,0.35)]"
        />
      </motion.div>
    </>
  );
}
