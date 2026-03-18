import { Card } from "@/src/components/ui/Card";

export default function LotteryPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Lottery
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          彩票 Lottery
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          目前是頁面殼。後續會加入轉盤抽獎、刮刮樂、數字彩三種玩法入口與動畫。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          {
            title: "Tralalero Lucky Wheel",
            desc: "大型幸運轉盤，抽倍數與獎金。",
          },
          {
            title: "Brainrot Scratch Cards",
            desc: "刮刮樂卡面 + 特殊角色加成。",
          },
          {
            title: "Cactuso Numbers",
            desc: "數字彩開獎：音符掉落數字球。",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-4"
          >
            <p className="text-sm font-semibold text-neutral-50">{item.title}</p>
            <p className="mt-2 text-xs text-neutral-400">{item.desc}</p>
            <p className="mt-4 text-[11px] font-semibold text-cyan-200/90">
              Coming soon
            </p>
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

