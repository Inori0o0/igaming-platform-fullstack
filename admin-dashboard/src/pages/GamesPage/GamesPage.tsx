import { formatNumber, formatCurrency } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useGameStats } from './hooks/useGameStats'

const COLORS = ['#d4a843', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

export function GamesPage() {
  const { stats, loading } = useGameStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={s.game_type}>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="text-xs font-medium text-text-muted uppercase">{s.game_type}</span>
              </div>
              <p className="text-xl font-bold text-text-primary">{formatNumber(s.plays)}</p>
              <p className="text-xs text-text-muted mt-1">場遊戲</p>
              <div className="mt-3 pt-3 border-t border-border-subtle flex justify-between text-xs">
                <span style={{ color: 'var(--color-text-muted)' }}>總下注</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{formatCurrency(s.total_bet)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span style={{ color: 'var(--color-text-muted)' }}>平台盈利</span>
                <span style={{ color: s.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                  {formatCurrency(s.profit)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>各遊戲遊玩次數比較</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis dataKey="game_type" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: 12 }} />
              <Bar dataKey="plays" name="遊玩次數" radius={[4, 4, 0, 0]}>
                {stats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>各遊戲平台盈利（下注 − 派彩）</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <XAxis dataKey="game_type" tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: 12 }}
                formatter={(v) => [formatCurrency(Number(v)), '平台盈利']}
              />
              <Bar dataKey="profit" name="平台盈利" radius={[4, 4, 0, 0]}>
                {stats.map((s, i) => <Cell key={i} fill={s.profit >= 0 ? 'var(--color-success)' : 'var(--color-danger)'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
