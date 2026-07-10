"use client";

import { ProfileFeedbackToast } from "@/src/components/profile/shared/ProfileFeedbackToast";
import { useToastStore } from "@/src/store/toastStore";

export function AppToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-16 z-50 flex flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ProfileFeedbackToast
          key={toast.id}
          tone={toast.tone}
          message={toast.message}
        />
      ))}
    </div>
  );
}
