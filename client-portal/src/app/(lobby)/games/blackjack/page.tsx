/**
 * 二十一點路由頁：嵌入 BlackjackTable，版面與大廳其他頁一致。
 */
import dynamic from "next/dynamic";

const BlackjackTable = dynamic(
  () =>
    import("@/src/games/blackjack/components/BlackjackTable").then(
      (mod) => ({ default: mod.BlackjackTable }),
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
        載入遊戲中…
      </div>
    ),
  },
);

export default function BlackjackPage() {
  return (
    <main className="space-y-2">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Table Game
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-50">
          二十一點 Blackjack
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-300">
          經典二十一點玩法，運用 Hit、Stand、Double、Split 等策略挑戰莊家。
        </p>
      </div>
      <BlackjackTable />
    </main>
  );
}

