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
}>;

export function Modal({
  open,
  title,
  onClose,
  footer,
  className,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md px-4"
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

