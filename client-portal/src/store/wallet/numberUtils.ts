export { toNumber } from "@/src/lib/numeric";

export function getStartOfDayIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

export function getThresholdIso(ms: number) {
  return new Date(Date.now() - ms).toISOString();
}
