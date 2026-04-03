import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbOrder } from '@/types'

const PAGE_SIZE = 20

export const STATUS_LABEL: Record<string, string> = {
  pending: '待處理',
  paid: '已付款',
  shipped: '出貨中',
  completed: '已完成',
  cancelled: '已取消',
}

export const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'info' | 'danger' | 'default'> = {
  pending: 'warning',
  paid: 'info',
  shipped: 'info',
  completed: 'success',
  cancelled: 'danger',
}

export const EDITABLE_STATUS_OPTIONS = [
  { value: 'pending', label: '待處理' },
  { value: 'paid', label: '已付款' },
  { value: 'shipped', label: '出貨中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

export function useOrders() {
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<DbOrder | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      // 使用 RPC 函式：支援 UUID 前綴搜尋 + coupon_code 搜尋，並正確處理 RLS
      const { data, error } = await supabase.rpc('admin_search_orders', {
        p_search: search.trim(),
        p_status: statusFilter,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE,
      })
      if (error) throw error
      const rows = (data ?? []) as Array<DbOrder & { total_count: number }>
      setOrders(rows.map(({ total_count: _tc, ...order }) => order as DbOrder))
      setTotal(rows[0]?.total_count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  // 篩選條件改變時重設頁碼，避免空分頁
  useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    // 同步更新已開啟的詳情 drawer 狀態，避免關閉後資料舊化
    setSelectedOrder((prev) =>
      prev?.id === orderId ? { ...prev, status: newStatus as DbOrder['status'] } : prev
    )
    void fetchOrders()
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    orders, total, page, setPage,
    search, setSearch,
    statusFilter, setStatusFilter,
    loading, totalPages,
    refetch: fetchOrders,
    updateStatus,
    selectedOrder, setSelectedOrder,
  }
}
