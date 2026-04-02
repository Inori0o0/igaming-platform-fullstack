import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DbUser, DbWallet, DbGameHistory, DbOrder } from '@/types'

export function useUserDetail(userId: string | undefined) {
  const [user, setUser] = useState<DbUser | null>(null)
  const [wallet, setWallet] = useState<DbWallet | null>(null)
  const [games, setGames] = useState<DbGameHistory[]>([])
  const [orders, setOrders] = useState<DbOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    void fetchData(userId)
  }, [userId])

  async function fetchData(id: string) {
    setLoading(true)
    try {
      // 並行查詢用戶資訊、錢包、遊戲紀錄、訂單，減少總等待時間
      const [userRes, walletRes, gamesRes, ordersRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', id).single(),
        supabase.from('wallets').select('*').eq('user_id', id).single(),
        supabase.from('game_history').select('*').eq('user_id', id).order('played_at', { ascending: false }).limit(10),
        supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
      ])
      setUser(userRes.data as DbUser | null)
      setWallet(walletRes.data as DbWallet | null)
      setGames((gamesRes.data as DbGameHistory[]) ?? [])
      setOrders((ordersRes.data as DbOrder[]) ?? [])
    } finally {
      setLoading(false)
    }
  }

  return { user, wallet, games, orders, loading }
}
