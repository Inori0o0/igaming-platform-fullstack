import Link from "next/link";
import { Card } from "@/src/components/ui/Card";

const slots = [
  {
    id: "italian-brainrot",
    name: "Italian Brainrot Slots",
    description: "Tralalero、Bombardiro、Elefanto Cactuso 等角色主題。",
    tag: "Brainrot",
  },
  {
    id: "vacant-classic",
    name: "vAcAnt Classic",
    description: "霓虹馬 + vAcAnt 品牌主題。",
    tag: "Brand",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    description: "賽博龐克夜城霓虹、故障特效。",
    tag: "Cyber",
  },
] as const;

export default function SlotsListPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Slots
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          老虎機列表
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          先把三個主題入口鋪好，後續再把共用的 slot engine 抽出來。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <Link
            key={slot.id}
            href={`/games/slots/${slot.id}`}
            className="group rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-4 transition hover:border-cyan-400/35 hover:bg-neutral-950/85"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-50">
                  {slot.name}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  {slot.description}
                </p>
              </div>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.14em] text-cyan-100">
                {slot.tag}
              </span>
            </div>
            <p className="mt-4 text-[11px] font-semibold text-cyan-200/90 group-hover:text-cyan-100">
              開始遊玩 →
            </p>
          </Link>
        ))}
      </div>

      <Card
        title="下一步"
        description="當 /games/slots/[id] 實作完成後，這裡就能接上動態資料。"
      >
        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
          <li>建立 slot config（symbols、paylines、odds）</li>
          <li>轉動動畫（Framer Motion）</li>
          <li>結算與交易紀錄（wallet/transactions）</li>
        </ul>
      </Card>
    </main>
  );
}

