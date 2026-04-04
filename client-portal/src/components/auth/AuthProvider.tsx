"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";

// 站點層級的認證啟動器：一進站跑 initAuth，並監聽 Supabase auth 狀態變化
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [initAuth]);

  // 停權攔截：已登入且帳號被停權時，強制導向 /banned
  useEffect(() => {
    if (
      !isLoading &&
      user !== null &&
      !user.is_guest &&
      !!user.banned_at &&
      pathname !== "/banned"
    ) {
      router.replace("/banned");
    }
  }, [isLoading, user, pathname, router]);

  return <>{children}</>;
}
