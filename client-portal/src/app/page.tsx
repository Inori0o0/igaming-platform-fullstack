"use client";

import Image from "next/image";
import { Button } from "@/src/components/ui/Button";
import { Card } from "@/src/components/ui/Card";
import { Input } from "@/src/components/ui/Input";
import { Avatar } from "@/src/components/ui/Avatar";
import { useAuthStore } from "@/src/store/authStore";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);
  const signOut = useAuthStore((s) => s.signOut);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.25),transparent_55%)]">
        <p className="text-cyan-300/90">載入中…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.25),transparent_55%)]">
      <Card
        hero={
          <div className="relative h-40 w-full">
            <Image
              src="/horse-hero.png"
              alt="vAcAnt Portal Hero"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 768px) 384px, 100vw"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">
                vAcAnt Portal
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                連線，進入霓虹賭場宇宙
              </p>
            </div>
          </div>
        }
        title="vAcAnt Client Portal"
        description="登入管理你的虛擬錢包與遊戲宇宙"
        className="w-full max-w-md"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar
              src={
                user && !user.is_guest
                  ? (user.avatar_url ?? undefined)
                  : undefined
              }
              fallback={user?.display_name ?? "訪客"}
            />
            <div className="space-y-1 text-sm">
              <p className="font-medium text-neutral-50">
                {user?.display_name ?? "訪客"}
              </p>
              <p className="text-xs text-neutral-400">
                {user?.is_guest
                  ? "訪客模式 · 點擊登入可綁定 Google 帳號"
                  : (user?.email ?? "已登入")}
              </p>
            </div>
          </div>
          {user?.is_guest ? (
            <Button onClick={() => setOpenAuthModal(true)} variant="secondary">
              登入
            </Button>
          ) : (
            <Button onClick={() => signOut()} variant="ghost" size="sm">
              登出
            </Button>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <Input
            label="Email"
            placeholder="you@example.com"
            helperText="暫時只是UI元件尚未送出到 Supabase"
          />

          <div className="flex items-center gap-2">
            <Button onClick={() => setOpenAuthModal(true)} variant="outline">
              開啟登入 / 註冊
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
