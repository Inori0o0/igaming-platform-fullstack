import Link from "next/link";
import { Card } from "@/src/components/ui/Card";

const gameCards = [
  {
    title: "Slots",
    description: "三大主題老虎機：先從 Italian Brainrot Slots 開始。",
    href: "/games/slots",
    badge: "Hot",
  },
  {
    title: "Blackjack",
    description: "霓虹腦爛牌桌，經典二十一點玩法。",
    href: "/games/blackjack",
    badge: "Table",
  },
  {
    title: "Baccarat",
    description: "閒莊和，快速一局，簡化路單之後再補。",
    href: "/games/baccarat",
    badge: "Table",
  },
  {
    title: "Lottery",
    description: "轉盤、刮刮樂、數字彩：Brainrot 彩券宇宙。",
    href: "/games/lottery",
    badge: "Luck",
  },
] as const;

export default function GamesLobbyPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Games Lobby
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          遊戲大廳
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          先把主要路由與 UI 殼鋪好，後續再逐一接上玩法與狀態管理。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {gameCards.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className="group rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-4 shadow-[0_0_60px_rgba(15,23,42,0.55)] transition hover:border-cyan-400/35 hover:bg-neutral-950/85"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-neutral-50">{game.title}</p>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
                {game.badge}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-400">
              {game.description}
            </p>
            <p className="mt-4 text-[11px] font-semibold text-cyan-200/90 group-hover:text-cyan-100">
              進入 →
            </p>
          </Link>
        ))}
      </div>

      <Card
        title="接下來會補的內容"
        description="路由已到位，接下來就能把每個遊戲頁的狀態與互動逐步做進來。"
      >
        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
          <li>Slots：/games/slots/[id] 單一遊戲 + 下注/轉動/結算</li>
          <li>Blackjack / Baccarat：發牌動畫 + 下注區 UI</li>
          <li>Lottery：抽獎動畫 + 結果歷史</li>
        </ul>
      </Card>
    </main>
  );
}

