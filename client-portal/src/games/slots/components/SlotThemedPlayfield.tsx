"use client";

/**
 * 單一主題老虎機畫面總成：狀態（盤面、spin、結算）、背景／橫幅／外框、5 欄 ReelColumn、
 * 結果區、轉動按鈕與側欄說明。為示範用 client 元件（含動畫與計時）。
 */
import clsx from "clsx";
import { useReducedMotion } from "framer-motion";
import type { SlotThemeConfig } from "@/src/games/slots/config";
import { SlotPlayfieldBanner } from "./slot-playfield/SlotPlayfieldBanner";
import { SlotPlayfieldShell } from "./slot-playfield/SlotPlayfieldShell";
import { SlotPlayfieldSidebar } from "./slot-playfield/SlotPlayfieldSidebar";
import { SlotPlayfieldSpinControls } from "./slot-playfield/SlotPlayfieldSpinControls";
import { SlotSpinResult } from "./slot-playfield/SlotSpinResult";
import { SlotReelGrid } from "./slot-playfield/SlotReelGrid";
import { useSlotPlayfieldState } from "./slot-playfield/useSlotPlayfieldState";
import { useSlotCellPx } from "./slot-playfield/useSlotCellPx";
import { useSlotPlayfieldView } from "./slot-playfield/useSlotPlayfieldView";

type SlotThemedPlayfieldProps = {
  theme: SlotThemeConfig;
};

export function SlotThemedPlayfield({ theme }: SlotThemedPlayfieldProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const cellPx = useSlotCellPx();
  const { v, pageBg, frameSrc, bannerSrc, shellOverArt, glitchStyle } =
    useSlotPlayfieldView({
      theme,
      reduceMotion,
    });
  const {
    pool,
    spinToken,
    spinning,
    totalBet,
    spinError,
    columns,
    vacBalance,
    lastEvaluation,
    highlightKeys,
    runDemoSpin,
    onTotalBetChange,
  } = useSlotPlayfieldState({ theme });

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl",
        pageBg && "-mx-4 px-4 py-6 md:-mx-8 md:px-8",
      )}
    >
      {pageBg ? (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${pageBg})` }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-0 space-y-4">
        {bannerSrc ? (
          <SlotPlayfieldBanner bannerSrc={bannerSrc} title={theme.headline} />
        ) : null}

        <SlotPlayfieldShell
          theme={theme}
          hasBanner={Boolean(bannerSrc)}
          shellOverArt={shellOverArt}
          style={glitchStyle}
        >
          <SlotReelGrid
            pool={pool}
            visual={v}
            frameSrc={frameSrc}
            spinToken={spinToken}
            spinning={spinning}
            reducedMotion={reduceMotion}
            columns={columns}
            highlightKeys={highlightKeys}
            cellPx={cellPx}
          />

          <div className="mt-4">
            <SlotSpinResult
              theme={theme}
              evaluation={lastEvaluation}
              spinning={spinning}
            />
          </div>

          <SlotPlayfieldSpinControls
            theme={theme}
            spinning={spinning}
            onSpin={runDemoSpin}
            totalBet={totalBet}
            vacBalance={vacBalance}
            onTotalBetChange={onTotalBetChange}
            spinError={spinError}
          />
        </SlotPlayfieldShell>

        <SlotPlayfieldSidebar
          theme={theme}
          totalBet={totalBet}
        />
      </div>
    </div>
  );
}
