 "use client";

import { Card } from "@/src/components/ui/Card";
import { Button } from "@/src/components/ui/Button";
import { LogoLoader } from "@/src/components/loading/LogoLoader";
import { formatTime } from "@/src/components/wallet/format";
import { useProfileGameHistory } from "@/src/components/profile/history/useProfileGameHistory";

function formatVac(value: number) {
  return value.toLocaleString("en-US");
}

export default function ProfileHistoryPage() {
  const vm = useProfileGameHistory();

  if (vm.authLoading) {
    return (
      <main className="space-y-4">
        <Card title="遊戲歷史" description="載入中…">
          <div className="flex min-h-28 items-center justify-center rounded-2xl border border-neutral-800/80 bg-neutral-950/60 p-8">
            <LogoLoader size="md" className="text-cyan-300" />
          </div>
        </Card>
      </main>
    );
  }

  if (!vm.user || vm.user.is_guest) {
    return (
      <main className="space-y-4">
        <Card title="遊戲歷史" description="登入後可查看每局結算紀錄與統計。">
          <div className="space-y-4 rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-sm text-neutral-400">
            <p>請先登入以查看遊戲歷史。</p>
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
        title="遊戲歷史"
        description="每筆代表一個已結算 round（以 payout 紀錄為準），可依遊戲類型與日期篩選。"
      >
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-2">
            <label className="space-y-1 text-xs text-neutral-400">
              <span className="block">遊戲類型</span>
              <select
                value={vm.gameFilter}
                onChange={(e) =>
                  vm.onGameFilterChange(
                    e.target.value as (typeof vm.gameOptions)[number]["value"],
                  )
                }
                className="rounded-lg border border-cyan-500/30 bg-neutral-950/80 px-2 py-1 text-xs text-neutral-100"
              >
                {vm.gameOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-xs text-neutral-400">
              <span className="block">日期</span>
              <input
                type="date"
                value={vm.dateFilter}
                onChange={(e) => vm.onDateFilterChange(e.target.value)}
                className="rounded-lg border border-cyan-500/30 bg-neutral-950/80 px-2 py-1 text-xs text-neutral-100"
              />
            </label>

            <Button
              size="sm"
              variant="ghost"
              onClick={vm.clearDateFilter}
              disabled={!vm.dateFilter}
            >
              清除日期
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-cyan-500/20">
            <table className="min-w-[720px] w-full border-collapse text-xs">
              <thead className="bg-neutral-900/85 text-neutral-300">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                    時間
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                    遊戲
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                    主題
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                    投注(VAC)
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-right font-medium">
                    贏取(VAC)
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-left font-medium">
                    Round ID
                  </th>
                </tr>
              </thead>
              <tbody className="bg-neutral-950/70 text-neutral-200">
                {vm.loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-neutral-500">
                      <LogoLoader size="sm" className="mx-auto text-cyan-300" />
                    </td>
                  </tr>
                ) : vm.error ? (
                  <tr>
                    <td colSpan={6} className="space-y-2 px-3 py-6 text-center text-neutral-300">
                      <p className="text-rose-300">讀取失敗：{vm.error}</p>
                      <Button size="sm" variant="secondary" onClick={vm.retry}>
                        重新載入
                      </Button>
                    </td>
                  </tr>
                ) : vm.rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-neutral-500">
                      目前沒有符合條件的遊戲紀錄
                    </td>
                  </tr>
                ) : (
                  vm.rows.map((row) => (
                    <tr key={row.id} className="border-t border-cyan-500/10 align-top">
                      <td className="whitespace-nowrap px-3 py-2 text-neutral-400">
                        {formatTime(row.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2">{row.gameLabel}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-neutral-300">
                        {row.themeId ?? "-"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right text-neutral-300">
                        {formatVac(row.betAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right font-semibold text-cyan-100">
                        {formatVac(row.winAmount)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-neutral-400">
                        {row.roundId ?? "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-start gap-3 text-xs text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
            <span>
              第 {vm.page} / {vm.totalPages} 頁（每頁 10 筆）
            </span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={vm.page <= 1}
                onClick={vm.goPrevPage}
              >
                上一頁
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={vm.page >= vm.totalPages}
                onClick={vm.goNextPage}
              >
                下一頁
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="統計" description="符合目前篩選條件的彙總結果。">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-950/70 p-4">
            <p className="text-xs text-neutral-400">總遊戲次數</p>
            <p className="mt-1 text-lg font-semibold text-cyan-100">
              {vm.totalCount.toLocaleString("en-US")}
            </p>
          </div>
          <div className="rounded-2xl bg-neutral-950/70 p-4">
            <p className="text-xs text-neutral-400">總贏取金額 (VAC)</p>
            <p className="mt-1 text-lg font-semibold text-cyan-100">
              {formatVac(vm.totalWinAmount)}
            </p>
          </div>
        </div>
      </Card>
    </main>
  );
}

