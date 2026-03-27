import { Card } from "@/src/components/ui/Card";
import { GameThemeCard } from "@/src/components/ui/GameThemeCard";

type LotteryListItem = {
  id: string;
  name: string;
  description: string;
  tag: string;
  cardTitle: string;
  imageSrc: string;
};

const lotteryCards: LotteryListItem[] = [
  {
    id: "lottery-wheel",
    name: "Lucky Wheel 轉盤",
    description: "輪盤抽獎主題圖卡；玩法即將開放。",
    tag: "Lottery",
    cardTitle: "LUCKY WHEEL\n轉盤",
    imageSrc: "/games/lottery/lucky_wheel_card.png",
  },
  {
    id: "lottery-scratch",
    name: "Scratch Card 刮刮樂",
    description: "刮刮樂主題圖卡；玩法即將開放。",
    tag: "Lottery",
    cardTitle: "SCRATCH CARD\n刮刮樂",
    imageSrc: "/games/lottery/scratch_card_card.png",
  },
  {
    id: "lottery-numbers",
    name: "Number Lottery 數字彩",
    description: "數字彩票主題圖卡；玩法即將開放。",
    tag: "Lottery",
    cardTitle: "NUMBER LOTTERY\n數字彩",
    imageSrc: "/games/lottery/number_lottery_card.png",
  },
];

export default function LotteryPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Lottery
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          Lottery 彩票
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          目前是頁面殼。後續會加入轉盤抽獎、刮刮樂、數字彩三種玩法入口與動畫。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lotteryCards.map((item) => (
          <div key={item.id} className="space-y-2">
            <GameThemeCard
              href={`/games/lottery/${item.id}`}
              imageSrc={item.imageSrc}
              imageAlt={item.name}
              title={item.cardTitle}
              tag={item.tag}
              availability="coming_soon"
            />
            <p className="px-1 text-xs text-neutral-400">{item.description}</p>
          </div>
        ))}
      </div>

      <Card
        title="整合點"
        description="後續可以和成就/交易紀錄串起來。"
      >
        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
          <li>每次抽獎扣款與得獎入帳 → transactions</li>
          <li>稀有結果 → achievements</li>
          <li>歷史結果列表 → profile/history</li>
        </ul>
      </Card>
    </main>
  );
}

