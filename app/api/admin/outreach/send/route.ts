import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { processOutreachBatch } from "@/lib/outreach/sender";

const bodySchema = z.object({
  limit: z.number().int().min(1).max(5).optional(),
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  const limit = parsed.success ? parsed.data.limit ?? 1 : 1;

  // Manual admin send respects the master on/off switch (owner can pause all
  // sends instantly), plus dry-run, the rolling daily cap, and suppression.
  const result = await processOutreachBatch({ limit, respectGap: false, source: "manual" });

  return NextResponse.json(result);
}
