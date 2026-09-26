/**
 * metrics.ts — helpers for displaying headline figures.
 */

/**
 * Split a display value such as "€16M", "€11M+", "673%" or "25+" into the
 * animated number and its fixed prefix/suffix. The old parser kept only one
 * suffix character, so "€16M+" rendered as "€16+" (audit finding).
 * @param raw - Display value.
 * @returns prefix, numeric part, suffix.
 */
export function parseMetric(raw: string): { prefix: string; value: number; suffix: string } {
  const match = /^(\D*)(\d+(?:[.,]\d+)?)(.*)$/.exec(raw.trim());
  if (!match) return { prefix: "", value: 0, suffix: raw };
  return { prefix: match[1], value: Number(match[2].replace(",", ".")), suffix: match[3] };
}
