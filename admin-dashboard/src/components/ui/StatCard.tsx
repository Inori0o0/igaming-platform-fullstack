import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'gold'
  loading?: boolean
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', loading }: StatCardProps) {
  const isGold = variant === 'gold'

  return (
    <div
      className={cn(
        'rounded-lg p-5 border transition-colors',
        isGold
          ? 'bg-gold-muted border-[rgba(212,168,67,0.3)]'
          : 'bg-surface border-border hover:border-border/80',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <p className={cn('text-xs font-medium uppercase tracking-wider', isGold ? 'text-gold' : 'text-text-muted')}>
          {title}
        </p>
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-md',
            isGold ? 'bg-gold text-background' : 'bg-surface-elevated text-text-secondary',
          )}
        >
          <Icon size={16} />
        </div>
      </div>

      {loading ? (
        <div className="h-8 w-24 rounded-md bg-surface-elevated animate-pulse" />
      ) : (
        <p className={cn('text-2xl font-bold tracking-tight', isGold ? 'text-gold-light' : 'text-text-primary')}>
          {value}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        {subtitle && (
          <p className="text-xs text-text-muted">{subtitle}</p>
        )}
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-success' : 'text-danger',
            )}
          >
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
    </div>
  )
}
