import { Card } from "@/src/components/ui/Card";

export default function ProfileOrdersPage() {
  return (
    <main className="space-y-4">
      <Card
        title="訂單歷史（placeholder）"
        description="之後會顯示訂單列表、狀態與詳情入口。"
      >
        <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-xs text-neutral-400">
          Orders table
        </div>
      </Card>

      <Card title="提示" description="等 checkout 完成後，這裡就能顯示真實訂單。">
        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
          <li>狀態：pending / paid / shipped / completed</li>
          <li>訂單詳情：商品、金額、收件資訊（模擬）</li>
        </ul>
      </Card>
    </main>
  );
}

