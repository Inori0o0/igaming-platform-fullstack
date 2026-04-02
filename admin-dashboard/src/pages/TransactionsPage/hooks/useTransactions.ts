import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbTransaction } from '@/types'

const PAGE_SIZE = 25

export function useTransactions() {
  const [txs, setTxs] = useState<DbTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [amountMin, setAmountMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTxs = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (typeFilter) query = query.eq('type', typeFilter)
      if (statusFilter) query = query.eq('status', statusFilter)
      // user_id 為 UUID 精確匹配
      if (search.trim()) query = query.eq('user_id', search.trim())

      // 日期範圍：dateTo 加一天以包含當天所有時間
      if (dateFrom) query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`)
      if (dateTo) query = query.lte('created_at', `${dateTo}T23:59:59.999Z`)

      // 金額範圍
      if (amountMin !== '') query = query.gte('amount', Number(amountMin))
      if (amountMax !== '') query = query.lte('amount', Number(amountMax))

      const { data, count, error } = await query
      if (error) throw error
      setTxs((data as DbTransaction[]) ?? [])
      setTotal(count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter, statusFilter, dateFrom, dateTo, amountMin, amountMax])

  useEffect(() => {
    void fetchTxs()
  }, [fetchTxs])

  // 任何篩選條件改變時重設頁碼，避免空分頁
  useEffect(() => {
    setPage(0)
  }, [search, typeFilter, statusFilter, dateFrom, dateTo, amountMin, amountMax])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return {
    txs, total, page, setPage,
    search, setSearch,
    typeFilter, setTypeFilter,
    statusFilter, setStatusFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    amountMin, setAmountMin,
    amountMax, setAmountMax,
    loading, totalPages, refetch: fetchTxs,
  }
}
