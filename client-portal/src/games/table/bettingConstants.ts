/**
 * 桌遊（Blackjack / Baccarat）共用下注與籌碼設定。
 * 各遊戲的 constants.ts 應 re-export 此處常數，避免兩邊數值漂移。
 */
export const MIN_BET = 100;
export const MAX_BET = 100000;
export const TABLE_BET_OPTIONS = [100, 500, 1000, 5000] as const;
export const DEFAULT_BET = 500;
export const DEFAULT_BET_STEP = 500;

export type TableBetStep = (typeof TABLE_BET_OPTIONS)[number];

export const CHIP_CARD_ASSETS = {
  cardBack: "/games/chip_card/bj_card_back.webp",
  chips: {
    100: "/games/chip_card/chip_100.webp",
    500: "/games/chip_card/chip_500.webp",
    1000: "/games/chip_card/chip_1000.webp",
    5000: "/games/chip_card/chip_5000.webp",
  },
} as const;
