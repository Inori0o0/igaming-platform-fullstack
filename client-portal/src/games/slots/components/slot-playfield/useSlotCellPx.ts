"use client";

import { useLayoutEffect, useState } from "react";
import { SLOT_CELL_PX } from "./constants";

function cellPxForWidth(width: number): number {
  if (width < 360) return 32;
  if (width < 400) return 34;
  if (width < 440) return 36;
  if (width < 480) return 38;
  if (width < 560) return 42;
  if (width < 640) return 46;
  if (width < 768) return 54;
  if (width < 900) return 66;
  if (width < 1024) return 76;
  return SLOT_CELL_PX;
}

/**
 * 依視窗寬度縮放轉輪單格高度，避免手機/平板固定 96px 時超出機台外框。
 */
export function useSlotCellPx(): number {
  const [cellPx, setCellPx] = useState(SLOT_CELL_PX);

  useLayoutEffect(() => {
    function update() {
      setCellPx(cellPxForWidth(window.innerWidth));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cellPx;
}
