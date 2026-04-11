"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/src/lib/cn";
import { Card } from "@/src/components/ui/Card";

export type ModalProps = PropsWithChildren<{
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  className?: string;
  /** 疊在其它 Modal 上時提高層級，例如裁切視窗用 z-[60] */
  overlayZClass?: string;
  /** 內層寬度容器，預設 max-w-md；較寬內容可傳 max-w-lg 等 */
  shellClassName?: string;
  /** 為 false 時不按 Escape 關閉（下層 Modal 在子層開啟時避免一起關） */
  closeOnEscape?: boolean;
}>;

export function Modal({
  open,
  title,
  onClose,
  footer,
  className,
  overlayZClass = "z-50",
  shellClassName = "max-h-[90vh] w-full max-w-md px-4",
  closeOnEscape = true,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, closeOnEscape]);

  if (!open) return null;

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm",
        overlayZClass,
      )}
      onClick={onClose}
    >
      <div
        className={shellClassName}
        onClick={(event) => event.stopPropagation()}
      >
        <Card
          className={cn("space-y-4 bg-neutral-950/90", className)}
          title={
            title ?? (
              <span className="text-sm uppercase tracking-[0.2em] text-cyan-300/90">
                vAcAnt Portal
              </span>
            )
          }
        >
          <div className="text-sm text-neutral-100/90">{children}</div>
          {footer && (
            <footer className="mt-4 flex items-center justify-end gap-2">
              {footer}
            </footer>
          )}
        </Card>
      </div>
    </div>,
    document.body,
  );
}

