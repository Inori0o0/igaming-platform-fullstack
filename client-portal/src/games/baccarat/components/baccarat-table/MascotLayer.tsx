"use client";

/**
 * 吉祥物獨立層（不與牌區混排）：左下 Tralalero、右下 Lirili；
 * Tung 僅在玩家贏錢或和局時於畫面中下區域顯示（與結算邏輯由 TableStage 計算後傳入）。
 */
import { motion } from "framer-motion";
import Image from "next/image";
import { BACCARAT_ASSETS } from "./constants";

type MascotMood = "idle" | "win" | "lose";

type MascotLayerProps = {
  tralaleroMood: MascotMood;
  liriliMood: MascotMood;
  showTung: boolean;
  tungFace: "win" | "tie";
};

export function MascotLayer({ tralaleroMood, liriliMood, showTung, tungFace }: MascotLayerProps) {
  return (
    <>
      {/* Tralalero (left bottom) */}
      <motion.div
        className="pointer-events-none absolute bottom-2 left-2 z-2 h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-52 lg:w-52 xl:h-60 xl:w-60"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <Image
          src={BACCARAT_ASSETS.mascot.tralalero[tralaleroMood]}
          alt="Tralalero Tralala"
          fill
          sizes="(min-width: 1280px) 240px, (min-width: 1024px) 208px, (min-width: 768px) 128px, (min-width: 640px) 112px, 96px"
          className="object-contain drop-shadow-[0_0_22px_rgba(34,211,238,0.45)]"
        />
      </motion.div>

      {/* Lirili (right bottom) */}
      <motion.div
        className="pointer-events-none absolute bottom-2 right-2 z-2 h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 lg:h-52 lg:w-52 xl:h-60 xl:w-60"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        <Image
          src={BACCARAT_ASSETS.mascot.lirili[liriliMood]}
          alt="Lirili Larila"
          fill
          sizes="(min-width: 1280px) 240px, (min-width: 1024px) 208px, (min-width: 768px) 128px, (min-width: 640px) 112px, 96px"
          className="object-contain drop-shadow-[0_0_22px_rgba(244,63,94,0.4)]"
        />
      </motion.div>

      {/* Tung (between Tralalero & Lirili, slightly upper) */}
      {showTung ? (
        <motion.div
          key={`tung-${tungFace}`}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22 }}
          className="pointer-events-none absolute left-1/2 top-[58%] z-3 h-28 w-28 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32 md:h-36 md:w-36 lg:h-56 lg:w-56 xl:h-64 xl:w-64"
          aria-hidden
        >
          <Image
            src={tungFace === "win" ? BACCARAT_ASSETS.mascot.tung.win : BACCARAT_ASSETS.mascot.tung.tie}
            alt="Tung Tung Tung Sahur"
            fill
            sizes="(min-width: 1280px) 256px, (min-width: 1024px) 224px, (min-width: 768px) 144px, (min-width: 640px) 128px, 112px"
            className="object-contain drop-shadow-[0_0_28px_rgba(34,211,238,0.5)]"
          />
        </motion.div>
      ) : null}
    </>
  );
}

