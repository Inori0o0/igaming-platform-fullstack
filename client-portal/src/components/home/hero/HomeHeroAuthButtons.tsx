"use client";

import { Button } from "@/src/components/ui/Button";
import { useAuthStore } from "@/src/store/authStore";

export function HomeHeroAuthButtons() {
  const user = useAuthStore((s) => s.user);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);

  const showAuthButtons = !user || user.is_guest;
  if (!showAuthButtons) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="lg" onClick={() => setOpenAuthModal(true)}>
        開始連線／登入
      </Button>
      {user?.is_guest && (
        <Button size="lg" variant="outline" onClick={() => setOpenAuthModal(true)}>
          以訪客進入大廳
        </Button>
      )}
    </div>
  );
}
