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
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (!code) {
      router.replace(next);
      return;
    }

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

