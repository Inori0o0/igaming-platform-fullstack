import { Card } from "@/src/components/ui/Card";

export default function ProfileHistoryPage() {
  return (
    <main className="space-y-4">
      <Card
        title="遊戲歷史（placeholder）"
        description="之後會顯示所有遊戲紀錄（可依遊戲類型/日期篩選）。"
      >
        <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-xs text-neutral-400">
          History table
        </div>
      </Card>

      <Card title="統計（placeholder）" description="總遊戲次數、總贏取金額等。">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-950/70 p-4 text-xs text-neutral-400">
            Total plays: —
          </div>
          <div className="rounded-2xl bg-neutral-950/70 p-4 text-xs text-neutral-400">
            Total win: —
          </div>
        </div>
      </Card>
    </main>
  );
}

