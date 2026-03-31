/**
 * 百家樂路由頁：`/games/baccarat`，僅負責版面標題與掛載 BaccaratTable。
 */
import { BaccaratTable } from "@/src/games/baccarat/components/BaccaratTable";

export default function BaccaratPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Table Game
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          百家樂 Baccarat
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          體驗閒、莊、和三大下注選項，感受節奏明快的百家樂牌局。
        </p>
      </div>

      <BaccaratTable />
    </main>
  );
}

