import { getSession, getUserFromDb } from "@/lib/auth";
import { db } from "@/lib/db";
import { leads } from "@/shared/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  actorNameFromUser,
  buildLeadTimeline,
  recordLeadActivity,
} from "@/server/services/leadActivity";

export async function GET(_request: Request, { params }: { params: { leadId: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { leadId } = params;
  const result = await db.select().from(leads).where(eq(leads.id, leadId));
  const lead = result[0];
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const timeline = await buildLeadTimeline(lead);
  return NextResponse.json(timeline);
}

const CONTACT_CHANNELS = ["called", "texted", "voicemail"] as const;

const postSchema = z.object({
  channel: z.enum(CONTACT_CHANNELS),
  text: z.string().max(2000).optional(),
});

const CHANNEL_LABEL: Record<(typeof CONTACT_CHANNELS)[number], string> = {
  called: "Called the customer",
  texted: "Texted the customer",
  voicemail: "Left a voicemail",
};

export async function POST(request: Request, { params }: { params: { leadId: string } }) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await getUserFromDb(session.userId);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { leadId } = params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let parsed;
  try {
    parsed = postSchema.parse(body);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors[0]?.message || "Validation error" }, { status: 400 });
    }
    throw e;
  }

  const result = await db.select().from(leads).where(eq(leads.id, leadId));
  const lead = result[0];
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const note = parsed.text?.trim();
  const message = note ? `${CHANNEL_LABEL[parsed.channel]}: ${note}` : CHANNEL_LABEL[parsed.channel];

  const activity = await recordLeadActivity({
    leadId,
    type: "contact_attempt",
    message,
    detail: { channel: parsed.channel, note: note || null },
    actorId: user.id,
    actorName: actorNameFromUser(user),
  });

  // This endpoint exists solely to persist the timeline event, so a failed
  // insert must surface as an error rather than a false success.
  if (!activity) {
    return NextResponse.json({ error: "Failed to record activity" }, { status: 500 });
  }

  return NextResponse.json(activity, { status: 201 });
}
