import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultationRequests } from "@/shared/schema";
import { getUncachableResendClient } from "@/server/resend";

const bodySchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email(),
  zip: z.string().min(5),
  projectType: z.string().min(1),
  message: z.string().optional(),
  estimate: z
    .object({
      project: z.string(),
      finish: z.string(),
      priceLow: z.number(),
      priceHigh: z.number(),
      roi: z.number(),
    })
    .optional()
    .nullable(),
});

const ADMIN_EMAIL = "hello@boiseremodeling.co";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://boiseremodeling.co";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Persist to database if available
    if (db) {
      try {
        await db.insert(consultationRequests).values({
          name: data.name,
          phone: data.phone,
          email: data.email,
          zip: data.zip,
          projectType: data.projectType,
          message: data.message || null,
          estimateProject: data.estimate?.project || null,
          estimateFinish: data.estimate?.finish || null,
          estimateLow: data.estimate?.priceLow?.toString() || null,
          estimateHigh: data.estimate?.priceHigh?.toString() || null,
        });
      } catch (dbErr) {
        console.error("[consultation] DB insert failed:", dbErr);
        // Continue to send emails even if DB fails
      }
    }

    // Send emails
    try {
      const { client, fromEmail } = await getUncachableResendClient();

      const estimateHtml = data.estimate
        ? `<p><strong>Calculator estimate:</strong> ${data.estimate.project} (${data.estimate.finish}) — $${Math.round(data.estimate.priceLow / 1000)}k – $${Math.round(data.estimate.priceHigh / 1000)}k</p>`
        : "";

      // Admin notification
      await client.emails.send({
        from: `Boise Remodeling Co <${fromEmail}>`,
        to: ADMIN_EMAIL,
        subject: `New consultation request — ${data.name}`,
        html: `
          <h2>New consultation request</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>ZIP:</strong> ${data.zip}</p>
          <p><strong>Project:</strong> ${data.projectType}</p>
          ${estimateHtml}
          <p><strong>Message:</strong> ${data.message || "(none)"}</p>
          <p style="margin-top:16px;font-size:12px;color:#888;">Submitted via ${SITE_URL}</p>
        `,
      });

      // Customer confirmation
      await client.emails.send({
        from: `Boise Remodeling Co <${fromEmail}>`,
        to: data.email,
        subject: "We received your request — Boise Remodeling Co",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
            <h2 style="font-size:22px;color:#1a1208;">Thanks, ${data.name}!</h2>
            <p style="color:#5a5040;">We received your consultation request and will reach out within one business day to schedule your free in-home visit.</p>
            <p style="color:#5a5040;">In the meantime, feel free to call us at (208) 555-0100 or reply to this email with any questions.</p>
            <p style="margin-top:32px;color:#5a5040;">— The Boise Remodeling Co team</p>
            <p style="font-size:12px;color:#aaa;margin-top:16px;">${SITE_URL}</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[consultation] Email send failed:", emailErr);
      // Don't fail the request just because email failed
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[consultation] Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
