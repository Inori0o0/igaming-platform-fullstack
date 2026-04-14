import { Plus, Pencil, Trash2, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { CouponModal } from './components/CouponModal'
import { useCoupons } from './hooks/useCoupons'

export function CouponsPage() {
  const {
    coupons, loading,
    includeDeleted, setIncludeDeleted,
    modalOpen, editingCoupon,
    formValues, setFormValues,
    submitting, formErrors,
    refetch,
    openCreate, openEdit, closeModal,
    submitCoupon, toggleCoupon, deleteCoupon,
  } = useCoupons()

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>優惠券管理</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIncludeDeleted((v) => !v)}
              >
                {includeDeleted ? '隱藏已刪除' : '顯示已刪除'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                <RefreshCw size={14} />
              </Button>
              <Button size="sm" onClick={openCreate}>
                <Plus size={14} />新增優惠券
              </Button>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-1">
            共 <span className="text-text-primary">{coupons.length}</span> 張優惠券
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-b-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>代碼</TableHead>
                  <TableHead>標題</TableHead>
                  <TableHead>折扣類型</TableHead>
                  <TableHead>折扣值</TableHead>
                  <TableHead>最低消費</TableHead>
                  <TableHead>適用</TableHead>
                  <TableHead>到期日</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 rounded bg-surface-elevated animate-pulse w-14" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : coupons.length === 0 ? (
                  <TableEmpty message="尚無優惠券，點擊「新增優惠券」建立第一張" />
                ) : (
                  coupons.map((c) => {
                    const isExpired = c.expires_at ? new Date(c.expires_at) < new Date() : false
                    return (
                      <TableRow key={c.id}>
                        <TableCell>
                          <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-gold)' }}>
                            {c.code}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-text-secondary">{c.title || '—'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={c.discount_type === 'percentage' ? 'info' : c.discount_type === 'fixed' ? 'gold' : 'success'}>
                            {c.discount_type === 'percentage' ? '百分比' : c.discount_type === 'fixed' ? '固定金額' : '免運費'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-text-primary">
                            {c.discount_type === 'percentage'
                              ? `${c.discount_value}%`
                              : c.discount_type === 'fixed'
                                ? `${c.discount_value} VAC`
                                : '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-text-secondary">
                            {c.min_purchase > 0 ? `${c.min_purchase} VAC` : '無限制'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{c.applies_fulfillment}</Badge>
                        </TableCell>
                        <TableCell>
                          {c.expires_at
                            ? <span className={`text-xs ${isExpired ? 'text-danger' : 'text-text-muted'}`}>{formatDate(c.expires_at)}</span>
                            : <span className="text-xs text-text-muted">永久</span>}
                        </TableCell>
                        <TableCell>
                          {c.deleted_at
                            ? <Badge variant="danger">已刪除</Badge>
                            : isExpired
                            ? <Badge variant="danger">已過期</Badge>
                            : c.is_active
                              ? <Badge variant="success">啟用</Badge>
                              : <Badge variant="default">停用</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {/* 啟用/停用 toggle */}
                            <button
                              title={c.is_active ? '點擊停用' : '點擊啟用'}
                              disabled={Boolean(c.deleted_at)}
                              onClick={() => void toggleCoupon(c)}
                              className="flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-surface-elevated"
                            >
                              {c.is_active
                                ? <ToggleRight size={16} style={{ color: 'var(--color-gold)' }} />
                                : <ToggleLeft size={16} className="text-text-muted" />}
                            </button>
                            {/* 編輯 */}
                            <Button variant="ghost" size="sm" title="編輯" onClick={() => openEdit(c)}>
                              <Pencil size={14} />
                            </Button>
                            {/* 刪除 */}
                            <Button
                              variant="ghost"
                              size="sm"
                              title="刪除"
                              disabled={Boolean(c.deleted_at)}
                              onClick={() => void deleteCoupon(c.id)}
                            >
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
        </CardContent>
      </Card>

      <CouponModal
        open={modalOpen}
        editingCoupon={editingCoupon}
        values={formValues}
        setValues={setFormValues}
        submitting={submitting}
        errors={formErrors}
        close={closeModal}
        submit={submitCoupon}
      />
    </div>
  )
}
