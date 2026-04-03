import { X, Package } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { useStockManager } from '../hooks/useStockManager'

type Props = ReturnType<typeof useStockManager>

export function StockDrawer({
  open,
  product,
  loading,
  saving,
  draft,
  totalStock,
  APPAREL_SIZES,
  close,
  updateDraft,
  save,
}: Props) {
  if (!open) return null

  const isApparel = product?.category === 'apparel'

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border shadow-2xl"
        style={{ background: 'var(--color-surface)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
          <Package size={18} className="text-gold shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              庫存管理
            </p>
            {product && (
              <p className="text-xs text-text-muted truncate">{product.name}</p>
            )}
          </div>
          <button
            onClick={close}
            className="rounded p-1 text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: isApparel ? 5 : 1 }).map((_, i) => (
                <div key={i} className="h-12 rounded-md bg-surface-elevated animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Product info summary */}
              {product && (
                <div
                  className="flex items-center gap-3 rounded-lg px-4 py-3 border border-border"
                  style={{ background: 'var(--color-surface-elevated)' }}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-10 h-10 rounded object-cover shrink-0"
                      style={{ border: '1px solid var(--color-border)' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded shrink-0 flex items-center justify-center text-base"
                      style={{ background: 'var(--color-border)' }}
                    >
                      {product.is_avatar ? '👤' : '📦'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{product.name}</p>
                    <p className="text-xs text-text-muted">
                      {product.category} · {formatCurrency(product.price_vac ?? 0)} VAC
                    </p>
                  </div>
                </div>
              )}

              {/* Stock inputs */}
              <div
                className="rounded-lg border border-border overflow-hidden"
                style={{ background: 'var(--color-surface-elevated)' }}
              >
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                    {isApparel ? '各尺寸庫存' : '庫存數量'}
                  </p>
                </div>

                {isApparel ? (
                  <div className="divide-y divide-border">
                    {APPAREL_SIZES.map(size => (
                      <div key={size} className="flex items-center gap-3 px-4 py-3">
                        <span className="w-8 text-sm font-medium text-text-secondary">{size}</span>
                        <div className="flex-1 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateDraft(size, (draft[size] ?? 0) - 1)}
                            className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-border transition-colors text-base leading-none"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={draft[size] ?? 0}
                            onChange={e => updateDraft(size, Number(e.target.value))}
                            className="w-16 text-center rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                          />
                          <button
                            type="button"
                            onClick={() => updateDraft(size, (draft[size] ?? 0) + 1)}
                            className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-border transition-colors text-base leading-none"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-text-muted w-6 text-right">
                          {draft[size] ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-4">
                    <span className="text-sm text-text-secondary flex-1">庫存量</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateDraft('default', (draft['default'] ?? 0) - 1)}
                        className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-border transition-colors text-base leading-none"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={draft['default'] ?? 0}
                        onChange={e => updateDraft('default', Number(e.target.value))}
                        className="w-20 text-center rounded border border-border bg-surface px-2 py-1.5 text-sm text-text-primary focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                      />
                      <button
                        type="button"
                        onClick={() => updateDraft('default', (draft['default'] ?? 0) + 1)}
                        className="w-7 h-7 rounded flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-border transition-colors text-base leading-none"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isApparel && (
                <p className="text-xs text-text-muted text-right">
                  總庫存：<span className="font-medium text-text-secondary">{totalStock}</span> 件
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border px-5 py-4 shrink-0">
          <Button variant="secondary" size="md" onClick={close} disabled={saving} className="flex-1">
            取消
          </Button>
          <Button size="md" loading={saving} onClick={() => void save()} className="flex-1">
            儲存庫存
          </Button>
        </div>
      </div>
    </>
  )
}
