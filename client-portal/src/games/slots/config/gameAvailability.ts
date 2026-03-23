import type { SlotThemeId } from "./types";

/**
 * 老虎機主題在營運上的可玩狀態。
 * 日後可改為由後台／API／Supabase 讀取，僅需替換本檔的資料來源或包一層 async fetch。
 */
export type SlotGameAvailabilityStatus =
  | "open"
  | "maintenance"
  | "coming_soon";

/** 預設靜態表（與後台對接時可改為 DB 查詢結果）。 */
const DEFAULT_SLOT_AVAILABILITY: Record<
  SlotThemeId,
  SlotGameAvailabilityStatus
> = {
  "italian-brainrot": "open",
  "vacant-classic": "open",
  "cyber-neon": "maintenance",
};

export function getSlotThemeAvailability(
  id: string,
): SlotGameAvailabilityStatus {
  if (id in DEFAULT_SLOT_AVAILABILITY) {
    return DEFAULT_SLOT_AVAILABILITY[id as SlotThemeId];
  }
  return "coming_soon";
}

export function isSlotThemePlayable(id: string): boolean {
  return getSlotThemeAvailability(id) === "open";
}

/**
 * 已上架圖卡、但尚未註冊 SlotThemeConfig 的主題（列表／即將開放頁用）。
 */
export const SLOT_COMING_SOON_META: Record<
  string,
  { headline: string; tagline?: string }
> = {
  "john-pork": {
    headline: "John Pork",
    tagline: "來電梗圖風格；遊戲內容尚未實裝。",
  },
};

export function getSlotComingSoonPlaceholder(
  id: string,
): { headline: string; tagline?: string } | undefined {
  return SLOT_COMING_SOON_META[id];
}
