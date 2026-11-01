/**
 * Planning-range currency format ($48k, $1.2M). Its own module so the site-wide
 * assistant can format a range without importing the estimate engine and the
 * finish library it carries; estimateEngine re-exports it.
 */
export function formatPlanningCurrency(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${n.toLocaleString()}`;
}
