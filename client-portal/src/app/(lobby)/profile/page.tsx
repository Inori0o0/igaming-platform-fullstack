import Link from "next/link";
import { Card } from "@/src/components/ui/Card";

export default function ProfileOverviewPage() {
  return (
    <main className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="帳戶摘要（placeholder）" description="顯示名稱、等級、統計。">
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-4 text-xs text-neutral-400">
            User summary
          </div>
        </Card>
        <Card title="錢包摘要（placeholder）" description="顯示 coins/btc/eth。">
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-4 text-xs text-neutral-400">
            Wallet summary
          </div>
        </Card>
        <Card title="快速入口" description="常用頁面捷徑。">
          <div className="grid gap-2 text-xs">
            <Link
              href="/profile/history"
              className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2 text-neutral-200 hover:border-cyan-400/35"
            >
              → 遊戲歷史
            </Link>
            <Link
              href="/profile/orders"
              className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2 text-neutral-200 hover:border-cyan-400/35"
            >
              → 訂單歷史
            </Link>
            <Link
              href="/profile/achievements"
              className="rounded-xl border border-cyan-500/15 bg-neutral-950/70 px-3 py-2 text-neutral-200 hover:border-cyan-400/35"
            >
              → 成就
            </Link>
          </div>
        </Card>
      </div>

      <Card
        title="待辦"
        description="Profile 會串接：auth user → profile 資料 → history/orders/achievements。"
      >
        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
          <li>顯示/編輯 display name、頭像上傳（Supabase Storage）</li>
          <li>遊戲歷史列表 + 篩選</li>
          <li>訂單歷史 + 訂單詳情</li>
          <li>成就解鎖 + 徽章牆</li>
        </ul>
      </Card>
    </main>
  );
}

