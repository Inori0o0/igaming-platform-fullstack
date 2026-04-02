import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/stores/authStore'

// Zod schema：保留表單驗證，讓 UI 看起來完整可用
const schema = z.object({
  email: z.email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少 6 個字元'),
})

export type LoginFormData = z.infer<typeof schema>

export function useLoginForm() {
  // signIn 已移除：此系統僅支援 Google OAuth，不儲存使用者密碼
  const { signInWithGoogle } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) })

  // 表單提交不觸發任何驗證 API，回傳仿真的認證失敗訊息
  const onSubmit = async () => {
    setServerError('帳號或密碼不正確，請再試一次。')
  }

  const handleGoogle = async () => {
    setServerError(null)
    setGoogleLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setServerError(error)
      setGoogleLoading(false)
    }
    // 成功時瀏覽器跳轉至 Google OAuth，無需重置 loading 狀態
  }

  return { register, handleSubmit, errors, isSubmitting, serverError, googleLoading, onSubmit, handleGoogle }
}
