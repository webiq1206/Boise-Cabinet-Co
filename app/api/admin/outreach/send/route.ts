import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/outreach/requireAdmin";
import { processOutreachBatch } from "@/lib/outreach/sender";

export async function POST() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  // Manual admin "send next" dispatches up to the admin-chosen batch size per
  // run. Every single message still passes through the same non-bypassable
  // throttle as the automated path: the master on/off switch, dry-run, rolling
  // daily cap, minimum gap between sends, in-flight guard, and suppression. The
  // batch size only caps how many the run attempts; it can never burst past the
  // throttle (the per-send advisory-locked reservation stops it early).
  const result = await processOutreachBatch({ source: "manual" });

  return NextResponse.json(result);
}
