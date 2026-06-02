import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { arModels } from "@/shared/schema";
import { purgeExpiredArModels } from "@/lib/db/arModels";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

export const runtime = "nodejs";

// ~24MB cap per base64 model blob to avoid unbounded storage abuse.
const MAX_MODEL_CHARS = 24 * 1024 * 1024;

// Per-IP cap on uploads to prevent storage-churn abuse.
const PER_IP_LIMIT = 20;
const PER_IP_WINDOW_MS = 10 * 60 * 1000; // 20 uploads / 10 min per IP

const createSchema = z.object({
  glb: z.string().min(1).max(MAX_MODEL_CHARS, "Model is too large."), // base64-encoded GLB
  usdz: z.string().min(1).max(MAX_MODEL_CHARS, "Model is too large."), // base64-encoded USDZ
  name: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const perIp = rateLimit(`ar-models:${ip}`, PER_IP_LIMIT, PER_IP_WINDOW_MS);
    if (!perIp.ok) {
      return NextResponse.json(
        { error: "Too many AR previews created. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(perIp.retryAfter) } },
      );
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    if (!db) {
      return NextResponse.json(
        { error: "AR hosting is unavailable right now." },
        { status: 503 },
      );
    }

    // Opportunistically clean up old previews so the table doesn't grow forever.
    await purgeExpiredArModels();

    const [row] = await db
      .insert(arModels)
      .values({ glb: data.glb, usdz: data.usdz, name: data.name })
      .returning({ id: arModels.id });

    return NextResponse.json({ id: row.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create AR model error:", error);
    return NextResponse.json(
      { error: "Failed to prepare the AR model." },
      { status: 500 },
    );
  }
}
