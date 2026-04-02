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
      setProducts((data as DbProduct[]) ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchProducts()
  }, [fetchProducts])

  // 更新後重新拉取，確保本地狀態與 DB 同步
  const toggleActive = async (product: DbProduct) => {
    await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
    void fetchProducts()
  }

  return { products, loading, refetch: fetchProducts, toggleActive }
}
