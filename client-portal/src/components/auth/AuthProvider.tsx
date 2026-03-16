"use client";

import { useEffect } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";

// 站點層級的認證啟動器：一進站跑 initAuth，並監聽 Supabase auth 狀態變化
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    // 初次載入時，同步一次目前的登入／訪客狀態
    initAuth();

    // 監聽 Supabase auth 事件（例如 OAuth 完成後），有 user 時再同步一次狀態
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initAuth();
      }
    });

    // 組件卸載時取消訂閱，避免記憶體洩漏
    return () => subscription.unsubscribe();
  }, [initAuth]);

  return <>{children}</>;
}
