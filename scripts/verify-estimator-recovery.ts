/**
 * Exercises partial-completion tracking end to end against an in-process
 * Postgres (pglite) and a capturing mailer, so completion and callback
 * semantics are proven without Neon or Resend:
 *
 *   1. partial-completion staff emails are hard-off
 *   2. an un-engaged session never emails and is not closed by the idle sweep
 *   3. an engaged idle session expires with no mail, including when the mailer throws
 *   4. a second sweep does not revisit that session
 *   5. a later completion is stored as completed
 *   6. a completion before the sweep is never emailed and cannot be downgraded
 *   7. sensitive selection keys are dropped and query strings are stripped
 *   8. a callback request emails once, a retry does not send again, and the
 *      abandonment sweep does not expire or email that session
 *   9. a failed callback send is retried on the next request and sends once
 *
 * Run: npm run verify:estimator-recovery
 */
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import * as schema from "../shared/schema";
import {
  ABANDONMENT_EMAILS_ENABLED,
  INACTIVITY_MS,
  installEstimatorSessionsTestAdapter,
  recordCallbackRequest,
  recordProgress,
  sweepAbandonedSessions,
} from "../server/services/estimatorSessions";

async function main() {
  const pg = new PGlite();
  const db = drizzle(pg, { schema });
  const sent: Array<{ subject: string; html: string }> = [];
  let failNext = 0;
  installEstimatorSessionsTestAdapter({
    // The service is typed against the neon-http client; both expose the same
    // query builder surface, which is all the service uses.
    db: db as unknown as never,
    mailer: async (email) => {
      if (failNext > 0) { failNext -= 1; throw new Error("simulated mailer outage"); }
      sent.push(email);
    },
  });

  const t0 = new Date("2026-09-08T10:00:00Z");
  const later = (ms: number) => new Date(t0.getTime() + ms);
  const idle = INACTIVITY_MS + 5 * 60_000;
  const { estimatorSessions } = schema;
  const partialMail = () => sent.filter((email) => /\[Partial\]|Partial completion/.test(`${email.subject}\n${email.html}`));

  // 1. Kill switch is hard-off. No environment variable can turn it back on.
  assert.equal(ABANDONMENT_EMAILS_ENABLED, false, "partial-completion staff emails stay disabled");

  // 2. Not engaged: first step, a few seconds in. Still active, no mail.
  await recordProgress({ sessionId: "aaaaaaaa-0000-4000-8000-000000000001", flow: "estimate", currentStep: "project", currentStepIndex: 0, totalSteps: 9, startedAt: t0.getTime() }, t0);
  let r = await sweepAbandonedSessions({ now: later(idle) });
  assert.equal(r.sent, 0, "un-engaged session must not email");
  let row = (await db.select().from(estimatorSessions).where(eq(estimatorSessions.id, "aaaaaaaa-0000-4000-8000-000000000001")))[0];
  assert.equal(row.status, "active");

  // 3. Engaged and idle: expire the row, never call the mailer, even if it would throw.
  await recordProgress({
    sessionId: "aaaaaaaa-0000-4000-8000-000000000002", flow: "estimate", currentStep: "size", currentStepIndex: 3, totalSteps: 9,
    lastCompletedStep: "layout", startedAt: t0.getTime(), pagePath: "/estimate?gclid=secret&utm_source=x",
    selections: { project: "kitchen", sqft: 180, email: "leak@example.com", contact_phone: "2085551234", finish: "mid-range" },
    validationErrors: ["address_required"],
  }, later(120_000));
  failNext = 3;
  r = await sweepAbandonedSessions({ now: later(idle) });
  assert.equal(r.sent, 0, "engaged idle session must not send a partial email");
  assert.equal(r.failed, 0, "a disabled partial email is not a failed send");
  assert.equal(failNext, 3, "the mailer is not invoked for a drop-off");
  assert.equal(partialMail().length, 0);
  row = (await db.select().from(estimatorSessions).where(eq(estimatorSessions.id, "aaaaaaaa-0000-4000-8000-000000000002")))[0];
  assert.equal(row.status, "expired");
  assert.equal(row.notifiedAt, null);
  assert.equal(row.notifyAttemptCount, 0);
  assert.equal(row.pagePath, "/estimate");
  assert.equal("email" in (row.selections as object), false);
  assert.equal("contact_phone" in (row.selections as object), false);
  assert.equal((row.selections as { project?: string }).project, "kitchen");

  // 4. Second sweep: the expired drop-off is not selected again.
  r = await sweepAbandonedSessions({ now: later(idle + 600_000) });
  assert.equal(r.sent, 0, "no partial email on a later sweep");
  assert.equal(r.considered, 0, "an expired drop-off is not swept again");

  // 5. Completion after the session was closed: stored as completed, still no partial mail.
  await recordProgress({ sessionId: "aaaaaaaa-0000-4000-8000-000000000002", flow: "estimate", currentStep: "result", currentStepIndex: 9, totalSteps: 9, status: "completed" }, later(idle + 700_000));
  row = (await db.select().from(estimatorSessions).where(eq(estimatorSessions.id, "aaaaaaaa-0000-4000-8000-000000000002")))[0];
  assert.equal(row.status, "completed");
  assert.equal(row.completionPercent, 100);

  // 6. Completion before the sweep: never emailed, and a late beacon cannot downgrade it.
  await recordProgress({ sessionId: "aaaaaaaa-0000-4000-8000-000000000003", flow: "re10", currentStep: "contact", currentStepIndex: 2, totalSteps: 5, startedAt: t0.getTime() }, later(60_000));
  await recordProgress({ sessionId: "aaaaaaaa-0000-4000-8000-000000000003", flow: "re10", currentStep: "result", currentStepIndex: 4, totalSteps: 5, status: "completed" }, later(120_000));
  r = await sweepAbandonedSessions({ now: later(idle + 900_000) });
  assert.equal(r.sent, 0, "completed sessions are never emailed");
  await recordProgress({ sessionId: "aaaaaaaa-0000-4000-8000-000000000003", flow: "re10", currentStep: "contact", currentStepIndex: 2, totalSteps: 5 }, later(130_000));
  row = (await db.select().from(estimatorSessions).where(eq(estimatorSessions.id, "aaaaaaaa-0000-4000-8000-000000000003")))[0];
  assert.equal(row.status, "completed");

  // 7. Callback: one real-lead email, retry does not duplicate, sweep leaves the session alone.
  failNext = 0;
  await recordProgress({ sessionId: "aaaaaaaa-0000-4000-8000-000000000004", flow: "plans", currentStep: "measure", currentStepIndex: 1, totalSteps: 4, startedAt: t0.getTime() }, later(30_000));
  let cb = await recordCallbackRequest({ sessionId: "aaaaaaaa-0000-4000-8000-000000000004", flow: "plans", phone: "(208) 555-0100", name: "Test Caller" }, later(40_000));
  assert.equal(cb.notified, true);
  assert.equal(sent.length, 1);
  assert.match(sent[0].subject, /^Callback requested: Test Caller, \(208\) 555-0100/);
  assert.equal(partialMail().length, 0);
  cb = await recordCallbackRequest({ sessionId: "aaaaaaaa-0000-4000-8000-000000000004", flow: "plans", phone: "2085550100" }, later(41_000));
  assert.equal(cb.notified, false, "a retried callback request does not send twice");
  assert.equal(sent.length, 1);
  r = await sweepAbandonedSessions({ now: later(idle + 2_000_000) });
  assert.equal(r.sent, 0, "a callback session is excluded from the abandonment sweep");
  assert.equal(sent.length, 1, "the sweep does not send a partial email for a callback session");
  row = (await db.select().from(estimatorSessions).where(eq(estimatorSessions.id, "aaaaaaaa-0000-4000-8000-000000000004")))[0];
  assert.equal(row.status, "active");
  assert.equal(row.requestedCallback, true);
  assert.ok(row.callbackNotifiedAt, "callback notification claim stays set");

  // Explicit estimator-exit callbacks freeze their first phone and share the existing claim.
  failNext = 0;
  const beforeExit = sent.length;
  const exitRequest = {sessionId: "aaaaaaaa-0000-4000-8000-000000000007", flow: "p5-exit", phone: "2085550100", note: "Explicit callback consent; no marketing."};
  await Promise.all([recordCallbackRequest(exitRequest), recordCallbackRequest(exitRequest)]);
  assert.equal(sent.length, beforeExit + 1, "concurrent callback retries send once");
  const conflict = await recordCallbackRequest({...exitRequest, phone: "2085550101"});
  assert.equal(conflict.error, "callback_conflict");
  assert.equal(conflict.stored, false);
  row = (await db.select().from(estimatorSessions).where(eq(estimatorSessions.id, exitRequest.sessionId)))[0];
  assert.equal(row.contactPhone, "2085550100", "retry cannot change an already-requested number");
  failNext = 1;
  const retryRequest = {...exitRequest, sessionId: "aaaaaaaa-0000-4000-8000-000000000008"};
  const failedCallback = await recordCallbackRequest(retryRequest);
  assert.equal(failedCallback.stored, true);
  assert.equal(failedCallback.notified, false);
  assert.equal((await recordCallbackRequest(retryRequest)).notified, true);
  assert.equal(sent.length, beforeExit + 2);

  console.log(`verify-estimator-recovery: all checks passed (${sent.length} emails captured)`);
  await pg.close();
}

main().catch((error) => {
  console.error("verify-estimator-recovery FAILED:", error);
  process.exit(1);
});
