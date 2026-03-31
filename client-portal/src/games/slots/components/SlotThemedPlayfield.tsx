"use client";

/**
 * 單一主題老虎機畫面總成。
 * 版型是固定的一套：Banner -> Reel -> 下方三欄（下注 / 轉動 / 結果）-> 側欄。
 * 各主題只透過 theme/config 注入資料與美術資產，不再切不同頁面版型。
 */
import { useReducedMotion } from "framer-motion";
import type { SlotThemeConfig } from "@/src/games/slots/config";
import { SlotPlayfieldBanner } from "./slot-playfield/SlotPlayfieldBanner";
import { SlotPlayfieldBetControls } from "./slot-playfield/SlotPlayfieldBetControls";
import { SlotPlayfieldShell } from "./slot-playfield/SlotPlayfieldShell";
import { SlotPlayfieldSidebar } from "./slot-playfield/SlotPlayfieldSidebar";
import { SlotPlayfieldSpinButton } from "./slot-playfield/SlotPlayfieldSpinButton";
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
  const { v, pageBg, frameSrc, bannerSrc, glitchStyle } =
    useSlotPlayfieldView({
      theme,
      reduceMotion,
    });
  const {
    pool,
    spinToken,
    spinning,
    totalBet,
    columns,
    vacBalance,
    lastEvaluation,
    highlightKeys,
    runDemoSpin,
    onTotalBetChange,
  } = useSlotPlayfieldState({ theme });

  return (
    <div className="relative overflow-hidden rounded-2xl -mx-4 px-4 py-6 md:-mx-8 md:px-8">
      {pageBg ? (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${pageBg})` }}
          aria-hidden
        />
      ) : null}

      <div className="relative z-0 space-y-4">
        {bannerSrc ? (
          <div className="mx-auto w-full max-w-4xl">
            <SlotPlayfieldBanner bannerSrc={bannerSrc} title={theme.headline} />
          </div>
        ) : (
          // 沒有 banner 圖時保留同尺寸占位，避免 Reel 區突然上跳造成版面抖動。
          <div className="mx-auto w-full max-w-4xl px-1" aria-hidden>
            <div className="aspect-5/1" />
          </div>
        )}

        <SlotPlayfieldShell style={glitchStyle}>
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

          {/* Reel 下方固定三欄：左下注、中轉動、右結果。 */}
          <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.9fr)_minmax(0,1.35fr)] lg:items-stretch">
            <div className="min-w-0 overflow-hidden rounded-2xl lg:min-h-[178px]">
              <SlotPlayfieldBetControls
                theme={theme}
                spinning={spinning}
                totalBet={totalBet}
                vacBalance={vacBalance}
                onTotalBetChange={onTotalBetChange}
              />
            </div>
            <div className="min-w-0 lg:min-h-[178px]">
              <SlotPlayfieldSpinButton
                theme={theme}
                spinning={spinning}
                onSpin={runDemoSpin}
                totalBet={totalBet}
                vacBalance={vacBalance}
              />
            </div>
            <div className="min-w-0 rounded-2xl p-3 lg:min-h-[178px]">
              <SlotSpinResult
                theme={theme}
                evaluation={lastEvaluation}
                spinning={spinning}
                compact
              />
            </div>
          </div>
        </SlotPlayfieldShell>

        <SlotPlayfieldSidebar theme={theme} totalBet={totalBet} />
      </div>
    </div>
  );
}
