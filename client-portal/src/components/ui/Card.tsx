import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { cn } from "@/src/lib/cn";

export type CardProps = PropsWithChildren<
  Omit<HTMLAttributes<HTMLDivElement>, "title">
> & {
  title?: ReactNode;
  description?: ReactNode;
};

export function Card({
  title,
  description,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-neutral-950/70 p-5 shadow-[0_0_40px_rgba(34,211,238,0.18)] backdrop-blur-md",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_60%)]",
        className,
      )}
      {...props}
    >
      <div className="relative space-y-3">
        {(title || description) && (
          <header className="space-y-1">
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
        {children}
      </div>
    </section>
  );
}

