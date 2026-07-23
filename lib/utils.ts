import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge only knows Tailwind's stock scales. The theme adds three
 * custom fontSize keys (see tailwind.config.ts), and without registering them
 * here tailwind-merge reads `text-display` as a text-COLOR utility, decides a
 * following `text-foreground` conflicts with it, and silently drops the size:
 *
 *   cn("text-display text-foreground")  ->  "text-foreground"
 *
 * The class is present in the source and absent from the DOM. That stripped the
 * base size off every PageHeader h1, leaving only its `md:` size, so page
 * titles rendered at inherited body size (16px) below 768px on 21 route
 * templates while desktop looked correct and hid the bug.
 *
 * Register all three keys together: leaving any of them out re-arms the same
 * trap for the next `cn()` call that uses it.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "section-title", "section-title-lg"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(safe);
}

export function formatCurrencyWhole(value: string | number | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
  const safe = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatCurrencyRangeWhole(min: number, max: number): string {
  return `${formatCurrencyWhole(min)} - ${formatCurrencyWhole(max)}`;
}

// Quote calculation utilities
export function roundUpToNearest5(value: number): number {
  if (!value || value <= 0 || isNaN(value)) {
    return 0;
  }
  return Math.ceil(value / 5) * 5;
}

export function roundDownToNearest5(value: number): number {
  if (!value || value <= 0 || isNaN(value)) {
    return 0;
  }
  return Math.floor(value / 5) * 5;
}

function parseQuoteNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return Number.isFinite(numValue) && numValue > 0 ? numValue : 0;
}

export function calculateQuoteRange(value: string | number | null | undefined, percent: number = 0.15): {
  point: number;
  min: number;
  max: number;
} {
  const base = parseQuoteNumber(value);
  const pct = Number.isFinite(percent) ? Math.min(0.5, Math.max(0, percent)) : 0.15;

  if (base <= 0) {
    return { point: 0, min: 0, max: 0 };
  }

  const point = roundUpToNearest5(base);
  const rawMin = base * (1 - pct);
  const rawMax = base * (1 + pct);
  const min = roundDownToNearest5(rawMin);
  const max = roundUpToNearest5(rawMax);

  if (max <= min) {
    return { point, min: Math.max(0, min), max: Math.max(min + 5, max) };
  }

  return { point, min: Math.max(0, min), max: Math.max(0, max) };
}

export function formatQuoteRangeWholeFromValue(value: string | number | null | undefined, percent: number = 0.15): string {
  const { min, max } = calculateQuoteRange(value, percent);
  if (min === 0 && max === 0) return formatCurrencyWhole(0);
  return formatCurrencyRangeWhole(min, max);
}
