import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbProduct } from '@/types'

export function useProducts() {
  const [products, setProducts] = useState<DbProduct[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })
      const rows = (data as DbProduct[]) ?? []
      // image_url 欄位為 NULL 時，從 image_object_path 組出 public URL
      const normalized = rows.map(p => {
        if (p.image_url || !p.image_object_path) return p
        const bucket = p.image_bucket || 'shop-products'
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(p.image_object_path)
        return { ...p, image_url: publicUrl }
      })
      setProducts(normalized)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  // 先樂觀更新本地狀態，再同步 DB；失敗時回退並顯示錯誤
  const toggleActive = async (product: DbProduct) => {
    const next = !product.is_active
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: next } : p))
    const { error } = await supabase
      .from('products')
      .update({ is_active: next })
      .eq('id', product.id)
    if (error) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: product.is_active } : p))
      alert(`上下架更新失敗：${error.message}`)
    }
  }

  const deleteProduct = async (product: DbProduct) => {
    const { error } = await supabase.from('products').delete().eq('id', product.id)
    if (error) throw error
    void fetchProducts()
  }

  return { products, loading, refetch: fetchProducts, toggleActive, deleteProduct }
}
