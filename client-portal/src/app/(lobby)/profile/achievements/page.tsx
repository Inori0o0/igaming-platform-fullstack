import { Card } from "@/src/components/ui/Card";

const sampleAchievements = [
  { title: "新手上路", desc: "完成第一場遊戲" },
  { title: "幸運之星", desc: "單次贏取 10,000+ Coins" },
  { title: "購物狂", desc: "完成第一筆訂單" },
  { title: "收藏家", desc: "擁有 3 個以上商品" },
  { title: "VIP 玩家", desc: "總遊戲次數達 67" },
] as const;

export default function ProfileAchievementsPage() {
  return (
    <main className="space-y-4">
      <Card
        title="成就（placeholder）"
        description="後續會做成就解鎖、徽章牆與進度。"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sampleAchievements.map((a) => (
            <div
              key={a.title}
              className="rounded-2xl border border-cyan-500/10 bg-neutral-950/70 p-4"
            >
              <p className="text-xs font-semibold text-neutral-50">{a.title}</p>
              <p className="mt-1 text-[11px] text-neutral-400">{a.desc}</p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Locked
              </p>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}

