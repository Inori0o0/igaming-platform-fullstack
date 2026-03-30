"use client";

import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { formatTime } from "@/src/components/wallet/format";
import { useProfileAchievements } from "@/src/components/profile/achievements/useProfileAchievements";

export default function ProfileAchievementsPage() {
  const vm = useProfileAchievements();

  if (vm.authLoading) {
    return (
      <main className="space-y-4">
        <Card title="成就" description="載入中…">
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-8 text-center text-sm text-neutral-400">
            …
          </div>
        </Card>
      </main>
    );
  }

  if (!vm.user || vm.user.is_guest) {
    return (
      <main className="space-y-4">
        <Card title="成就" description="登入後可查看成就進度與解鎖狀態。">
          <div className="space-y-4 rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-sm text-neutral-400">
            <p>請先登入以查看成就。</p>
            <Button variant="secondary" onClick={() => vm.setOpenAuthModal(true)}>
              立即登入
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <Card
        title="成就"
        description="進入本頁時會依目前資料批次補發尚未入庫的可解鎖成就。"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-cyan-500/15 bg-neutral-950/70 p-4">
            <p className="text-xs text-neutral-400">解鎖進度</p>
            <p className="mt-1 text-lg font-semibold text-cyan-100">
              {vm.unlockedCount} / {vm.totalCount}
            </p>
          </div>

          {vm.error ? (
            <div className="space-y-3 rounded-2xl border border-rose-500/25 bg-rose-950/15 p-4">
              <p className="text-sm text-rose-300/90">{vm.error}</p>
              <Button size="sm" variant="secondary" onClick={vm.retry}>
                重新載入
              </Button>
            </div>
          ) : vm.loading ? (
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-8 text-center text-sm text-neutral-400">
              載入成就…
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {vm.cards.map((a) => (
                <div
                  key={a.type}
                  className="rounded-2xl border border-cyan-500/10 bg-neutral-950/70 p-4"
                >
                  <p className="text-xs font-semibold text-neutral-50">{a.title}</p>
                  <p className="mt-1 text-[11px] text-neutral-400">{a.description}</p>
                  <p className="mt-3 text-[11px] text-neutral-300">
                    進度：{a.progressText}
                  </p>
                  <p
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      a.unlocked ? "text-cyan-300" : "text-neutral-500"
                    }`}
                  >
                    {a.unlocked ? "Unlocked" : "Locked"}
                  </p>
                  {a.unlockedAt && (
                    <p className="mt-1 text-[10px] text-neutral-500">
                      解鎖時間：{formatTime(a.unlockedAt)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}

