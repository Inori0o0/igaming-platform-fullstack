"use client";

type ProfileFeedbackToastProps = {
  tone: "success" | "error";
  message: string;
};

export function ProfileFeedbackToast({ tone, message }: ProfileFeedbackToastProps) {
  return (
    <div
      className={[
        "pointer-events-auto min-w-56 rounded-xl border px-4 py-3 text-xs shadow-lg backdrop-blur",
        tone === "success"
          ? "border-emerald-400/40 bg-emerald-950/80 text-emerald-100"
          : "border-rose-400/40 bg-rose-950/80 text-rose-100",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}

