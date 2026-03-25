"use client";

/** 簡化路單：最多顯示最近 24 局，以閒／莊／和字元區分。 */
import clsx from "clsx";
import type { RoadEntry } from "./types";

type RoadPanelProps = {
  road: RoadEntry[];
};

function outcomeStyle(outcome: RoadEntry["outcome"]) {
  switch (outcome) {
    case "player":
      return "border-cyan-300/50 bg-cyan-500/15 text-cyan-100";
    case "banker":
      return "border-rose-300/50 bg-rose-500/15 text-rose-100";
    default:
      return "border-emerald-300/50 bg-emerald-500/15 text-emerald-100";
  }
}

function outcomeGlyph(outcome: RoadEntry["outcome"]) {
  switch (outcome) {
    case "player":
      return "閒";
    case "banker":
      return "莊";
    default:
      return "和";
  }
}

export function RoadPanel({ road }: RoadPanelProps) {
  const cells = Array.from({ length: 24 }).map((_, idx) => road[idx] ?? null);
  return (
    <div className="grid grid-cols-6 gap-2 text-[10px] text-neutral-500">
      {cells.map((entry, idx) => (
        <div
          key={entry?.roundId ?? idx}
          className={clsx(
            "flex h-7 items-center justify-center rounded-md border bg-neutral-950/60",
            entry ? outcomeStyle(entry.outcome) : "border-cyan-500/10",
          )}
          title={entry ? `round: ${entry.roundId}` : "—"}
        >
          {entry ? outcomeGlyph(entry.outcome) : "—"}
        </div>
      ))}
    </div>
  );
}

