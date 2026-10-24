import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { db } from "@/lib/db";
import { consultationRequests, submissions } from "@/shared/schema";

export class ConsultationReplayConflict extends Error {}
export const CONSULTATION_KEY = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]]));
    }
    return item;
  });
}
/** Existing PKs serialize concurrent attempts. Raw record and request commit together.
 * No provider runs in this transaction. Replays never claim notification delivery.
 * Unkeyed legacy callers remain separate inquiries; no contact/scope deduplication. */
export async function saveConsultationOnce(
  database: NonNullable<typeof db>, key: string | null, payload: Record<string, unknown>,
  request: Omit<typeof consultationRequests.$inferInsert, "id">,
): Promise<{ requestId: string; replayed: boolean }> {
  const requestId = key ? `consultation:${key.toLowerCase()}` : randomUUID();
  return database.transaction(async tx => {
    const inserted = await tx.insert(submissions).values({
      id: requestId, formType: "consultation", rawPayload: payload,
      sourcePage: payload.source === "assistant" ? "/assistant" : "/consultation",
    }).onConflictDoNothing({ target: submissions.id }).returning({ id: submissions.id });
    if (!inserted.length) {
      const [prior] = await tx.select({ payload: submissions.rawPayload })
        .from(submissions).where(eq(submissions.id, requestId)).limit(1);
      if (!prior || canonical(prior.payload) !== canonical(payload)) {
        throw new ConsultationReplayConflict("Request key already used for different content");
      }
      const [saved] = await tx.select({ id: consultationRequests.id })
        .from(consultationRequests).where(eq(consultationRequests.id, requestId)).limit(1);
      if (!saved) throw new Error("Replay receipt has no durable consultation request");
      return { requestId: saved.id, replayed: true };
    }
    const [saved] = await tx.insert(consultationRequests).values({ ...request, id: requestId })
      .returning({ id: consultationRequests.id });
    if (!saved) throw new Error("Request persistence was not acknowledged");
    return { requestId: saved.id, replayed: false };
  }, { isolationLevel: "read committed" });
}
