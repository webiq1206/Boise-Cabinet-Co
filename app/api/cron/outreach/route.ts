import { NextRequest, NextResponse } from "next/server";
import { getSession, getUserFromDb } from "@/lib/auth";
import { processSendingTick, type TickReason } from "@/server/services/sendingEngine";

export const dynamic = "force-dynamic";

// Authorize either via the CRON_SECRET (for the scheduled deployment / external
// cron) or via an admin session (for the "Send next now" button in the
// dashboard). The secret is a shared env var so it is present in dev + prod.
// Secret is only accepted from request headers — never the query string — to
// avoid leaking it through logs, referrers, or browser history.
async function isAuthorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const headerSecret = req.headers.get("x-cron-secret") ?? "";
    const authHeader = req.headers.get("authorization") ?? "";
    const bearer = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";
    if (headerSecret === secret || bearer === secret) {
      return true;
    }
  }
  try {
    const session = await getSession();
    if (session.userId) {
      const user = await getUserFromDb(session.userId);
      if (user && user.role === "admin") return true;
    }
  } catch {
    // ignore — fall through to unauthorized
  }
  return false;
}

// Drains due jobs. The send engine enforces the daily cap and the minimum gap
// between real sends, so in live mode this delivers at most one email per call
// (the next reservation returns "throttled" until the gap elapses). In dry-run
// mode the engine bypasses the gap/cap, so we stop after a single simulated tick
// to avoid mass-consuming the queue while no real mail goes out.
async function drain(maxIterations = 50): Promise<{
  sent: number;
  simulated: number;
  reasons: Partial<Record<TickReason, number>>;
  lastReason: TickReason | null;
}> {
  const reasons: Partial<Record<TickReason, number>> = {};
  let sent = 0;
  let simulated = 0;
  let lastReason: TickReason | null = null;
  for (let i = 0; i < maxIterations; i++) {
    const reason = await processSendingTick();
    lastReason = reason;
    reasons[reason] = (reasons[reason] ?? 0) + 1;
    if (reason === "sent") {
      sent++;
      continue;
    }
    if (reason === "dry_run") {
      simulated++;
    }
    break;
  }
  return { sent, simulated, reasons, lastReason };
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await drain();
  return NextResponse.json({ ok: true, ...result });
}
