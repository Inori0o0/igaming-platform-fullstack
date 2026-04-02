import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface GameStat {
  game_type: string
  plays: number
  total_bet: number
  total_win: number
  /** profit = 平台盈利 = 玩家總下注 − 平台總派彩 */
  profit: number
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      // game_history 目前無資料，此頁統計將顯示空狀態
      // 未來 game_history 有資料後此查詢會自動生效
      const { data } = await supabase
        .from('game_history')
        .select('game_type, bet_amount, win_amount')
        .limit(5000)

      // 以 game_type 為 key，累加每種遊戲的下注/贏得金額
      const map: Record<string, GameStat> = {}
      for (const row of data ?? []) {
        if (!map[row.game_type]) {
          map[row.game_type] = { game_type: row.game_type, plays: 0, total_bet: 0, total_win: 0, profit: 0 }
        }
        const s = map[row.game_type]!
        s.plays += 1
        s.total_bet += row.bet_amount ?? 0
        s.total_win += row.win_amount ?? 0
      }

      const result = Object.values(map)
        .map((s) => ({ ...s, profit: s.total_bet - s.total_win }))
        .sort((a, b) => b.plays - a.plays)

      setStats(result)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading }
}
