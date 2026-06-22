import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { processOutreachBatch } from "@/lib/outreach/sender";

export async function POST() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  // Manual admin "send next" dispatches exactly ONE message per run and is
  // subject to the same non-bypassable throttle as the automated path: the
  // master on/off switch, dry-run, rolling daily cap, minimum gap between
  // sends, in-flight guard, and suppression. There is intentionally no way to
  // burst-send a batch from the UI.
  const result = await processOutreachBatch({ limit: 1, source: "manual" });

  return NextResponse.json(result);
}
