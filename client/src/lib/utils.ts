import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { calculateQuoteRange } from "@shared/utils";

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

export function formatQuoteRangeWholeFromValue(value: string | number | null | undefined, percent: number = 0.15): string {
  const { min, max } = calculateQuoteRange(value, percent);
  if (min === 0 && max === 0) return formatCurrencyWhole(0);
  return formatCurrencyRangeWhole(min, max);
}
