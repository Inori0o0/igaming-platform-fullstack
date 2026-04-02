import { Search, RefreshCw } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { useTransactions } from './hooks/useTransactions'

// 篩選選項（純 UI 顯示配置）
const TYPE_OPTIONS = [
  { value: '', label: '全部類型' },
  { value: 'deposit', label: 'deposit' },
  { value: 'payout', label: 'payout' },
  { value: 'bet', label: 'bet' },
  { value: 'purchase', label: 'purchase' },
  { value: 'free_claim', label: 'free_claim' },
  { value: 'refund', label: 'refund' },
]

const STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  { value: 'completed', label: '已完成' },
  { value: 'pending', label: '待處理' },
  { value: 'failed', label: '失敗' },
]

// status → Badge 顏色對應（純顯示配置）
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'danger',
}

export function TransactionsPage() {
  const {
    txs, total, page, setPage,
    search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    loading, totalPages, refetch,
  } = useTransactions()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="min-w-[180px] max-w-xs flex-1">
          <Input placeholder="依 User ID 搜尋..." icon={<Search size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={TYPE_OPTIONS} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
        </div>
        <div className="w-32">
          <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}><RefreshCw size={14} /></Button>
        <p className="text-sm text-text-muted ml-auto">共 <span className="font-medium text-text-primary">{total}</span> 筆</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>類型</TableHead><TableHead>金額</TableHead><TableHead>餘額後</TableHead>
              <TableHead>說明</TableHead><TableHead>狀態</TableHead><TableHead>時間</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 rounded bg-surface-elevated animate-pulse w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : txs.length === 0 ? (
              <TableEmpty message="找不到交易紀錄" />
            ) : (
              txs.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell><Badge variant="gold">{tx.type}</Badge></TableCell>
                  <TableCell>
                    <span className="font-medium" style={{ color: tx.amount >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                      {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                    </span>
                  </TableCell>
                  <TableCell><span className="text-text-secondary">{tx.balance_after != null ? formatCurrency(tx.balance_after) : '—'}</span></TableCell>
                  <TableCell><span className="text-xs text-text-muted max-w-[200px] truncate block">{tx.description ?? '—'}</span></TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[tx.status] ?? 'default'}>{tx.status}</Badge></TableCell>
                  <TableCell><span className="text-xs text-text-muted">{formatDate(tx.created_at)}</span></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>上一頁</Button>
          <span className="text-sm text-text-muted">第 {page + 1} / {totalPages} 頁</span>
          <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>下一頁</Button>
        </div>
      )}
    </div>
  )
}
