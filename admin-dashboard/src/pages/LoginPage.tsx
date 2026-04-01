import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少 6 個字元'),
})

type FormData = z.infer<typeof schema>

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

export function LoginPage() {
  const { session, isAdmin, signIn, signInWithGoogle } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (session && isAdmin) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    const { error } = await signIn(data.email, data.password)
    if (error) setServerError(error)
  }

  const handleGoogle = async () => {
    setServerError(null)
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setServerError(error)
      setGoogleLoading(false)
    }
    // On success, browser will redirect to Google — no need to reset loading
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-background)' }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 20% 50%, rgba(212, 168, 67, 0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(212, 168, 67, 0.04) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4"
            style={{ background: 'var(--color-gold-muted)', border: '1px solid rgba(212,168,67,0.3)' }}
          >
            <span className="text-2xl font-black" style={{ color: 'var(--color-gold)' }}>
              V
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">vAcAnt Admin</h1>
          <p className="text-sm text-text-muted mt-1">管理後台登入</p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Google Sign In */}
          <button
            type="button"
            onClick={() => void handleGoogle()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onMouseEnter={(e) => {
              if (!googleLoading) e.currentTarget.style.borderColor = 'var(--color-gold)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)'
            }}
          >
            {googleLoading ? (
              <span
                className="h-4 w-4 animate-spin rounded-full border-2"
                style={{ borderColor: 'var(--color-text-muted)', borderTopColor: 'transparent' }}
              />
            ) : (
              <GoogleIcon />
            )}
            使用 Google 帳號登入
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
            <span className="text-xs text-text-muted">或使用 Email 登入</span>
            <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="電子郵件"
              type="email"
              placeholder="admin@example.com"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="密碼"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <div
                className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm"
                style={{
                  background: 'var(--color-danger-muted)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: 'var(--color-danger)',
                }}
              >
                <AlertCircle size={15} className="shrink-0" />
                {serverError}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} size="lg" className="mt-1 w-full">
              登入
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          僅限授權管理員存取
        </p>
      </div>
    </div>
  )
}
