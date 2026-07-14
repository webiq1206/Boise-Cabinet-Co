/**
 * Dispatch approved items. Run after a human approves in the dashboard (or on a
 * schedule that trails the approval queue):
 *
 *   npx tsx backlink-engine/dispatch.ts
 *
 * Only touches items a human moved to "actioned". Outreach categories are
 * emailed (dry-run unless BACKLINK_SEND_LIVE=true + RESEND_API_KEY); auto
 * directory/review categories get a submission payload prepared for a human to
 * complete. Nothing here creates accounts, solves CAPTCHAs, or submits forms.
 */

import { sendOutreach } from "./sender";
import { prepareSubmission } from "./submitter";
import { loadState, saveState } from "./store";
import type { Opportunity } from "./types";

async function dispatchOne(opp: Opportunity, now: string): Promise<string> {
  if (opp.automation === "auto") {
    const prep = prepareSubmission(opp);
    opp.dispatchMode = "submission-prep";
    opp.dispatchedAt = now;
    opp.history.push({ at: now, event: `Submission payload prepared for ${prep.targetUrl}` });
    return `prep     ${opp.domain} (human completes the listing)`;
  }
  const r = await sendOutreach(opp);
  opp.dispatchMode = "email";
  opp.dispatchedAt = now;
  opp.history.push({ at: now, event: `Outreach ${r.mode}: ${r.detail}` });
  return `${r.mode.padEnd(8)} ${opp.domain} — ${r.detail}`;
}

async function main() {
  const now = new Date().toISOString();
  const state = loadState();
  const pending = state.opportunities.filter((o) => o.status === "actioned" && !o.dispatchedAt);
  if (pending.length === 0) {
    console.log("Nothing approved is awaiting dispatch.");
    return;
  }
  console.log(`Dispatching ${pending.length} approved item(s):`);
  for (const o of pending) console.log("  " + (await dispatchOne(o, now)));
  saveState(state, now);
  console.log("Done. Items stay 'actioned' until monitoring detects the link live -> 'won'.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
