import { Search, RefreshCw } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { useOrders } from './hooks/useOrders'

// 以下均為純顯示配置，不涉及業務邏輯
const STATUS_OPTIONS = [
  { value: '', label: '全部狀態' },
  { value: 'pending', label: '待處理' },
  { value: 'processing', label: '處理中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
  { value: 'refunded', label: '已退款' },
]

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  pending: 'warning', processing: 'info', completed: 'success', cancelled: 'danger', refunded: 'default',
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待處理', processing: '處理中', completed: '已完成', cancelled: '已取消', refunded: '已退款',
}

export function OrdersPage() {
  const {
    orders, total, page, setPage,
    search, setSearch,
    statusFilter, setStatusFilter,
    loading, totalPages, refetch, updateStatus,
  } = useOrders()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[180px] max-w-xs">
          <Input placeholder="依 User ID 搜尋..." icon={<Search size={14} />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="w-36">
          <Select options={STATUS_OPTIONS} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
        </div>
        <Button variant="secondary" size="sm" onClick={() => void refetch()}><RefreshCw size={14} /></Button>
        <p className="text-sm text-text-muted ml-auto">共 <span className="font-medium text-text-primary">{total}</span> 筆</p>
      </div>

      <div className="rounded-lg border border-border overflow-hidden" style={{ background: 'var(--color-surface)' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>訂單 ID</TableHead><TableHead>金額 (VAC)</TableHead><TableHead>優惠券</TableHead>
              <TableHead>類型</TableHead><TableHead>狀態</TableHead><TableHead>建立時間</TableHead><TableHead>更新狀態</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 rounded bg-surface-elevated animate-pulse w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              <TableEmpty message="找不到訂單" />
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><span className="text-xs font-mono text-text-muted">{order.id.slice(0, 8)}…</span></TableCell>
                  <TableCell><span className="font-medium text-gold">{formatCurrency(order.total_vac ?? order.total_amount)}</span></TableCell>
                  <TableCell>{order.coupon_code ? <Badge variant="info">{order.coupon_code}</Badge> : <span className="text-text-muted">—</span>}</TableCell>
                  <TableCell><Badge variant="default">{order.fulfillment_type ?? '—'}</Badge></TableCell>
                  <TableCell><Badge variant={STATUS_VARIANT[order.status] ?? 'default'}>{STATUS_LABEL[order.status] ?? order.status}</Badge></TableCell>
                  <TableCell><span className="text-xs text-text-muted">{formatDate(order.created_at)}</span></TableCell>
                  <TableCell>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Select options={STATUS_OPTIONS.slice(1)} value={order.status} onChange={(e) => void updateStatus(order.id, e.target.value)} className="text-xs py-1 h-auto" />
                    </div>
                  </TableCell>
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
