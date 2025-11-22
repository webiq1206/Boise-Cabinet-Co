import { storage } from "./storage";

// Automated daily lead price reduction cron job
export async function runDailyPriceReduction() {
  try {
    console.log("[CRON] Starting daily lead price reduction...");
    
    const now = new Date();
    const leads = await storage.getAllLeads();
    const availableLeads = leads.filter(lead => lead.status === "available");
    
    let updatedCount = 0;
    
    for (const lead of availableLeads) {
      if (!lead.lastPriceUpdate) continue;
      
      const hoursSinceUpdate = (now.getTime() - new Date(lead.lastPriceUpdate).getTime()) / (1000 * 60 * 60);
      
      // Only update if 24+ hours have passed
      if (hoursSinceUpdate >= 24) {
        const reductionRate = parseFloat(lead.priceReductionRate || "1.50") / 100; // 1.5% default
        const currentPrice = parseFloat(lead.currentLeadPrice || "0");
        const minPrice = parseFloat(lead.baseLeadPrice || "0") * 0.5; // Don't go below 50% of base
        
        const newPrice = Math.max(
          currentPrice * (1 - reductionRate),
          minPrice
        );
        
        if (newPrice !== currentPrice && newPrice >= minPrice) {
          await storage.updateLead(lead.id, {
            currentLeadPrice: newPrice.toFixed(2),
            lastPriceUpdate: now,
          });
          
          updatedCount++;
          console.log(`[CRON] Reduced lead ${lead.id} price: $${currentPrice} → $${newPrice.toFixed(2)}`);
          
          // Optional: Create notification for price drop
          const subcontractors = await storage.getAllSubcontractors();
          for (const sub of subcontractors) {
            await storage.createNotification({
              userId: sub.id,
              type: "lead_price_drop",
              title: "Lead Price Reduced",
              message: `${lead.serviceType} lead in ${lead.city} reduced to $${newPrice.toFixed(2)}`,
              leadId: lead.id,
            });
          }
        }
      }
    }
    
    console.log(`[CRON] Daily price reduction complete. Updated ${updatedCount} leads.`);
    return { success: true, updated: updatedCount };
  } catch (error) {
    console.error("[CRON] Error during daily price reduction:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Schedule the cron job to run daily at 2 AM
export function scheduleDailyPriceReduction() {
  const runAtHour = 2; // 2 AM
  
  function scheduleNext() {
    const now = new Date();
    const next = new Date();
    next.setHours(runAtHour, 0, 0, 0);
    
    // If we've passed 2 AM today, schedule for tomorrow
    if (now.getTime() > next.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    
    const msUntilNext = next.getTime() - now.getTime();
    
    console.log(`[CRON] Next price reduction scheduled for ${next.toLocaleString()}`);
    
    setTimeout(async () => {
      await runDailyPriceReduction();
      scheduleNext(); // Schedule the next run
    }, msUntilNext);
  }
  
  scheduleNext();
}

// Alternative: Simple interval-based approach (runs every 24 hours)
export function startPriceReductionInterval() {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  
  // Run immediately on startup
  runDailyPriceReduction();
  
  // Then run every 24 hours
  setInterval(runDailyPriceReduction, TWENTY_FOUR_HOURS);
  
  console.log("[CRON] Price reduction interval started (runs every 24 hours)");
}
