/**
 * 所有老虎機主題共用的 TypeScript 形狀：符號、賠付線、賠率表、視覺 token、下注範圍等。
 * 具體數值在各 `themes/*.ts`。
 */

export const SLOT_GRID = { rows: 3, cols: 5 } as const;

export type SlotThemeId = "cyber-neon" | "vacant-classic" | "italian-brainrot";

export type SlotSymbol = {
  id: string;
  /** Short placeholder shown on reels (text / unicode). */
  display: string;
  /** Accessible / paytable label. */
  name: string;
  /** 相對於 `public/` 的路徑，例如 `/games/slots/vacant-classic/vc-symbol/vac.png`。有值時轉輪優先顯示圖片。 */
  imageSrc?: string;
};

/**
 * Row index (0..rows-1) per column, left → right.
 * Example: all middle row → `[1,1,1,1,1]`.
 */
export type Payline = readonly [number, number, number, number, number];

export type PaytableEntry = {
  symbolId: string;
  count: 3 | 4 | 5;
  multiplier: number;
};

export type ThemeVisualConfig = {
  shellGradient: string;
  shellBorder: string;
  reelFrame: string;
  cellSurface: string;
  symbolText: string;
  accentText: string;
  mutedText: string;
  buttonPrimary: string;
  buttonPrimaryHover: string;
  /** 0 = off, 1 = strong (CSS / filter strength). */
  glitchIntensity: number;
  /** 相對 `public/`：全區背景（cover），可選。 */
  pageBackgroundSrc?: string;
  /** 相對 `public/`：轉輪區機台外框圖（轉輪疊在中央），可選。 */
  machineFrameSrc?: string;
  /** 相對 `public/`：標題橫幅裝飾（遊戲區頂部），可選。 */
  titleBannerSrc?: string;
};

export type BettingConfig = {
  defaultBet: number;
  step: number;
  min: number;
  max: number;
};

/** Reserved for future specials (multiplier bomb, free spin, …). Empty for Cyber Neon. */
export type SlotFeatureId = string;

export type SlotThemeMeta = {
  /** `stub`: placeholder config until theme is built out. */
  status: "active" | "stub";
};

export type SlotThemeConfig = {
  id: SlotThemeId;
  headline: string;
  tagline: string;
  grid: typeof SLOT_GRID;
  symbols: readonly SlotSymbol[];
  paylines: readonly Payline[];
  paytable: readonly PaytableEntry[];
  visual: ThemeVisualConfig;
  betting: BettingConfig;
  featureIds: readonly SlotFeatureId[];
  meta: SlotThemeMeta;
};
