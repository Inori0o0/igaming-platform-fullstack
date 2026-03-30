import { Card } from "@/src/components/ui/Card";

type ProfileStatsCardProps = {
  vacBalance: number;
  plays: number;
  totalWin: number;
  ordersLoading: boolean;
  ordersCount: number | null;
};

export function ProfileStatsCard({
  vacBalance,
  plays,
  totalWin,
  ordersLoading,
  ordersCount,
}: ProfileStatsCardProps) {
  return (
    <Card className="h-full">
      <div className="grid gap-3 justify-items-center text-center">
        <div className="w-full rounded-2xl border border-cyan-500/15 bg-neutral-950/65 p-5">
          <p className="text-xs text-neutral-400">目前 VAC 余額</p>
          <p className="mt-1 text-xl font-semibold text-neutral-50">
            {vacBalance.toLocaleString()} VAC
          </p>
        </div>
        <div className="grid gap-3 w-full sm:grid-cols-2 justify-items-center">
          <div className="w-full rounded-2xl bg-neutral-950/70 p-5 text-xs text-neutral-300">
            <p className="text-neutral-400">遊戲次數</p>
            <p className="mt-1 text-lg font-semibold text-neutral-50">
              {plays}
            </p>
          </div>
          <div className="w-full rounded-2xl bg-neutral-950/70 p-5 text-xs text-neutral-300">
            <p className="text-neutral-400">總贏取金額</p>
            <p className="mt-1 text-lg font-semibold text-neutral-50">
              {totalWin.toLocaleString()} VAC
            </p>
          </div>
        </div>
        <div className="w-full rounded-2xl bg-neutral-950/70 p-5 text-xs text-neutral-300">
          <p className="text-neutral-400">訂單數</p>
          <p className="mt-1 text-lg font-semibold text-neutral-50">
            {ordersLoading ? "—" : (ordersCount ?? "—")}
          </p>
        </div>
      </div>
    </Card>
  );
}
