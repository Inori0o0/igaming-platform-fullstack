import { NextResponse, type NextRequest } from "next/server";
import { issueSeedForRound } from "@/src/lib/gameSeedStore";

const MAX_ROUND_ID_LENGTH = 200;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { roundId?: unknown } | null;
  const roundId = body?.roundId;

  if (
    typeof roundId !== "string" ||
    roundId.length === 0 ||
    roundId.length > MAX_ROUND_ID_LENGTH
  ) {
    return NextResponse.json({ error: "roundId is required" }, { status: 400 });
  }

  const { seed, seedHash } = issueSeedForRound(roundId);
  return NextResponse.json({ roundId, seed, seedHash });
}
