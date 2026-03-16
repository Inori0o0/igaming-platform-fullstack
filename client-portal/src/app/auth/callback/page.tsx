"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import { useAuthStore } from "@/src/store/authStore";

// Google OAuth 導回 `/auth/callback?code=...` 時，在這裡把 code 換成 Supabase session
function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // 用簡單的狀態顯示目前進度（載入中 / 成功 / 失敗）
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    // 從網址上抓出 Supabase 回傳的 code，以及登入完要回去的頁面（沒有就回首頁）
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    // 沒有 code 代表網址不正確，直接導回指定頁
    if (!code) {
      router.replace(next);
      return;
    }

    // 把 code 交給 Supabase 兌換成 session，成功後更新 auth 狀態並導回原頁
    supabase.auth
      .exchangeCodeForSession(code)
      .then(async () => {
        await initAuth();
        setStatus("ok");
        router.replace(next);
      })
      .catch((err) => {
        console.error("Auth callback error:", err);
        setStatus("error");
        router.replace("/");
      });
  }, [searchParams, router, initAuth]);

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950">
        <p className="text-rose-400">登入時發生錯誤，正在返回首頁…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950">
      <p className="text-cyan-300/90">正在完成登入…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    // 使用 Suspense 是因為 useSearchParams 在某些情況下需要等待路由資料就緒
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-neutral-950">
          <p className="text-cyan-300/90">載入中…</p>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
