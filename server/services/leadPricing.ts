import { storage } from "../storage";
import type { Lead } from "@shared/schema";

function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

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

export function calculateLeadPrice(params: {
  finalQuote: number;
}): { basePrice: number; currentPrice: number } {
  const { finalQuote } = params;

  let basePrice = finalQuote * 0.10;
  basePrice = Math.max(15, basePrice);
  basePrice = roundToNearestFive(basePrice);

  return {
    basePrice,
    currentPrice: basePrice,
  };
}

export async function updateLeadPrices(): Promise<Lead[]> {
  const leads = await storage.getAllLeads();
  const updatedLeads: Lead[] = [];

  for (const lead of leads) {
    if (lead.status !== "available") continue;

    const currentPrice = parsePrice(lead.currentLeadPrice, 0);
    const basePrice = parsePrice(lead.baseLeadPrice, 0);
    if (currentPrice <= 0 || basePrice <= 0) continue;

    const lastUpdate = new Date(lead.lastPriceUpdate || lead.createdAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate < 1) continue;

    const ratePercent = Math.max(0, parsePrice((lead as any).priceReductionRate, 1.5));
    const dailyFactor = Math.max(0, Math.min(1, 1 - ratePercent / 100));
    const floorPct = 0.2;
    const rawPrice = currentPrice * Math.pow(dailyFactor, daysSinceUpdate);
    const floorPrice = basePrice * floorPct;

    const floored = Math.max(rawPrice, floorPrice);
    const minRoundedFloor = Math.max(5, roundToNearestFive(floorPrice));
    const newPrice = Math.max(roundDownToNearestFive(floored), minRoundedFloor);

    if (Math.abs(newPrice - currentPrice) > 0.01) {
      const updated = await storage.updateLead(lead.id, {
        currentLeadPrice: newPrice.toFixed(2),
        lastPriceUpdate: now,
      });

      if (updated) {
        updatedLeads.push(updated);

        const subcontractors = await storage.getAllSubcontractors();
        for (const sub of subcontractors) {
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
