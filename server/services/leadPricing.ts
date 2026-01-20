import { storage } from "../storage";
import type { Lead } from "@shared/schema";

/**
 * Round price UP to nearest $5 or $0
 * Examples: $147 → $150, $143 → $145, $152 → $155, $198 → $200
 */
function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

/**
 * Round price DOWN to nearest $5 or $0 (useful for discounts/price drops)
 */
function roundDownToNearestFive(price: number): number {
  return Math.floor(price / 5) * 5;
}

function parsePrice(value: unknown, fallback = 0): number {
  const n =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? parseFloat(value)
        : NaN;
  return Number.isFinite(n) ? n : fallback;
}

// Calculate lead price based on quote details
export function calculateLeadPrice(params: {
  finalQuote: number;
  frequency: string;
  serviceType: string;
}): { basePrice: number; currentPrice: number } {
  const { finalQuote, frequency, serviceType } = params;

  // For recurring services, price the lead as "one service visit" (fixed schedule).
  // This matches the subcontractor portal + legal agreement copy.
  const RECURRING_LEAD_BASE_PRICES: Record<string, number> = {
    "lawn-mowing": 45,
    "lawn-care": 50,
    "lawn-maintenance": 50,
    "fertilization": 60,
    "aeration": 75,
    "weed-control": 55,
    "tree-trimming": 85,
    "hedge-trimming": 65,
    "landscaping": 80,
    "mulching": 70,
    "mulch-installation": 70,
    "seasonal-cleanup": 90,
    "spring-cleanup": 90,
    "fall-cleanup": 90,
    "christmas-light-installation": 150,
  };

  // One-time projects: 10% of total quote (minimum $15), rounded up to the nearest $5
  let basePrice: number =
    frequency && frequency !== "one-time"
      ? (RECURRING_LEAD_BASE_PRICES[serviceType] ?? 60)
      : finalQuote * 0.10;

  // Ensure minimum price of $15, round to nearest $5
  basePrice = Math.max(15, basePrice);
  basePrice = roundToNearestFive(basePrice);

  return {
    basePrice,
    currentPrice: basePrice,
  };
}

// Update all lead prices (runs daily via cron)
export async function updateLeadPrices(): Promise<Lead[]> {
  const leads = await storage.getAllLeads();
  const updatedLeads: Lead[] = [];

  for (const lead of leads) {
    if (lead.status !== "available") continue; // Only update available leads

    const currentPrice = parsePrice(lead.currentLeadPrice, 0);
    const basePrice = parsePrice(lead.baseLeadPrice, 0);
    if (currentPrice <= 0 || basePrice <= 0) continue;

    // Calculate days since last price update
    const lastUpdate = new Date(lead.lastPriceUpdate || lead.createdAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate < 1) continue; // Don't update if less than a day

    // Daily decay: default 1.5%/day compounded.
    // Floor: 20% of base price (matches UI + schema defaults).
    const ratePercent = Math.max(0, parsePrice((lead as any).priceReductionRate, 1.5));
    const dailyFactor = Math.max(0, Math.min(1, 1 - ratePercent / 100));
    const floorPct = 0.2;
    const rawPrice = currentPrice * Math.pow(dailyFactor, daysSinceUpdate);
    const floorPrice = basePrice * floorPct;

    // Round down for price drops, then enforce the rounded floor.
    const floored = Math.max(rawPrice, floorPrice);
    const minRoundedFloor = Math.max(5, roundToNearestFive(floorPrice));
    const newPrice = Math.max(roundDownToNearestFive(floored), minRoundedFloor);

    // Only update if price changed
    if (Math.abs(newPrice - currentPrice) > 0.01) {
      const updated = await storage.updateLead(lead.id, {
        currentLeadPrice: newPrice.toFixed(2),
        lastPriceUpdate: now,
      });

      if (updated) {
        updatedLeads.push(updated);

        // Notify subcontractors who are watching this lead
        const subcontractors = await storage.getAllSubcontractors();
        for (const sub of subcontractors) {
          // watchedLeads may be JSONB array or stringified JSON depending on storage layer
          let watched: string[] = [];
          const rawWatched: any = (sub as any).watchedLeads;
          if (Array.isArray(rawWatched)) watched = rawWatched;
          else if (typeof rawWatched === "string") {
            try {
              const parsed = JSON.parse(rawWatched);
              watched = Array.isArray(parsed) ? parsed : [];
            } catch {
              watched = [];
            }
          }

          if (!watched.includes(lead.id)) continue;

          await storage.createNotification({
            userId: sub.id,
            type: "lead_price_drop",
            title: "Lead Price Reduced",
            message: `${lead.serviceType} lead in ${lead.city} is now $${newPrice.toFixed(2)} (was $${currentPrice.toFixed(2)})`,
            leadId: lead.id,
          });
        }
      }
    }
  }

  return updatedLeads;
}
