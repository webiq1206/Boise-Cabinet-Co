import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { arModels } from "@/shared/schema";

export const runtime = "nodejs";

// ~24MB cap per base64 model blob to avoid unbounded storage abuse.
const MAX_MODEL_CHARS = 24 * 1024 * 1024;

const createSchema = z.object({
  glb: z.string().min(1).max(MAX_MODEL_CHARS, "Model is too large."), // base64-encoded GLB
  usdz: z.string().min(1).max(MAX_MODEL_CHARS, "Model is too large."), // base64-encoded USDZ
  name: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    if (!db) {
      return NextResponse.json(
        { error: "AR hosting is unavailable right now." },
        { status: 503 },
      );
    }

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
