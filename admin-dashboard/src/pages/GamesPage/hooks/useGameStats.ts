import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export interface GameStat {
  key: string
  game_id: string
  theme_id: string | null
  label: string
  plays: number
  total_bet: number
  total_win: number
  /** profit = 平台盈利 = 玩家總下注 − 平台總派彩 */
  profit: number
}

export interface HourlyStat {
  hour: number
  label: string
  plays: number
}

export interface DailyStat {
  date: string
  plays: number
  total_bet: number
}

const GAME_NAME_MAP: Record<string, string> = {
  blackjack: 'Blackjack',
  baccarat: 'Baccarat',
  slots: 'Slots',
}

const THEME_NAME_MAP: Record<string, string> = {
  'italian-brainrot': 'Brainrot',
  'vacant-classic': 'Classic',
}

function makeLabel(game_id: string, theme_id: string | null): string {
  const game = GAME_NAME_MAP[game_id] ?? game_id
  const theme = theme_id ? (THEME_NAME_MAP[theme_id] ?? theme_id) : ''
  return theme ? `${game} · ${theme}` : game
}

/** 將 UTC ISO 字串轉為台灣時間（UTC+8）的小時 */
function toTaiwanHour(isoStr: string): number {
  return (new Date(isoStr).getUTCHours() + 8) % 24
}

/** 將 UTC ISO 字串轉為台灣時間的日期字串 YYYY-MM-DD */
function toTaiwanDate(isoStr: string): string {
  const d = new Date(isoStr)
  const utcMs = d.getTime() + 8 * 60 * 60 * 1000
  return new Date(utcMs).toISOString().slice(0, 10)
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStat[]>([])
  const [hourlyStats, setHourlyStats] = useState<HourlyStat[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetchStats()
  }, [])

  async function fetchStats() {
    setLoading(true)
    try {
      const [{ data: wagerData }, { data: payoutData }] = await Promise.all([
        supabase
          .from('transactions')
          .select('game_id, theme_id, amount, created_at')
          .eq('type', 'wager')
          .eq('status', 'completed')
          .eq('currency', 'VAC'),
        supabase
          .from('transactions')
          .select('game_id, theme_id, amount')
          .eq('type', 'payout')
          .eq('status', 'completed')
          .eq('currency', 'VAC'),
      ])

      // 按 game_id + theme_id 累加下注
      const betMap: Record<string, GameStat> = {}
      for (const row of wagerData ?? []) {
        const key = `${row.game_id}__${row.theme_id ?? ''}`
        if (!betMap[key]) {
          betMap[key] = {
            key,
            game_id: row.game_id,
            theme_id: row.theme_id,
            label: makeLabel(row.game_id, row.theme_id),
            plays: 0,
            total_bet: 0,
            total_win: 0,
            profit: 0,
          }
        }
        betMap[key]!.plays += 1
        betMap[key]!.total_bet += Number(row.amount) || 0
      }

      // 累加派彩
      for (const row of payoutData ?? []) {
        const key = `${row.game_id}__${row.theme_id ?? ''}`
        if (betMap[key]) {
          betMap[key]!.total_win += Number(row.amount) || 0
        }
      }

      const result = Object.values(betMap)
        .map((s) => ({ ...s, profit: s.total_bet - s.total_win }))
        .sort((a, b) => b.plays - a.plays)

      setStats(result)

      // 熱門時段：24 小時分布（台灣時間）
      const hourlyMap: Record<number, number> = {}
      for (const row of wagerData ?? []) {
        const h = toTaiwanHour(row.created_at)
        hourlyMap[h] = (hourlyMap[h] ?? 0) + 1
      }
      const hourly: HourlyStat[] = Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        label: `${String(h).padStart(2, '0')}:00`,
        plays: hourlyMap[h] ?? 0,
      }))
      setHourlyStats(hourly)

      // 每日趨勢
      const dailyMap: Record<string, { plays: number; total_bet: number }> = {}
      for (const row of wagerData ?? []) {
        const day = toTaiwanDate(row.created_at)
        if (!dailyMap[day]) dailyMap[day] = { plays: 0, total_bet: 0 }
        dailyMap[day]!.plays += 1
        dailyMap[day]!.total_bet += Number(row.amount) || 0
      }
      const daily: DailyStat[] = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, ...v }))
      setDailyStats(daily)
    } finally {
      setLoading(false)
    }
  }

  return { stats, hourlyStats, dailyStats, loading }
}
