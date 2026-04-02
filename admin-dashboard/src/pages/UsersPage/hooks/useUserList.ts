import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbUser } from '@/types'

const PAGE_SIZE = 20

export function useUserList() {
  const [users, setUsers] = useState<DbUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      // ilike = 不區分大小寫的 LIKE；.or() 讓 email 或 display_name 任一符合即回傳
      if (search.trim()) {
        query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)
      }

      const { data, count, error } = await query
      if (error) throw error
      setUsers((data as DbUser[]) ?? [])
      setTotal(count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  // 搜尋條件改變時重設頁碼，避免停留在不存在的分頁
  useEffect(() => {
    setPage(0)
  }, [search])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return { users, total, page, setPage, search, setSearch, loading, totalPages, refetch: fetchUsers }
}
