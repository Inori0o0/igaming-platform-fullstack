"use client";

import { Modal } from "@/src/components/ui/Modal";
import { Button } from "@/src/components/ui/Button";
import { useAuthStore } from "@/src/store/authStore";

export function AuthModal() {
  const open = useAuthStore((s) => s.openAuthModal);
  const setOpen = useAuthStore((s) => s.setOpenAuthModal);
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      title="登入 / 註冊"
      footer={
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
          稍後再說
        </Button>
      }
    >
      <div className="space-y-4">
        <p className="text-neutral-300">
          使用 Google 帳號登入，或先以訪客身份繼續瀏覽。
        </p>
        <div className="flex flex-col gap-3">
          <Button
            className="w-full"
            onClick={() => signInWithGoogle()}
            size="lg"
          >
            使用 Google 登入
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-600" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider text-neutral-500">
              <span className="bg-neutral-950/90 px-2">或</span>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={continueAsGuest}
            size="lg"
          >
            以訪客繼續
          </Button>
        </div>
      </div>
    </Modal>
  );
}
