import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  ArrowLeftRight,
  ShoppingBag,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '儀表板' },
  { path: '/users', icon: Users, label: '用戶管理' },
  { path: '/games', icon: Gamepad2, label: '遊戲統計' },
  { path: '/transactions', icon: ArrowLeftRight, label: '交易紀錄' },
  { path: '/products', icon: ShoppingBag, label: '商品管理' },
  { path: '/orders', icon: ClipboardList, label: '訂單管理' },
  { path: '/settings', icon: Settings, label: '網站設定' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col h-full border-r border-border bg-surface',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 border-b border-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-bold tracking-widest"
              style={{ color: 'var(--color-gold)' }}
            >
              vAcAnt
            </span>
            <span className="text-xs font-medium text-text-muted mt-0.5">
              Admin
            </span>
          </div>
        )}
        {collapsed && (
          <span className="text-lg font-bold" style={{ color: 'var(--color-gold)' }}>
            V
          </span>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center w-6 h-6 rounded-md transition-colors',
            'text-text-muted hover:text-text-primary hover:bg-surface-elevated',
            collapsed && 'hidden',
          )}
        >
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="flex flex-col gap-1 px-2">
          {navItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150 text-sm font-medium',
                    'relative group',
                    isActive
                      ? 'bg-gold-muted text-gold'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary',
                    collapsed && 'justify-center px-2',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: 'var(--color-gold)' }}
                      />
                    )}
                    <Icon size={18} className="shrink-0" />
                    {!collapsed && <span>{label}</span>}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse toggle (bottom) */}
      {collapsed && (
        <div className="p-2 border-t border-border">
          <button
            onClick={onToggle}
            className="flex w-full items-center justify-center py-2 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-elevated transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  )
}
