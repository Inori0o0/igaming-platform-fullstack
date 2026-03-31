export type AchievementType =
  | "first_game"
  | "lucky_star"
  | "first_order"
  | "collector"
  | "vip_player";

export type AchievementStats = {
  totalPlays: number;
  maxSingleWin: number;
  orderCount: number;
  entitlementCount: number;
};

export type AchievementDefinition = {
  type: AchievementType;
  title: string;
  description: string;
  isUnlocked: (stats: AchievementStats) => boolean;
  progressText: (stats: AchievementStats) => string;
};

export const achievementDefinitions: AchievementDefinition[] = [
  {
    type: "first_game",
    title: "新手上路",
    description: "完成第一場遊戲",
    isUnlocked: (stats) => stats.totalPlays >= 1,
    progressText: (stats) => `${Math.min(stats.totalPlays, 1)} / 1`,
  },
  {
    type: "lucky_star",
    title: "幸運之星",
    description: "單次贏取 10,000+",
    isUnlocked: (stats) => stats.maxSingleWin >= 10_000,
    progressText: (stats) => `${stats.maxSingleWin.toLocaleString("en-US")} / 10,000`,
  },
  {
    type: "first_order",
    title: "購物狂",
    description: "完成第一筆訂單",
    isUnlocked: (stats) => stats.orderCount >= 1,
    progressText: (stats) => `${Math.min(stats.orderCount, 1)} / 1`,
  },
  {
    type: "collector",
    title: "收藏家",
    description: "擁有 3 個以上頭像",
    isUnlocked: (stats) => stats.entitlementCount >= 3,
    progressText: (stats) =>
      `${Math.min(stats.entitlementCount, 3).toLocaleString("en-US")} / 3`,
  },
  {
    type: "vip_player",
    title: "VIP 玩家",
    description: "總遊戲次數達 67",
    isUnlocked: (stats) => stats.totalPlays >= 67,
    progressText: (stats) =>
      `${Math.min(stats.totalPlays, 67).toLocaleString("en-US")} / 67`,
  },
];

export function sumNumeric(values: Array<number | string | null | undefined>) {
  // 將 Supabase numeric 字串安全相加，避免 NaN 汙染統計。
  return values.reduce<number>((sum, value) => {
    if (typeof value === "number") return sum + value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? sum + parsed : sum;
    }
    return sum;
  }, 0);
}

export function maxNumeric(values: Array<number | string | null | undefined>) {
  // 取「單次最大贏取」時，忽略無效值並預設 0。
  let max = 0;
  for (const value of values) {
    const numeric =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value)
          : NaN;
    if (Number.isFinite(numeric) && numeric > max) {
      max = numeric;
    }
  }
  return max;
}

export function evaluateUnlocks(
  stats: AchievementStats,
  existing: Set<AchievementType>,
) {
  // 僅回傳「已達標且尚未入庫」的成就，供批次補發使用。
  return achievementDefinitions
    .filter((item) => item.isUnlocked(stats) && !existing.has(item.type))
    .map((item) => item.type);
}
