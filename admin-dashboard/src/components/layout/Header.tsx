import { useLocation } from 'react-router-dom'
import { LogOut, Bell } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

const pageTitles: Record<string, string> = {
  '/': '儀表板',
  '/users': '用戶管理',
  '/games': '遊戲統計',
  '/transactions': '交易紀錄',
  '/products': '商品管理',
  '/orders': '訂單管理',
  '/settings': '優惠券管理',
}

export function Header() {
  const location = useLocation()
  const { user, signOut } = useAuthStore()

  const title = pageTitles[location.pathname] ?? pageTitles['/']

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header
      className="flex items-center justify-between h-16 px-6 border-b border-border bg-surface"
      style={{ background: 'var(--color-surface)' }}
    >
      <div>
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
        <p className="text-xs text-text-muted">vAcAnt 管理後台</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell (placeholder) */}
        <button className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:bg-surface-elevated hover:text-text-primary transition-colors">
          <Bell size={18} />
        </button>

        {/* User info */}
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-text-primary leading-none">
              {user?.email?.split('@')[0] ?? 'Admin'}
            </p>
            <p className="text-xs text-gold mt-0.5">管理員</p>
          </div>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-background"
            style={{ background: 'var(--color-gold)' }}
          >
            {(user?.email?.[0] ?? 'A').toUpperCase()}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:bg-danger-muted hover:text-danger transition-colors"
          title="登出"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
