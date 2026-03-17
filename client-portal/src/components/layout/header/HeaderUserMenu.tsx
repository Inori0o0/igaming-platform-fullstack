import { useAuthStore } from "@/src/store/authStore";
import { Button } from "@/src/components/ui/Button";
import { Avatar } from "@/src/components/ui/Avatar";

export function HeaderUserMenu() {
  const user = useAuthStore((s) => s.user);
  const setOpenAuthModal = useAuthStore((s) => s.setOpenAuthModal);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="flex items-center gap-2 rounded-full border border-cyan-500/20 bg-neutral-900/80 px-2 py-1 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
      <Avatar
        src={user && !user.is_guest ? (user.avatar_url ?? undefined) : undefined}
        fallback={user?.display_name ?? "訪客"}
      />
      <div className="hidden flex-col leading-tight md:flex">
        <span className="text-xs font-medium text-neutral-50">
          {user?.display_name ?? "訪客"}
        </span>
        <span className="text-[10px] text-neutral-400">
          {user?.is_guest ? "訪客模式" : user?.email ?? "已登入帳號"}
        </span>
      </div>
      {user?.is_guest ? (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setOpenAuthModal(true)}
        >
          登入
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => signOut()}>
          登出
        </Button>
      )}
    </div>
  );
}

