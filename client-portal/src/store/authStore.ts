"use client";

import { create } from "zustand";
import { supabase } from "@/src/lib/supabaseClient";
import { publicObjectUrl } from "@/src/lib/supabaseStorage";

// 訪客 ID 存在瀏覽器的 key、訪客顯示名稱
const GUEST_STORAGE_KEY = "vacant_guest_id";
const GUEST_DISPLAY_NAME = "訪客";
const GOOGLE_AVATAR_SIZE = 512;

function normalizeGoogleAvatarUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("googleusercontent.com")) return url;

    // Google avatar 常見尾碼如 `=s96-c`，放大為更高解析度避免在個人中心顯示模糊。
    return url.match(/=s\d+(-[a-z0-9-]+)?$/i)
      ? url.replace(/=s\d+(-[a-z0-9-]+)?$/i, `=s${GOOGLE_AVATAR_SIZE}-c`)
      : `${url}=s${GOOGLE_AVATAR_SIZE}-c`;
  } catch {
    return url;
  }
}

/** 目前使用者：訪客（只有 id + 顯示名）或已登入（含頭像、email） */
export type AuthUser =
  | {
      id: string;
      display_name: string;
      is_guest: true;
      email?: undefined;
      avatar_url?: undefined;
    }
  | {
      id: string;
      display_name: string;
      avatar_url?: string | null;
      email?: string | null;
      banned_at?: string | null;
      is_guest: false;
    };

type AuthState = {
  user: AuthUser | null;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  openAuthModal: boolean;
  setOpenAuthModal: (open: boolean) => void;
};

/** 取得或建立訪客 ID：localStorage 有就回傳，沒有就產生一個並存起來 */
function getOrCreateGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_STORAGE_KEY, id);
  }
  return id;
}

/** 用訪客 ID 組出「訪客」使用者物件，給 store 的 user 用 */
function getGuestUser(): AuthUser {
  const id = getOrCreateGuestId();
  return {
    id,
    display_name: GUEST_DISPLAY_NAME,
    is_guest: true,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  openAuthModal: false,
  setOpenAuthModal: (open) => set({ openAuthModal: open }),

  /** 一進站或 session 變動時呼叫：有 Supabase session 就設為已登入，沒有就設為訪客 */
  initAuth: async () => {
    set({ isLoading: true });
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.warn("Auth session error:", error);
        set({ user: getGuestUser(), isLoading: false });
        return;
      }

      // 有 session → 從 Supabase 使用者資料組出 user
      if (session?.user) {
        const metaDisplayName =
          session.user.user_metadata?.full_name ??
          session.user.user_metadata?.name ??
          session.user.email?.split("@")[0] ??
          "User";

        const metaAvatarUrl = normalizeGoogleAvatarUrl(
          session.user.user_metadata?.avatar_url ?? null,
        );

        let display_name = metaDisplayName;
        let avatar_url: string | null = metaAvatarUrl;
        let banned_at: string | null = null;

        // 額外同步 profile（需求優先順序：使用者上傳 > 商店頭像 > Google）
        try {
          const { data: dbUser } = await supabase
            .from("users")
            .select("id, display_name, avatar_url, banned_at")
            .eq("auth_user_id", session.user.id)
            .maybeSingle();

          if (dbUser) {
            display_name = dbUser.display_name ?? metaDisplayName;
            banned_at = dbUser.banned_at ?? null;

            if (dbUser.avatar_url) {
              avatar_url = dbUser.avatar_url;
            } else {
              const { data: selectionRow } = await supabase
                .from("user_avatar_selection")
                .select("avatar_product_id")
                .eq("user_id", dbUser.id)
                .maybeSingle();

              const avatarProductId = selectionRow?.avatar_product_id;
              if (avatarProductId) {
                const { data: productRow } = await supabase
                  .from("products")
                  .select("image_bucket, image_object_path")
                  .eq("id", avatarProductId)
                  .maybeSingle();

                if (
                  productRow?.image_object_path &&
                  typeof productRow.image_object_path === "string"
                ) {
                  const bucket = productRow.image_bucket ?? "shop-products";
                  avatar_url = publicObjectUrl(
                    bucket,
                    productRow.image_object_path,
                  );
                }
              }
            }
          }
        } catch (e) {
          console.warn("initAuth profile sync error:", e);
        }

        set({
          user: {
            id: session.user.id,
            display_name,
            avatar_url,
            email: session.user.email ?? null,
            banned_at,
            is_guest: false,
          },
          isLoading: false,
        });
        return;
      }

      // 沒有 session → 設為訪客
      set({ user: getGuestUser(), isLoading: false });
    } catch (e) {
      console.warn("initAuth error:", e);
      set({ user: getGuestUser(), isLoading: false });
    }
  },

  /** 觸發 Google OAuth，會跳轉到 Google 登入頁，完成後導回 /auth/callback */
  signInWithGoogle: async () => {
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      console.error("Google sign in error:", error);
      return;
    }
  },

  /** 登出：清掉 Supabase session 與訪客 ID，狀態改回新訪客 */
  signOut: async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
    set({ user: getGuestUser() });
  },

  /** 在登入彈窗選「以訪客繼續」：設為訪客並關閉彈窗 */
  continueAsGuest: () => {
    set({ user: getGuestUser(), openAuthModal: false });
  },
}));
