import { storage } from "./storage";

// Helper to calculate hours/days since a date
function getTimeSince(date: Date | string): { hours: number; days: number } {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  return { hours, days };
}

// Automated daily lead price reduction cron job
export async function runDailyPriceReduction() {
  try {
    console.log("[CRON] Starting daily lead price reduction...");

    const { updateLeadPrices } = await import("./services/leadPricing");
    const updatedLeads = await updateLeadPrices();

    console.log(`[CRON] Daily price reduction complete. Updated ${updatedLeads.length} leads.`);
    return { success: true, updated: updatedLeads.length };
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

// Admin daily digest of pending leads
export async function runAdminDailyDigest() {
  try {
    console.log("[CRON] Starting admin daily digest...");
    
    const leads = await storage.getAllLeads();
    const pendingLeads = leads.filter(lead => lead.status === "pending_admin");
    
    if (pendingLeads.length === 0) {
      console.log("[CRON] No pending leads for daily digest");
      return { success: true, sent: 0 };
    }
    
    // Categorize leads by age
    const now = new Date();
    const leads24h = pendingLeads.filter(lead => {
      const hours = getTimeSince(lead.createdAt).hours;
      return hours >= 24 && hours < 48;
    });
    const leads48h = pendingLeads.filter(lead => {
      const hours = getTimeSince(lead.createdAt).hours;
      return hours >= 48;
    });
    
    // Send digest to all admins
    const admins = await storage.getAllAdmins();
    let sentCount = 0;
    
    for (const admin of admins) {
      if (admin.email) {
        try {
          const { sendAdminDailyDigest } = await import("./services/emailNotifications");
          await sendAdminDailyDigest(admin.email, {
            totalPending: pendingLeads.length,
            leads24h: leads24h.length,
            leads48h: leads48h.length,
            pendingLeads: pendingLeads.slice(0, 10), // Top 10 for email
            leads24hList: leads24h.slice(0, 5),
            leads48hList: leads48h.slice(0, 5),
          });
          sentCount++;
          // Space out emails
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (emailError) {
          console.error(`[CRON] Failed to send daily digest to admin ${admin.email}:`, emailError);
        }
      }
    }
    
    console.log(`[CRON] Admin daily digest complete. Sent to ${sentCount} admins.`);
    return { success: true, sent: sentCount };
  } catch (error) {
    console.error("[CRON] Error during admin daily digest:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Schedule admin daily digest to run at 9 AM
export function scheduleAdminDailyDigest() {
  const runAtHour = 9; // 9 AM
  
  function scheduleNext() {
    const now = new Date();
    const next = new Date();
    next.setHours(runAtHour, 0, 0, 0);
    
    // If we've passed 9 AM today, schedule for tomorrow
    if (now.getTime() > next.getTime()) {
      next.setDate(next.getDate() + 1);
    }
    
    const msUntilNext = next.getTime() - now.getTime();
    
    console.log(`[CRON] Next admin daily digest scheduled for ${next.toLocaleString()}`);
    
    setTimeout(async () => {
      await runAdminDailyDigest();
      scheduleNext(); // Schedule the next run
    }, msUntilNext);
  }
  
  scheduleNext();
}

// Send reminders for leads pending >24 hours
export async function runAdminReminders() {
  try {
    console.log("[CRON] Starting admin reminder check...");
    
    const leads = await storage.getAllLeads();
    const pendingLeads = leads.filter(lead => lead.status === "pending_admin");
    
    const now = new Date();
    const reminders24h: typeof pendingLeads = [];
    const reminders48h: typeof pendingLeads = [];
    
    for (const lead of pendingLeads) {
      const { hours } = getTimeSince(lead.createdAt);
      
      if (hours >= 24 && hours < 48) {
        reminders24h.push(lead);
      } else if (hours >= 48) {
        reminders48h.push(lead);
      }
    }
    
    const admins = await storage.getAllAdmins();
    let sentCount = 0;
    
    // Send 24h reminders
    for (const lead of reminders24h) {
      for (const admin of admins) {
        if (admin.email) {
          try {
            const { sendAdminReminder } = await import("./services/emailNotifications");
            await sendAdminReminder(admin.email, {
              id: lead.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone || "",
              city: lead.city,
              serviceType: lead.serviceType,
              finalQuote: lead.finalQuote || "0",
              address: lead.address || undefined,
              hoursPending: getTimeSince(lead.createdAt).hours,
            });
            sentCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (emailError) {
            console.error(`[CRON] Failed to send 24h reminder for lead ${lead.id}:`, emailError);
          }
        }
      }
    }
    
    // Send 48h urgent reminders
    for (const lead of reminders48h) {
      for (const admin of admins) {
        if (admin.email) {
          try {
            const { sendAdminUrgentReminder } = await import("./services/emailNotifications");
            await sendAdminUrgentReminder(admin.email, {
              id: lead.id,
              name: lead.name,
              email: lead.email,
              phone: lead.phone || "",
              city: lead.city,
              serviceType: lead.serviceType,
              finalQuote: lead.finalQuote || "0",
              address: lead.address || undefined,
              hoursPending: getTimeSince(lead.createdAt).hours,
            });
            sentCount++;
            await new Promise(resolve => setTimeout(resolve, 2000));
          } catch (emailError) {
            console.error(`[CRON] Failed to send 48h reminder for lead ${lead.id}:`, emailError);
          }
        }
      }
    }
    
    console.log(`[CRON] Admin reminders complete. Sent ${sentCount} reminder emails.`);
    return { success: true, sent: sentCount };
  } catch (error) {
    console.error("[CRON] Error during admin reminders:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Schedule admin reminders to run every 6 hours
export function scheduleAdminReminders() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  
  // Run immediately on startup
  runAdminReminders();
  
  // Then run every 6 hours
  setInterval(runAdminReminders, SIX_HOURS);
  
  console.log("[CRON] Admin reminders interval started (runs every 6 hours)");
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

// Automated auto-decline of pending leads after 24 hours
export async function runAutoDeclinePendingLeads() {
  try {
    console.log("[CRON] Starting auto-decline of pending leads...");
    
    const now = new Date();
    const leads = await storage.getAllLeads();
    const pendingLeads = leads.filter(lead => lead.status === "pending_admin");
    
    let declinedCount = 0;
    
    // Prefer a real admin user for audit trails, but don't block auto-release if none exist.
    const admins = await storage.getAllAdmins();
    const systemAdminId = admins.length > 0 ? admins[0].id : null;

    // Fetch once; reused for all released leads.
    const subcontractors = await storage.getAllSubcontractors();
    
    for (const lead of pendingLeads) {
      const hoursSinceCreation = (now.getTime() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60);
      
      // Auto-decline if lead has been pending for 24+ hours
      if (hoursSinceCreation >= 24) {
        try {
          // Decline/release the lead into the subcontractor marketplace.
          // If we don't have an admin user, we still release it (adminReviewedBy stays null).
          const declinedLead = systemAdminId
            ? await storage.declineLead(lead.id, systemAdminId)
            : await storage.updateLead(lead.id, {
                status: "available",
                adminReviewedBy: null,
                adminReviewedAt: new Date(),
                adminDeclined: true,
                // Start price decay clock when the lead becomes available
                lastPriceUpdate: new Date(),
              });
          
          if (declinedLead) {
            declinedCount++;
            console.log(`[CRON] Auto-declined lead ${lead.id} (pending for ${hoursSinceCreation.toFixed(1)} hours)`);
            
            // Notify all subcontractors
            for (const sub of subcontractors) {
              await storage.createNotification({
                userId: sub.id,
                type: "new_lead",
                title: "New Lead Available",
                message: `${declinedLead.serviceType} lead in ${declinedLead.city} - $${declinedLead.currentLeadPrice}`,
                leadId: lead.id,
              });
            }
            
            // Send email notification to admin about auto-decline
            try {
              const { sendAdminAutoDeclineNotification } = await import("./services/emailNotifications");
              await sendAdminAutoDeclineNotification({
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone || "",
                city: lead.city,
                serviceType: lead.serviceType,
                finalQuote: lead.finalQuote || "0",
                address: lead.address || undefined,
                hoursPending: hoursSinceCreation,
              });
            } catch (emailError) {
              console.error(`[CRON] Failed to send auto-decline email for lead ${lead.id}:`, emailError);
              // Don't fail the process if email fails
            }
            
            // Send customer status update email
            if (lead.quoteId) {
              try {
                const quote = await storage.getQuoteById(lead.quoteId);
                if (quote) {
                  const { sendCustomerStatusUpdate } = await import("./services/emailNotifications");
                  await sendCustomerStatusUpdate(quote.email, quote.id, {
                    status: 'under_review',
                    message: "Your quote is being reviewed by our team. We'll be in touch soon with your customized estimate.",
                  });
                }
              } catch (emailError) {
                console.error(`[CRON] Failed to send customer status update email for lead ${lead.id}:`, emailError);
                // Don't fail the process if email fails
              }
            }
            
            // Send email notification to all subcontractors about new available lead
            try {
              const { sendContractorNewLeadAvailable } = await import("./services/emailNotifications");
              for (const sub of subcontractors) {
                const emailEnabled = (sub as any).emailNotificationsEnabled ?? true;
                if (sub.email && emailEnabled) {
                  await sendContractorNewLeadAvailable(sub.email, {
                    id: lead.id,
                    name: lead.name,
                    email: lead.email,
                    phone: lead.phone || "",
                    city: lead.city,
                    serviceType: lead.serviceType,
                    finalQuote: lead.finalQuote || "0",
                    address: lead.address || undefined,
                    currentLeadPrice: declinedLead.currentLeadPrice,
                    propertyType: lead.propertyType,
                    frequency: lead.frequency || undefined,
                    selectedServices: (lead.selectedServices as any) ?? undefined,
                    lineItems: (lead.lineItems as any) ?? undefined,
                    serviceData: (lead.serviceData as any) ?? undefined,
                    message: lead.message || undefined,
                  });
                  // Space out emails to avoid rate limits
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
              }
            } catch (emailError) {
              console.error(`[CRON] Failed to send contractor emails for auto-declined lead ${lead.id}:`, emailError);
              // Don't fail the process if email fails
            }
          }
        } catch (error) {
          console.error(`[CRON] Error auto-declining lead ${lead.id}:`, error);
          // Continue with other leads even if one fails
        }
      }
    }
    
    console.log(`[CRON] Auto-decline complete. Declined ${declinedCount} leads.`);
    return { success: true, declined: declinedCount };
  } catch (error) {
    console.error("[CRON] Error during auto-decline:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Schedule auto-decline to run every hour
export function scheduleAutoDecline() {
  const ONE_HOUR = 60 * 60 * 1000;
  
  // Run immediately on startup
  runAutoDeclinePendingLeads();
  
  // Then run every hour
  setInterval(runAutoDeclinePendingLeads, ONE_HOUR);
  
  console.log("[CRON] Auto-decline interval started (runs every hour)");
}
