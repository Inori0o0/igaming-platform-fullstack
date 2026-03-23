import type { SlotThemeConfig } from "../types";
import { SLOT_GRID } from "../types";

/** 符號圖於 `public/games/slots/italian-brainrot/ib-symbol/`；倍率由高到低 ib_a → ib_f。 */
export const italianBrainrotTheme = {
  id: "italian-brainrot",
  headline: "Italian Brainrot Slots",
  tagline: "賽博霓虹腦爛宇宙：Tung、Brr、Lirilì、Bombardino、Tralalero、Obama。",
  grid: SLOT_GRID,
  symbols: [
    {
      id: "ib_a",
      display: "TTT",
      name: "Tung Tung Tung Sahur",
      imageSrc:
        "/games/slots/italian-brainrot/ib-symbol/ib_triplet.png",
    },
    {
      id: "ib_b",
      display: "Brr",
      name: "Brr Brr Patapim",
      imageSrc:
        "/games/slots/italian-brainrot/ib-symbol/ib_brr_brr_patapim.png",
    },
    {
      id: "ib_c",
      display: "Lir",
      name: "Lirilì Larilà",
      imageSrc:
        "/games/slots/italian-brainrot/ib-symbol/ib_lirili_larila.png",
    },
    {
      id: "ib_d",
      display: "Bom",
      name: "Bombardino Crocodillo",
      imageSrc:
        "/games/slots/italian-brainrot/ib-symbol/ib_bombardino_crocodillo.png",
    },
    {
      id: "ib_e",
      display: "Tra",
      name: "Tralalero Tralala",
      imageSrc:
        "/games/slots/italian-brainrot/ib-symbol/ib_tralalero_tralala.png",
    },
    {
      id: "ib_f",
      display: "OHD",
      name: "Obama Have Dih",
      imageSrc:
        "/games/slots/italian-brainrot/ib-symbol/ib_obama_have_dih.png",
    },
  ],
  paylines: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ],
  paytable: [
    { symbolId: "ib_a", count: 5, multiplier: 100 },
    { symbolId: "ib_a", count: 4, multiplier: 40 },
    { symbolId: "ib_a", count: 3, multiplier: 10 },
    { symbolId: "ib_b", count: 5, multiplier: 60 },
    { symbolId: "ib_b", count: 4, multiplier: 24 },
    { symbolId: "ib_b", count: 3, multiplier: 6 },
    { symbolId: "ib_c", count: 5, multiplier: 40 },
    { symbolId: "ib_c", count: 4, multiplier: 16 },
    { symbolId: "ib_c", count: 3, multiplier: 4 },
    { symbolId: "ib_d", count: 5, multiplier: 25 },
    { symbolId: "ib_d", count: 4, multiplier: 10 },
    { symbolId: "ib_d", count: 3, multiplier: 2 },
    { symbolId: "ib_e", count: 5, multiplier: 15 },
    { symbolId: "ib_e", count: 4, multiplier: 6 },
    { symbolId: "ib_e", count: 3, multiplier: 1 },
    { symbolId: "ib_f", count: 5, multiplier: 10 },
    { symbolId: "ib_f", count: 4, multiplier: 4 },
    { symbolId: "ib_f", count: 3, multiplier: 1 },
  ],
  visual: {
    shellGradient: "from-neutral-950 via-emerald-950/40 to-neutral-950",
    shellBorder: "border-emerald-500/25",
    reelFrame: "border-emerald-500/20 bg-neutral-950/60",
    cellSurface: "bg-neutral-950/70 border-emerald-500/10",
    symbolText: "text-emerald-100",
    accentText: "text-emerald-300",
    mutedText: "text-neutral-400",
    buttonPrimary:
      "group relative min-w-[10rem] overflow-hidden rounded-full border-2 border-emerald-400/55 bg-linear-to-b from-emerald-500/45 via-emerald-600/25 to-teal-950/40 px-8 py-3.5 text-sm font-bold tracking-wide text-emerald-50 shadow-[0_0_22px_rgba(16,185,129,0.5),0_0_1px_rgba(255,255,255,0.35)_inset,0_1px_0_rgba(255,255,255,0.12)_inset] ring-1 ring-lime-400/25 transition-all duration-200 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/45 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 sm:min-w-[11rem] sm:px-10 sm:py-4 sm:text-base",
    buttonPrimaryHover:
      "hover:scale-[1.05] hover:border-emerald-200/75 hover:from-emerald-400/55 hover:shadow-[0_0_36px_rgba(16,185,129,0.65),0_0_64px_rgba(163,230,53,0.22)] hover:brightness-110 disabled:hover:scale-100 disabled:hover:brightness-100",
    glitchIntensity: 0.15,
    pageBackgroundSrc: "/games/slots/italian-brainrot/ib_bg.png",
    machineFrameSrc: "/games/slots/italian-brainrot/ib_slot_machine_frame.png",
    titleBannerSrc: "/games/slots/italian-brainrot/ib_banner.png",
  },
  betting: {
    defaultBet: 100,
    step: 25,
    min: 25,
    max: 500,
  },
  featureIds: [],
  meta: { status: "active" },
} as const satisfies SlotThemeConfig;
