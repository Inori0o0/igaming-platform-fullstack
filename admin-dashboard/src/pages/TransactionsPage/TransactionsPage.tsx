import { Search, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { useTransactions } from './hooks/useTransactions'

// 與實際 transactions.type 資料對應
const TYPE_OPTIONS = [
  { value: '', label: '全部類型' },
  { value: 'wager', label: 'wager 下注' },
  { value: 'payout', label: 'payout 派彩' },
  { value: 'claim', label: 'claim 免費領取' },
  { value: 'deposit', label: 'deposit 儲值' },
  { value: 'purchase', label: 'purchase 購買' },
  { value: 'withdraw', label: 'withdraw 提款' },
]

const STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  { value: 'completed', label: '已完成' },
  { value: 'pending', label: '待處理' },
  { value: 'failed', label: '失敗' },
]

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
}

const TYPE_VARIANT: Record<string, 'gold' | 'success' | 'danger' | 'default'> = {
  wager: 'danger',
  payout: 'success',
  claim: 'gold',
  deposit: 'gold',
  purchase: 'default',
  withdraw: 'default',
}

export function TransactionsPage() {
  const {
    txs, total, page, setPage,
    search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    amountMin, setAmountMin,
    amountMax, setAmountMax,
    loading, totalPages, refetch,
  } = useTransactions()

  return (
    <div className="flex flex-col gap-4">
      {/* 第一列：搜尋 + 類型 + 狀態 + 重整 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="min-w-[200px] max-w-xs flex-1">
          <Input
            placeholder="依 User ID 搜尋..."
            icon={<Search size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-40">
          <Select options={TYPE_OPTIONS} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
        </div>
        <div className="w-32">
          <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}>
          <RefreshCw size={14} />
        </Button>
        <p className="text-sm text-text-muted ml-auto">
          共 <span className="font-medium text-text-primary">{total}</span> 筆
        </p>
      </div>

      {/* 第二列：日期範圍 + 金額範圍 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted whitespace-nowrap">日期</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
          <span className="text-xs text-text-muted">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted whitespace-nowrap">金額</span>
          <Input
            type="number"
            placeholder="最小"
            value={amountMin}
            onChange={(e) => setAmountMin(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-24"
          />
          <span className="text-xs text-text-muted">—</span>
          <Input
            type="number"
            placeholder="最大"
            value={amountMax}
            onChange={(e) => setAmountMax(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-24"
          />
        </div>
        {(dateFrom || dateTo || amountMin || amountMax) && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setDateFrom('')
              setDateTo('')
              setAmountMin('')
              setAmountMax('')
            }}
          >
            清除篩選
          </Button>
        )}
      </div>

      {/* 交易列表 */}
      <div className="rounded-lg border border-border overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>類型</TableHead>
              <TableHead>金額</TableHead>
              <TableHead>餘額後</TableHead>
              <TableHead>說明</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 rounded bg-surface-elevated animate-pulse w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : txs.length === 0 ? (
              <TableEmpty message="找不到交易紀錄" />
            ) : (
              txs.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <Link
                      to={`/users/${tx.user_id}`}
                      className="font-mono text-xs text-text-secondary hover:text-gold transition-colors"
                      title={tx.user_id}
                    >
                      {tx.user_id.slice(0, 8)}…
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={TYPE_VARIANT[tx.type] ?? 'default'}>{tx.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className="font-medium tabular-nums"
                      style={{ color: tx.amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}
                    >
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-text-secondary tabular-nums">
                      {tx.balance_after != null ? formatCurrency(tx.balance_after) : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-text-muted max-w-[180px] truncate block">
                      {tx.description ?? '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[tx.status] ?? 'default'}>{tx.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-text-muted whitespace-nowrap">{formatDate(tx.created_at)}</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            上一頁
          </Button>
          <span className="text-sm text-text-muted">第 {page + 1} / {totalPages} 頁</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            下一頁
          </Button>
        </div>
      )}
    </div>
  )
}
