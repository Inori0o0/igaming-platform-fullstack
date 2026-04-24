import type { SlotThemeConfig } from "../types";
import { SLOT_GRID } from "../types";

/**
 * Cyber Neon — abstract cyberpunk symbols only (no brand mashup).
 * Mechanics: base paylines + multipliers in paytable; no special features yet.
 */
export const cyberNeonTheme = {
  id: "cyber-neon",
  headline: "Cyber Neon",
  tagline: "夜城霓虹、故障邊緣、機械籌碼感（純賽博占位符號）。",
  grid: SLOT_GRID,
  symbols: [
    { id: "neon_core", display: "◉", name: "核心光球" },
    { id: "chip_prime", display: "▣", name: "Prime 晶片" },
    { id: "geo_shard", display: "◇", name: "幾何裂片" },
    { id: "circuit_grid", display: "⌗", name: "電路格" },
    { id: "hex_node", display: "⬡", name: "六邊節點" },
    { id: "data_pulse", display: "≋", name: "數據脈衝" },
  ],
  paylines: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0],
    [2, 1, 0, 1, 2],
  ],
  paytable: [
    { symbolId: "neon_core", count: 5, multiplier: 120 },
    { symbolId: "neon_core", count: 4, multiplier: 45 },
    { symbolId: "neon_core", count: 3, multiplier: 12 },
    { symbolId: "chip_prime", count: 5, multiplier: 80 },
    { symbolId: "chip_prime", count: 4, multiplier: 30 },
    { symbolId: "chip_prime", count: 3, multiplier: 8 },
    { symbolId: "geo_shard", count: 5, multiplier: 50 },
    { symbolId: "geo_shard", count: 4, multiplier: 18 },
    { symbolId: "geo_shard", count: 3, multiplier: 5 },
    { symbolId: "circuit_grid", count: 5, multiplier: 35 },
    { symbolId: "circuit_grid", count: 4, multiplier: 12 },
    { symbolId: "circuit_grid", count: 3, multiplier: 3 },
    { symbolId: "hex_node", count: 5, multiplier: 22 },
    { symbolId: "hex_node", count: 4, multiplier: 8 },
    { symbolId: "hex_node", count: 3, multiplier: 2 },
    { symbolId: "data_pulse", count: 5, multiplier: 14 },
    { symbolId: "data_pulse", count: 4, multiplier: 5 },
    { symbolId: "data_pulse", count: 3, multiplier: 1 },
  ],
  visual: {
    shellGradient:
      "from-[#0a0612] via-[#1a0a2e] to-[#0f172a]",
    shellBorder: "border-fuchsia-500/35",
    reelFrame: "border-violet-500/25 bg-black/40",
    cellSurface: "bg-violet-950/50 border-fuchsia-500/15",
    symbolText: "text-fuchsia-200",
    accentText: "text-cyan-300",
    mutedText: "text-violet-300/80",
    buttonPrimary:
      "border-fuchsia-400/50 bg-fuchsia-600/25 text-fuchsia-50",
    buttonPrimaryHover:
      "hover:border-fuchsia-300/70 hover:bg-fuchsia-500/35",
    glitchIntensity: 0.45,
  },
  betting: {
    defaultBet: 100,
    step: 100,
    min: 100,
    max: 100000,
  },
  featureIds: [],
  meta: { status: "active" },
} as const satisfies SlotThemeConfig;
