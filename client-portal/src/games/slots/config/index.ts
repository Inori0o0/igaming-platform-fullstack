/**
 * Slots 設定匯出點：`getSlotThemeConfig` 由 id 取主題；另有營運狀態（開放／維護／即將開放）。
 */

export type {
  BettingConfig,
  Payline,
  PaytableEntry,
  SlotFeatureId,
  SlotSymbol,
  SlotThemeConfig,
  SlotThemeId,
  SlotThemeMeta,
  ThemeVisualConfig,
} from "./types";
export { SLOT_GRID } from "./types";

import type { SlotThemeConfig } from "./types";
import { cyberNeonTheme } from "./themes/cyber-neon";
import { italianBrainrotTheme } from "./themes/italian-brainrot";
import { vacantClassicTheme } from "./themes/vacant-classic";

const registry: Record<string, SlotThemeConfig> = {
  [cyberNeonTheme.id]: cyberNeonTheme,
  [vacantClassicTheme.id]: vacantClassicTheme,
  [italianBrainrotTheme.id]: italianBrainrotTheme,
};

export const SLOT_THEME_IDS = [
  cyberNeonTheme.id,
  vacantClassicTheme.id,
  italianBrainrotTheme.id,
] as const;

export function getSlotThemeConfig(id: string): SlotThemeConfig | undefined {
  return registry[id];
}

export function isKnownSlotThemeId(id: string): id is SlotThemeConfig["id"] {
  return id in registry;
}

export {
  getSlotComingSoonPlaceholder,
  getSlotThemeAvailability,
  isSlotThemePlayable,
  SLOT_COMING_SOON_META,
  type SlotGameAvailabilityStatus,
} from "./gameAvailability";
