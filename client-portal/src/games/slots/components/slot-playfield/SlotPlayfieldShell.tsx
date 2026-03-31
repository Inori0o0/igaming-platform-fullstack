"use client";

import type { CSSProperties, PropsWithChildren } from "react";

type SlotPlayfieldShellProps = PropsWithChildren<{
  style?: CSSProperties;
}>;

export function SlotPlayfieldShell({
  style,
  children,
}: SlotPlayfieldShellProps) {
  return (
    <div className="w-full p-4" style={style}>
      {children}
    </div>
  );
}
