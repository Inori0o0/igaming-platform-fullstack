import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  isAdmin: boolean
  loading: boolean
  setSession: (session: Session | null) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  init: () => Promise<void>
}

function checkIsAdmin(user: User | null): boolean {
  if (!user) return false
  const meta = user.user_metadata as Record<string, unknown>
  return meta?.role === 'admin'
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAdmin: checkIsAdmin(session?.user ?? null),
      loading: false,
    })
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (!checkIsAdmin(data.user)) {
      await supabase.auth.signOut()
      return { error: '此帳號沒有管理員權限' }
    }
    set({
      session: data.session,
      user: data.user,
      isAdmin: true,
      loading: false,
    })
    return { error: null }
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) return { error: error.message }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, isAdmin: false, loading: false })
  },

  init: async () => {
    const { data } = await supabase.auth.getSession()
    set({
      session: data.session,
      user: data.session?.user ?? null,
      isAdmin: checkIsAdmin(data.session?.user ?? null),
      loading: false,
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      const isAdmin = checkIsAdmin(session?.user ?? null)
      // If user just signed in via OAuth but is not admin, sign them out immediately
      if (session && !isAdmin) {
        void supabase.auth.signOut()
        set({ session: null, user: null, isAdmin: false, loading: false })
        return
      }
      set({
        session,
        user: session?.user ?? null,
        isAdmin,
        loading: false,
      })
    })
  },
}))
