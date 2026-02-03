import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
