import { useState } from 'react'
import { Plus, Pencil, Eye, EyeOff, RefreshCw, Package, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableEmpty } from '@/components/ui/Table'
import { useProducts } from './hooks/useProducts'
import { useProductForm } from './hooks/useProductForm'
import { useStockManager } from './hooks/useStockManager'
import { ProductModal } from './components/ProductModal'
import { StockDrawer } from './components/StockDrawer'
import { ImageCropModal } from './components/ImageCropModal'
import type { DbProduct } from '@/types'

export function ProductsPage() {
  const { products, loading, refetch, toggleActive, deleteProduct } = useProducts()
  // 將 refetch 當作「儲存成功後要執行的 callback」傳入。
  // useProductForm 回傳的是表單狀態/方法集合，並不是 refetch 執行後的結果。
  const productForm = useProductForm(refetch)
  const stockManager = useStockManager()

  // 刪除確認 dialog
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return
    setDeleting(true)
    try {
      await deleteProduct(deletingProduct)
      setDeletingProduct(null)
    } catch (err) {
      alert(err instanceof Error ? err.message : '刪除失敗，請重試')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <p className="text-sm text-text-muted">
            共 <span className="font-medium text-text-primary">{products.length}</span> 件商品
          </p>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              <RefreshCw size={14} />重新整理
            </Button>
            <Button size="sm" onClick={productForm.openCreate}>
              <Plus size={14} />新增商品
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden" style={{ background: 'var(--color-surface)' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>商品</TableHead>
                <TableHead>分類</TableHead>
                <TableHead>類型</TableHead>
                <TableHead>VAC 售價</TableHead>
                <TableHead>庫存</TableHead>
                <TableHead>排序</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 rounded bg-surface-elevated animate-pulse w-16" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableEmpty message="尚無商品" />
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    {/* 商品名稱 + 縮圖 */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-8 h-8 rounded object-cover shrink-0"
                            style={{ border: '1px solid var(--color-border)' }}
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded shrink-0 flex items-center justify-center text-xs text-text-muted"
                            style={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}
                          >
                            {p.is_avatar ? '👤' : '📦'}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-text-primary max-w-[160px] truncate">{p.name}</p>
                          {p.slug && <p className="text-xs text-text-muted">/{p.slug}</p>}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-text-secondary">{p.category ?? '—'}</span>
                    </TableCell>

                    <TableCell>
                      {p.is_avatar
                        ? <Badge variant="info">頭像</Badge>
                        : p.fulfillment_type === 'digital'
                          ? <Badge variant="gold">數位</Badge>
                          : <Badge variant="default">實體</Badge>}
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-gold">
                        {p.price_vac != null ? formatCurrency(p.price_vac) : '—'}
                      </span>
                    </TableCell>

                    <TableCell>
                      {p.force_sold_out
                        ? <Badge variant="danger">強制售罄</Badge>
                        : <span className="text-sm text-text-secondary">{p.stock != null ? p.stock : '∞'}</span>}
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-text-muted">{p.sort_order}</span>
                    </TableCell>

                    <TableCell>
                      {p.is_active
                        ? <Badge variant="success">上架</Badge>
                        : <Badge variant="danger">下架</Badge>}
                    </TableCell>

                    {/* 操作按鈕 */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          title={p.is_active ? '下架' : '上架'}
                          onClick={() => void toggleActive(p)}
                        >
                          {p.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="庫存管理"
                          onClick={() => void stockManager.openStock(p)}
                        >
                          <Package size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="編輯"
                          onClick={() => productForm.openEdit(p)}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="刪除"
                          className="hover:text-danger"
                          onClick={() => setDeletingProduct(p)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 新增 / 編輯商品 Modal */}
      <ProductModal {...productForm} />

      {/* 圖片裁切 Modal — 獨立渲染在頂層，z-index 高於 ProductModal 避免被 backdrop 擋住 */}
      <ImageCropModal
        open={!!productForm.cropSrc}
        imageSrc={productForm.cropSrc ?? null}
        onConfirm={productForm.handleCropConfirm}
        onCancel={productForm.handleCropCancel}
      />

      {/* 庫存管理 Drawer */}
      <StockDrawer {...stockManager} />

      {/* 刪除確認 Dialog */}
      <Modal
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="確認刪除商品"
        size="sm"
      >
        <div className="p-5 flex flex-col gap-4">
          <p className="text-sm text-text-secondary">
            確定要刪除商品{' '}
            <span className="font-semibold text-text-primary">「{deletingProduct?.name}」</span>？
          </p>
          <p className="text-xs text-text-muted">
            此操作不可復原，關聯的訂單項目不受影響（由資料庫約束保護）。
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setDeletingProduct(null)}
              disabled={deleting}
            >
              取消
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={deleting}
              onClick={() => void handleDeleteConfirm()}
            >
              確認刪除
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
