import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { DbUser } from '@/types'

const PAGE_SIZE = 20

export function useUserList() {
  const { user: adminAuthUser } = useAuthStore()
  const adminAuthUserId = adminAuthUser?.id
  const [users, setUsers] = useState<DbUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      // 排除當前登入的管理員帳號，避免誤操作自己
      if (adminAuthUserId) {
        query = query.neq('auth_user_id', adminAuthUserId)
      }

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
  }, [adminAuthUserId, page, search])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  // 搜尋條件改變時重設頁碼，避免停留在不存在的分頁
  useEffect(() => {
    setPage(0)
  }, [search])

  const banUser = useCallback(async (userId: string) => {
    setActionLoading(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
      // 樂觀更新本地列表，不需要重新 fetch 整頁
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, banned_at: new Date().toISOString() } : u)),
      )
    } finally {
      setActionLoading(null)
    }
  }, [])

  const unbanUser = useCallback(async (userId: string) => {
    setActionLoading(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ banned_at: null })
        .eq('id', userId)
      if (error) throw error
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, banned_at: null } : u)),
      )
    } finally {
      setActionLoading(null)
    }
  }, [])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return { users, total, page, setPage, search, setSearch, loading, totalPages, refetch: fetchUsers, banUser, unbanUser, actionLoading }
}
