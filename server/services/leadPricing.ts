import { storage } from "../storage";
import type { Lead } from "@shared/schema";

/**
 * Round price UP to nearest $5 or $0
 * Examples: $147 → $150, $143 → $145, $152 → $155, $198 → $200
 */
function roundToNearestFive(price: number): number {
  return Math.ceil(price / 5) * 5;
}

// Calculate lead price based on quote details
export function calculateLeadPrice(params: {
  finalQuote: number;
  frequency: string;
  serviceType: string;
}): { basePrice: number; currentPrice: number } {
  const { finalQuote, frequency, serviceType } = params;

  let basePrice: number;

  if (frequency === "one-time") {
    // One-time services: 10% of quote
    basePrice = finalQuote * 0.10;
  } else {
    // Recurring services: cost of one service visit
    // Estimate based on service type
    const recurringPrices: Record<string, number> = {
      "lawn-mowing": 45,
      "lawn-care": 50,
      "fertilization": 60,
      "aeration": 75,
      "weed-control": 55,
      "tree-trimming": 85,
      "hedge-trimming": 65,
      "landscaping": 80,
      "mulching": 70,
      "seasonal-cleanup": 90,
      "christmas-lights": 150,
    };

    basePrice = recurringPrices[serviceType] || 60; // Default to $60
  }

  // Ensure minimum price of $10, round to nearest $5
  basePrice = Math.max(10, basePrice);
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

    const currentPrice = parseFloat(lead.currentLeadPrice);
    const basePrice = parseFloat(lead.baseLeadPrice);
    const reductionRate = parseFloat(lead.priceReductionRate || "1.50");

    // Calculate days since last price update
    const lastUpdate = new Date(lead.lastPriceUpdate || lead.createdAt);
    const now = new Date();
    const daysSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceUpdate < 1) continue; // Don't update if less than a day

    // Calculate new price (reduce by 1-2% daily)
    const reductionAmount = currentPrice * (reductionRate / 100);
    let newPrice = currentPrice - reductionAmount;

    // Set minimum price (20% of base price)
    const minimumPrice = basePrice * 0.20;
    newPrice = Math.max(minimumPrice, newPrice);
    
    // Round to nearest $5
    newPrice = roundToNearestFive(newPrice);

    // Only update if price changed
    if (Math.abs(newPrice - currentPrice) > 0.01) {
      const updated = await storage.updateLead(lead.id, {
        currentLeadPrice: newPrice.toFixed(2),
        lastPriceUpdate: now,
      });

      if (updated) {
        updatedLeads.push(updated);

        // Notify subcontractors of price drop
        const subcontractors = await storage.getAllSubcontractors();
        for (const sub of subcontractors) {
          await storage.createNotification({
            userId: sub.id,
            type: "lead_price_drop",
            title: "Lead Price Reduced",
            message: `${lead.serviceType} lead in ${lead.city} now $${newPrice.toFixed(2)} (was $${currentPrice.toFixed(2)})`,
            leadId: lead.id,
          });
        }
      }
    }
  }

  return updatedLeads;
}
