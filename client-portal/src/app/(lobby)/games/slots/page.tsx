/**
 * 老虎機大廳列表：靜態 `slots` 陣列驅動圖卡；`getSlotThemeAvailability` 控制維護／即將開放顯示。
 */
import { Card } from "@/src/components/ui/Card";
import { GameThemeCard } from "@/src/components/ui/GameThemeCard";
import { getSlotThemeAvailability } from "@/src/games/slots/config";

type SlotListItem = {
  id: string;
  name: string;
  description: string;
  /** 圖卡右上角：遊戲類型（此列表皆為老虎機） */
  tag: string;
  cardTitle: string;
  imageSrc?: string;
};

const slots: SlotListItem[] = [
  {
    id: "italian-brainrot",
    name: "Italian Brainrot Slots",
    description: "Tralalero、Bombardiro、Elefanto Cactuso 等角色主題。",
    tag: "Slots",
    cardTitle: "ITALIAN\nBRAINROT",
    imageSrc: "/games/slots/italian-brainrot/ib_card.png",
  },
  {
    id: "vacant-classic",
    name: "vAcAnt Classic",
    description: "霓虹馬 + vAcAnt 品牌主題。",
    tag: "Slots",
    cardTitle: "VACANT\nCLASSIC",
    imageSrc: "/games/slots/vacant-classic/vc_card.png",
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    description: "賽博龐克夜城霓虹、故障特效。",
    tag: "Slots",
    cardTitle: "CYBER\nNEON",
    imageSrc: "/games/slots/cyber-neon/cn_card.png",
  },
  {
    id: "john-pork",
    name: "John Pork",
    description: "來電梗圖風格；即將開放。",
    tag: "Slots",
    cardTitle: "JOHN\nPORK",
    imageSrc: "/games/slots/john-pork/jp_card.png",
  },
];

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
          主題入口與圖卡陸續上架；共用的 slot engine 將於後續抽出。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slots.map((slot) => (
          <div key={slot.id} className="space-y-2">
            <GameThemeCard
              href={`/games/slots/${slot.id}`}
              imageSrc={slot.imageSrc}
              imageAlt={slot.name}
              title={slot.cardTitle}
              tag={slot.tag}
              availability={getSlotThemeAvailability(slot.id)}
            />
            <p className="px-1 text-xs text-neutral-400">{slot.description}</p>
          </div>
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
