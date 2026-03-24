/**
 * 遊戲大廳：單一圖卡網格（與 /games/slots 列表版型一致），不區分遊戲分類區塊。
 * 資料：老虎機 4、二十一點 1、百家樂 1、彩票 3；缺圖主題以無圖占位，仍顯示類型標籤。
 */
import { GameThemeCard } from "@/src/components/ui/GameThemeCard";
import {
  getSlotThemeAvailability,
  type SlotGameAvailabilityStatus,
} from "@/src/games/slots/config";

type LobbyCardItem = {
  id: string;
  href: string;
  name: string;
  description: string;
  /** 圖卡右上角：遊戲類型 */
  tag: string;
  cardTitle: string;
  imageSrc?: string;
  /** 老虎機主題才走 slot 可用性；其餘固定 open */
  availability: SlotGameAvailabilityStatus;
};

const lobbyCards: LobbyCardItem[] = [
  // —— Slots（4）——
  {
    id: "slot-italian-brainrot",
    href: "/games/slots/italian-brainrot",
    name: "Italian Brainrot Slots",
    description: "Tralalero、Bombardiro、Lirilì Larilà 等角色主題。",
    tag: "老虎機",
    cardTitle: "ITALIAN\nBRAINROT",
    imageSrc: "/games/slots/italian-brainrot/ib_card.png",
    availability: getSlotThemeAvailability("italian-brainrot"),
  },
  {
    id: "slot-vacant-classic",
    href: "/games/slots/vacant-classic",
    name: "vAcAnt Classic",
    description: "霓虹馬 + vAcAnt 品牌主題。",
    tag: "老虎機",
    cardTitle: "VACANT\nCLASSIC",
    imageSrc: "/games/slots/vacant-classic/vc_card.png",
    availability: getSlotThemeAvailability("vacant-classic"),
  },
  {
    id: "slot-cyber-neon",
    href: "/games/slots/cyber-neon",
    name: "Cyber Neon",
    description: "賽博龐克夜城霓虹、故障特效。",
    tag: "老虎機",
    cardTitle: "CYBER\nNEON",
    imageSrc: "/games/slots/cyber-neon/cn_card.png",
    availability: getSlotThemeAvailability("cyber-neon"),
  },
  {
    id: "slot-john-pork",
    href: "/games/slots/john-pork",
    name: "John Pork",
    description: "來電梗圖風格；即將開放。",
    tag: "老虎機",
    cardTitle: "JOHN\nPORK",
    imageSrc: "/games/slots/john-pork/jp_card.png",
    availability: getSlotThemeAvailability("john-pork"),
  },
  // —— 二十一點（1）——
  {
    id: "blackjack-main",
    href: "/games/blackjack",
    name: "Blackjack 二十一點",
    description: "Italian Brainrot 主題牌桌；標準玩法與過五關。",
    tag: "二十一點",
    cardTitle: "BLACKJACK\n二十一點",
    imageSrc: "/games/blackjack/bj_card.png",
    availability: "open",
  },
  // —— 百家樂（1，圖卡待補）——
  {
    id: "baccarat-main",
    href: "/games/baccarat",
    name: "百家樂",
    description: "閒莊和；路單與動畫之後再補。",
    tag: "百家樂",
    cardTitle: "BACCARAT\n百家樂",
    availability: "open",
  },
  // —— 彩票（3，圖卡待補）——
  {
    id: "lottery-wheel",
    href: "/games/lottery",
    name: "彩票 · 轉盤",
    description: "大廳入口；玩法細節之後接上。",
    tag: "彩票",
    cardTitle: "轉盤\nLOTTERY",
    availability: "open",
  },
  {
    id: "lottery-scratch",
    href: "/games/lottery",
    name: "彩票 · 刮刮樂",
    description: "大廳入口；玩法細節之後接上。",
    tag: "彩票",
    cardTitle: "刮刮樂\nLOTTERY",
    availability: "open",
  },
  {
    id: "lottery-numbers",
    href: "/games/lottery",
    name: "彩票 · 數字彩",
    description: "大廳入口；玩法細節之後接上。",
    tag: "彩票",
    cardTitle: "數字彩\nLOTTERY",
    availability: "open",
  },
];

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
          以圖卡進入各主題；右上角標籤為遊戲類型（老虎機、二十一點、百家樂、彩票）。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lobbyCards.map((item) => (
          <div key={item.id} className="space-y-2">
            <GameThemeCard
              href={item.href}
              imageSrc={item.imageSrc}
              imageAlt={item.name}
              title={item.cardTitle}
              tag={item.tag}
              availability={item.availability}
            />
            <p className="px-1 text-xs text-neutral-400">{item.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
