/**
 * Utility to combine conditional className values.
 *
 * Accepts any mix of strings, numbers, null, undefined or false and
 * returns a single space-separated string with only the truthy values.
 *
 * Example:
 *   cn(
 *     "base",
 *     isActive && "text-cyan-400",
 *     maybeClassName,
 *   );
 */
export function cn(
  ...values: Array<string | number | null | undefined | false>
): string {
  return values.filter(Boolean).join(" ");
}

