import { BlackjackTable } from "@/src/games/blackjack/components/BlackjackTable";

export default function BlackjackPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Table Game
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          二十一點 Blackjack
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          Italian Brainrot 牌桌第一版：標準規則 + Hit / Stand / Double / Split +
          錢包對帳流程。
        </p>
      </div>
      <BlackjackTable />
    </main>
  );
}

