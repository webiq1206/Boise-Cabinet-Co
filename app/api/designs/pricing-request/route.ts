import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { designPricingRequests, cabinetDesigns } from "@/shared/schema";
import { eq } from "drizzle-orm";

const pricingRequestSchema = z.object({
  designId: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  message: z.string().optional(),
  roomType: z.string().optional(),
  collectionId: z.string().optional(),
  styleJson: z.record(z.unknown()).optional(),
  layoutSummary: z.record(z.unknown()).optional(),
  /** Plain-English recap of the homeowner's full selections (door, finish, cabinets, accessories). */
  selectionsSummary: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = pricingRequestSchema.parse(body);

    if (!db) {
      return NextResponse.json({ success: true, id: "local-request" });
    }

    const [pricingRequest] = await db
      .insert(designPricingRequests)
      .values({
        designId: data.designId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: [
          data.message,
          data.selectionsSummary
            ? `[Selections]\n${data.selectionsSummary}`
            : null,
          data.layoutSummary
            ? `[Layout summary, planning only]\n${JSON.stringify(data.layoutSummary, null, 2)}`
            : null,
        ]
          .filter(Boolean)
          .join("\n\n") || undefined,
        status: "pending",
      })
      .returning();

    if (data.designId) {
      await db
        .update(cabinetDesigns)
        .set({ status: "submitted", updatedAt: new Date() })
        .where(eq(cabinetDesigns.id, data.designId));
    }

    return NextResponse.json({ success: true, id: pricingRequest.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Pricing request error:", error);
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
