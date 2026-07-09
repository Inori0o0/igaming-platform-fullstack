import { toNumber } from "@/src/lib/numeric";

export { toNumber } from "@/src/lib/numeric";

export const PAGE_SIZE = 10;

export const gameOptions = [
  { value: "all", label: "全部遊戲" },
  { value: "slots", label: "Slots" },
  { value: "blackjack", label: "Blackjack" },
  { value: "baccarat", label: "Baccarat" },
] as const;

export type GameFilter = (typeof gameOptions)[number]["value"];

export type DbHistoryRow = {
  id: string;
  game_id: string | null;
  theme_id: string | null;
  round_id: string | null;
  amount: number | string;
  created_at: string;
  metadata: Record<string, unknown> | null;
};

export type ProfileGameHistoryRow = {
  id: string;
  gameId: string | null;
  gameLabel: string;
  themeId: string | null;
  roundId: string | null;
  betAmount: number;
  winAmount: number;
  createdAt: string;
};

export function gameLabelById(gameId: string | null) {
  if (gameId === "slots") return "Slots";
  if (gameId === "blackjack") return "Blackjack";
  if (gameId === "baccarat") return "Baccarat";
  return "其他";
}

export function dateRangeIso(localDate: string) {
  // 依使用者本地時區切日界線，再轉 ISO 給 Supabase 查詢。
  const start = new Date(`${localDate}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export function buildHistoryRow(row: DbHistoryRow): ProfileGameHistoryRow {
  const metadata = row.metadata ?? {};
  // 目前每局投注額從 payout 交易的 metadata.totalBet 還原。
  const totalBetFromMetadata = toNumber(metadata.totalBet as number | string);
  return {
    id: row.id,
    gameId: row.game_id,
    gameLabel: gameLabelById(row.game_id),
    themeId: row.theme_id,
    roundId: row.round_id,
    betAmount: totalBetFromMetadata,
    winAmount: toNumber(row.amount),
    createdAt: row.created_at,
  };
}

export function sumWinAmount(rows: Array<{ amount: number | string | null | undefined }>) {
  return rows.reduce((sum, row) => sum + toNumber(row.amount), 0);
}
