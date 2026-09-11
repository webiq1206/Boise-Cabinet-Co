import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads, quotes } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { recordLeadActivity, actorNameFromUser } from "@/server/services/leadActivity";

export async function POST(request: Request, props: { params: Promise<{ leadId: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { leadId } = params;

  const result = await db.select().from(leads).where(eq(leads.id, leadId));
  const lead = result[0];
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  if (lead.status === "accepted") return NextResponse.json({ error: "Lead is already accepted" }, { status: 400 });
  if (lead.projectId) return NextResponse.json({ error: "Lead is already converted to a project" }, { status: 400 });

  await db.update(leads).set({
    status: "accepted",
    adminReviewedBy: session.userId,
    adminReviewedAt: new Date(),
    adminDeclined: false,
  }).where(eq(leads.id, leadId));

  const updated = await db.select().from(leads).where(eq(leads.id, leadId));

  const actorName = actorNameFromUser(user);
  await recordLeadActivity({
    leadId,
    type: "accepted",
    message: "Lead accepted",
    detail: { from: lead.status, to: "accepted" },
    actorId: user.id,
    actorName,
  });

  let customerStatus: "contact_soon" | "quote_ready" = "contact_soon";
  try {
    const body = await request.json();
    if (body?.customerStatus === "quote_ready") {
      customerStatus = "quote_ready";
    }
  } catch {
    // No body, default status
  }

  try {
    if (lead.quoteId) {
      const quoteResult = await db.select().from(quotes).where(eq(quotes.id, lead.quoteId));
      const quote = quoteResult[0];
      if (quote) {
        const { sendCustomerStatusUpdate } = await import("@/server/services/emailNotifications");
        const message =
          customerStatus === "quote_ready"
            ? "Your customized quote is ready to review. Click below to view your quote status and next steps."
            : "Your quote has been reviewed and we'll be contacting you shortly to discuss the details.";
        const emailSubject =
          customerStatus === "quote_ready" ? "Your quote is ready" : "We received your request";
        sendCustomerStatusUpdate(quote.email, quote.id, {
          status: customerStatus,
          message,
        })
          .then(() => {
            recordLeadActivity({
              leadId,
              type: "email_sent",
              message: `Email sent to customer: ${emailSubject}`,
              detail: { to: quote.email, subject: emailSubject, status: customerStatus },
              actorId: user.id,
              actorName,
            });
          })
          .catch(() => {});
      }
    }
  } catch (e) {}

  return NextResponse.json(updated[0]);
}
