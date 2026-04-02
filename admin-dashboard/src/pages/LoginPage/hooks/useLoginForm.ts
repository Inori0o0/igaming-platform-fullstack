import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/stores/authStore'

// Zod schema：欄位驗證規則，違反時直接顯示對應錯誤訊息
const schema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少 6 個字元'),
})

export type LoginFormData = z.infer<typeof schema>

export function useLoginForm() {
  const { signIn, signInWithGoogle } = useAuthStore()
  const [serverError, setServerError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: LoginFormData) => {
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
    // 成功時瀏覽器跳轉至 Google OAuth，無需重置 loading 狀態
  }

  return { register, handleSubmit, errors, isSubmitting, serverError, googleLoading, onSubmit, handleGoogle }
}
