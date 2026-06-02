import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { cabinetDesigns, designPricingRequests } from "@/shared/schema";
import { randomBytes } from "crypto";

const createDesignSchema = z.object({
  roomType: z.string().min(1),
  collectionId: z.string().min(1),
  layoutJson: z.record(z.unknown()).optional(),
  styleJson: z.record(z.unknown()).optional(),
  photoUrl: z.string().optional(),
  name: z.string().optional(),
  userEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createDesignSchema.parse(body);

    const shareToken = randomBytes(16).toString("hex");

    if (!db) {
      return NextResponse.json({
        id: `local-${shareToken.slice(0, 8)}`,
        shareToken,
        ...data,
      });
    }

    const [design] = await db
      .insert(cabinetDesigns)
      .values({
        roomType: data.roomType,
        collectionId: data.collectionId,
        layoutJson: data.layoutJson ?? {},
        styleJson: data.styleJson ?? {},
        photoUrl: data.photoUrl,
        name: data.name,
        userEmail: data.userEmail,
        shareToken,
        status: "draft",
      })
      .returning();

    return NextResponse.json(design);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create design error:", error);
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const shareToken = request.nextUrl.searchParams.get("shareToken");
  if (!shareToken) {
    return NextResponse.json({ error: "shareToken required" }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  }

  const results = await db
    .select()
    .from(cabinetDesigns)
    .where(eq(cabinetDesigns.shareToken, shareToken))
    .limit(1);

  const design = results[0];
  if (!design) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  return NextResponse.json(design);
}
