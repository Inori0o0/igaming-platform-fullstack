import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

// game_id 欄位儲存的是前端遊戲組件的英文識別碼，統一對應為中文顯示名稱
// 若未來新增遊戲類型，在此補上對應即可
const GAME_DISPLAY_NAMES: Record<string, string> = {
  blackjack: '二十一點',
  slots: '老虎機',
  baccarat: '百家樂',
}

export interface DashboardStats {
  totalUsers: number
  activeToday: number
  totalWagers: number
  /** 已格式化為貨幣字串，直接傳入 StatCard 顯示，UI 層無需再計算 */
  totalTransactionVolume: string
  totalProducts: number
  totalOrders: number
}

export interface DailyActive {
  date: string
  count: number
}

export interface GameTypeStat {
  name: string
  value: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [dailyActive, setDailyActive] = useState<DailyActive[]>([])
  const [gameTypes, setGameTypes] = useState<GameTypeStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      // 14 天前的零時，作為 DAU 趨勢查詢的時間下限
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
      fourteenDaysAgo.setHours(0, 0, 0, 0)

      // 今日零時，用於從已撈回的 wager 資料中篩選「今日活躍」
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      // 並行送出所有查詢，降低總等待時間
      const [
        usersRes, wagerCountRes, txVolRes, ordersRes, productsRes,
        recentWagersRes, allGameTypeRes,
      ] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),

        // 總遊戲次數：game_history 目前無資料，改以 transactions 的 wager 類型替代
        // wager = 玩家每一次下注行為，每筆等同一局遊戲
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'wager'),

        // 總交易金額：涵蓋所有 status='completed' 的交易（deposit/wager/payout/claim/purchase）
        supabase.from('transactions').select('amount').eq('status', 'completed'),

        supabase.from('orders').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),

        // 近 14 天的 wager，一次撈取後供：1) 今日活躍計算 2) DAU 趨勢分組
        supabase
          .from('transactions')
          .select('user_id, created_at')
          .eq('type', 'wager')
          .gte('created_at', fourteenDaysAgo.toISOString()),

        // 全部 wager 的 game_id，用於遊戲類型分布圓餅圖
        supabase.from('transactions').select('game_id').eq('type', 'wager').not('game_id', 'is', null),
      ])

      const totalVolume = (txVolRes.data ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0)

      // 今日活躍：從近 14 天 wager 中篩選今日，去重 user_id
      const todayWagers = (recentWagersRes.data ?? []).filter((r) => new Date(r.created_at) >= todayStart)
      const activeIds = new Set(todayWagers.map((r) => r.user_id))

      setStats({
        totalUsers: usersRes.count ?? 0,
        activeToday: activeIds.size,
        totalWagers: wagerCountRes.count ?? 0,
        totalTransactionVolume: formatCurrency(totalVolume),
        totalProducts: productsRes.count ?? 0,
        totalOrders: ordersRes.count ?? 0,
      })

      // 以 game_id 為 key 計數，轉換為 Recharts {name, value} 格式
      const typeMap: Record<string, number> = {}
      for (const row of allGameTypeRes.data ?? []) {
        const key = row.game_id as string
        typeMap[key] = (typeMap[key] ?? 0) + 1
      }
      setGameTypes(
        Object.entries(typeMap)
          .map(([id, value]) => ({ name: GAME_DISPLAY_NAMES[id] ?? id, value }))
          .sort((a, b) => b.value - a.value),
      )

      // 按日期分組計算不重複 user_id；補齊 14 天確保折線圖連續不斷點
      const wagersByDay = new Map<string, Set<string>>()
      for (const row of recentWagersRes.data ?? []) {
        const label = new Date(row.created_at).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
        if (!wagersByDay.has(label)) wagersByDay.set(label, new Set())
        wagersByDay.get(label)!.add(row.user_id)
      }

      const days: DailyActive[] = []
      for (let i = 13; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const label = d.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
        days.push({ date: label, count: wagersByDay.get(label)?.size ?? 0 })
      }
      setDailyActive(days)
    } finally {
      setLoading(false)
    }
  }

  return { stats, dailyActive, gameTypes, loading }
}
