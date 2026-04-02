import { formatNumber, formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { useGameStats } from './hooks/useGameStats'

const GAME_COLORS = ['#d4a843', '#3b82f6', '#22c55e', '#8b5cf6']

const TOOLTIP_STYLE = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: '8px',
  color: 'var(--color-text-primary)',
  fontSize: 12,
}

export function GamesPage() {
  const { stats, hourlyStats, dailyStats, loading } = useGameStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
        />
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-text-muted text-sm">尚無遊戲資料</p>
      </div>
    )
  }

  const peakHour = hourlyStats.reduce((prev, cur) => (cur.plays > prev.plays ? cur : prev), hourlyStats[0]!)

  return (
    <div className="flex flex-col gap-5">
      {/* 各遊戲摘要卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={s.key}>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: GAME_COLORS[i % GAME_COLORS.length] }} />
                <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{formatNumber(s.plays)}</p>
              <p className="text-xs text-text-muted mt-0.5">場遊戲</p>
              <div className="mt-3 pt-3 border-t border-border-subtle space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">總下注</span>
                  <span className="text-text-secondary">{formatCurrency(s.total_bet)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">總派彩</span>
                  <span className="text-text-secondary">{formatCurrency(s.total_win)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">平台盈利</span>
                  <span style={{ color: s.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {s.profit >= 0 ? '+' : ''}{formatCurrency(s.profit)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 遊玩次數 vs 平台盈利並排 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>各遊戲遊玩次數</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={35}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="plays" name="遊玩次數" radius={[4, 4, 0, 0]}>
                  {stats.map((_, i) => (
                    <Cell key={i} fill={GAME_COLORS[i % GAME_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>平台盈利（下注 − 派彩）</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                  tickFormatter={(v) => formatNumber(Number(v))}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(v) => [formatCurrency(Number(v)), '平台盈利']}
                />
                <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="4 2" />
                <Bar dataKey="profit" name="平台盈利" radius={[4, 4, 0, 0]}>
                  {stats.map((s, i) => (
                    <Cell key={i} fill={s.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 每日遊玩趨勢 */}
      <Card>
        <CardHeader>
          <CardTitle>每日遊玩趨勢</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyStats} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="4 2" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis
                yAxisId="plays"
                orientation="left"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <YAxis
                yAxisId="bet"
                orientation="right"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={55}
                tickFormatter={(v) => formatNumber(Number(v))}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(value, name) => {
                  if (name === '場次') return [formatNumber(Number(value)), name]
                  return [formatCurrency(Number(value)), name]
                }}
              />
              <Line
                yAxisId="plays"
                type="monotone"
                dataKey="plays"
                name="場次"
                stroke="var(--color-gold)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-gold)', r: 3 }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="bet"
                type="monotone"
                dataKey="total_bet"
                name="總下注(VAC)"
                stroke="var(--color-info)"
                strokeWidth={2}
                dot={{ fill: 'var(--color-info)', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 熱門時段分析 */}
      <Card>
        <CardHeader>
          <CardTitle>熱門時段分析（台灣時間，24小時）</CardTitle>
        </CardHeader>
        <CardContent>
          {peakHour.plays > 0 && (
            <p className="text-xs text-text-muted mb-3">
              尖峰時段：<span style={{ color: 'var(--color-gold)' }}>{peakHour.label}</span>，共{' '}
              <span style={{ color: 'var(--color-gold)' }}>{peakHour.plays}</span> 場
            </p>
          )}
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={hourlyStats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }} barSize={14}>
              <CartesianGrid stroke="var(--color-border-subtle)" strokeDasharray="4 2" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={25}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [formatNumber(Number(v)), '遊玩場次']}
              />
              <Bar dataKey="plays" name="遊玩場次" radius={[3, 3, 0, 0]}>
                {hourlyStats.map((s, i) => (
                  <Cell
                    key={i}
                    fill={s.hour === peakHour.hour ? 'var(--color-gold)' : 'var(--color-info)'}
                    opacity={s.plays === 0 ? 0.2 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
