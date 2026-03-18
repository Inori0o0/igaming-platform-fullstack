import { Card } from "@/src/components/ui/Card";

export default function WalletPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
          Wallet
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50">
          錢包
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-300">
          目前是頁面殼。後續會接上 vAcAnt Coins + BTC/ETH 顯示、充值/提領 UI 與交易紀錄。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="vAcAnt Coins" description="主要遊戲幣。">
          <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
            <p className="text-xs text-neutral-400">Balance</p>
            <p className="mt-2 text-2xl font-semibold text-cyan-100">—</p>
          </div>
        </Card>
        <Card title="BTC" description="展示用。">
          <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
            <p className="text-xs text-neutral-400">Balance</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-100">—</p>
          </div>
        </Card>
        <Card title="ETH" description="展示用。">
          <div className="rounded-2xl bg-neutral-950/70 p-4 text-sm text-neutral-200">
            <p className="text-xs text-neutral-400">Balance</p>
            <p className="mt-2 text-2xl font-semibold text-neutral-100">—</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Card title="充值 / 提領（placeholder）" description="先把區塊放好。">
          <div className="grid gap-3 text-xs text-neutral-300">
            <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-4 text-neutral-400">
              Deposit UI
            </div>
            <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-4 text-neutral-400">
              Withdraw UI
            </div>
          </div>
        </Card>
        <Card title="交易紀錄（placeholder）" description="會支援篩選與分頁。">
          <div className="rounded-2xl border border-dashed border-cyan-500/25 bg-neutral-950/60 p-6 text-center text-xs text-neutral-400">
            Transactions table
          </div>
        </Card>
      </div>
    </main>
  );
}

