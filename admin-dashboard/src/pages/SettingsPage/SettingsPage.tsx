import { Plus, Pencil, Trash2, RefreshCw, Save } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { useSettings } from './hooks/useSettings'

export function SettingsPage() {
  const {
    coupons, loading,
    freeClaimAmount, setFreeClaimAmount,
    savingClaim,
    refetch,
    toggleCoupon, deleteCoupon, handleSaveClaim,
  } = useSettings()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader><CardTitle>免費幣領取設定</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 max-w-sm">
            <Input label="每次免費領取金額（VAC）" type="number" min={0} value={freeClaimAmount} onChange={(e) => setFreeClaimAmount(e.target.value)} />
            <Button size="md" loading={savingClaim} onClick={() => void handleSaveClaim()}>
              <Save size={14} />儲存
            </Button>
          </div>
          <p className="text-xs text-text-muted mt-2">此設定控制用戶點擊「免費領取」按鈕時獲得的 VAC 數量。</p>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">優惠券管理</h2>
            <p className="text-xs text-text-muted mt-0.5">共 <span className="text-text-primary">{coupons.length}</span> 張優惠券</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => void refetch()}><RefreshCw size={14} /></Button>
            <Button size="sm"><Plus size={14} />新增優惠券</Button>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden" style={{ background: 'var(--color-surface)' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>代碼</TableHead><TableHead>標題</TableHead><TableHead>折扣類型</TableHead>
                <TableHead>折扣值</TableHead><TableHead>最低消費</TableHead><TableHead>適用</TableHead>
                <TableHead>到期日</TableHead><TableHead>狀態</TableHead><TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><div className="h-4 rounded bg-surface-elevated animate-pulse w-14" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : coupons.length === 0 ? (
                <TableEmpty message="尚無優惠券" />
              ) : (
                coupons.map((c) => {
                  // 到期判斷：expires_at 有值且已過當前時間
                  const isExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false
                  return (
                    <TableRow key={c.id}>
                      <TableCell><span className="font-mono text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{c.code}</span></TableCell>
                      <TableCell><span className="text-sm text-text-secondary">{c.title || '—'}</span></TableCell>
                      <TableCell><Badge variant={c.discount_type === 'percentage' ? 'info' : 'gold'}>{c.discount_type === 'percentage' ? '百分比' : '固定金額'}</Badge></TableCell>
                      <TableCell><span className="font-medium text-text-primary">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} VAC`}</span></TableCell>
                      <TableCell><span className="text-sm text-text-secondary">{c.min_purchase > 0 ? `${c.min_purchase} VAC` : '無限制'}</span></TableCell>
                      <TableCell><Badge variant="default">{c.applies_fulfillment}</Badge></TableCell>
                      <TableCell>
                        {c.expires_at
                          ? <span className={`text-xs ${isExpired ? 'text-danger' : 'text-text-muted'}`}>{formatDate(c.expires_at)}</span>
                          : <span className="text-xs text-text-muted">永久</span>}
                      </TableCell>
                      <TableCell>
                        {isExpired ? <Badge variant="danger">已過期</Badge> : c.is_active ? <Badge variant="success">啟用</Badge> : <Badge variant="default">停用</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" title={c.is_active ? '停用' : '啟用'} onClick={() => void toggleCoupon(c)}><Pencil size={14} /></Button>
                          <Button variant="ghost" size="sm" title="刪除" onClick={() => void deleteCoupon(c.id)}>
                            <Trash2 size={14} style={{ color: 'var(--color-danger)' }} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
