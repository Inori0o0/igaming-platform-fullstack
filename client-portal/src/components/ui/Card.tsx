import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { cn } from "@/src/lib/cn";

export type CardProps = PropsWithChildren<
  Omit<HTMLAttributes<HTMLDivElement>, "title">
> & {
  title?: ReactNode;
  description?: ReactNode;
  /** 可選的 hero 區塊，會顯示在標題上方（例如圖片 + 漸層 + 文字） */
  hero?: ReactNode;
};

export function Card({
  title,
  description,
  hero,
  className,
  children,
  ...props
}: CardProps) {
  // 有標題/描述時，children 只需要佔剩餘空間；無 meta 時讓 children 直接吃滿高度。
  const hasMeta = Boolean(hero || title || description);

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-neutral-950/70 p-5 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-md",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_60%)]",
        className,
      )}
      {...props}
    >
      <div className="relative flex h-full flex-col">
        {hero && <div className="mb-3 overflow-hidden rounded-xl">{hero}</div>}
        {(title || description) && (
          <header className="mb-3 space-y-1">
            {title && (
              <h2 className="text-lg font-semibold tracking-wide text-cyan-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-neutral-300/85">{description}</p>
            )}
          </header>
        )}
        <div className={cn("flex-1", hasMeta ? "" : "h-full")}>{children}</div>
      </div>
    </section>
  );
}

