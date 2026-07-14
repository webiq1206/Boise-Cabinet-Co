/**
 * Enrichment pass: find a recipient email for outreach opportunities that don't
 * have one yet. Runs politely with a per-run cap. Schedule after cycle.ts so new
 * opportunities get a contact before you approve them.
 *
 *   npx tsx backlink-engine/enrich-contacts.ts
 */

import { discoverContact } from "./contacts";
import { loadState, saveState } from "./store";

const CAP = 25; // be polite: bound external fetches per run

async function main() {
  const now = new Date().toISOString();
  const state = loadState();

  const targets = state.opportunities
    .filter(
      (o) =>
        o.automation !== "auto" &&
        !o.contact?.email &&
        !["won", "rejected", "lost"].includes(o.status),
    )
    .sort((a, b) => b.score.score - a.score.score)
    .slice(0, CAP);

  if (targets.length === 0) {
    console.log("No outreach opportunities need contact discovery.");
    return;
  }

  console.log(`Discovering contacts for ${targets.length} opportunit(ies):`);
  for (const o of targets) {
    const news = o.category === "local-news" || o.category === "digital-pr";
    const c = await discoverContact(o.domain, { news });
    o.contact = { ...(o.contact ?? {}), email: c.email, url: c.contactUrl };
    o.lastUpdated = now;
    o.history.push({ at: now, event: `Contact ${c.confidence}: ${c.email ?? "none"} (${c.source})` });
    console.log(`  ${o.domain.padEnd(24)} -> ${c.email ?? "none"} (${c.confidence})`);
  }

  saveState(state, now);
  console.log("Done. Drafts now dispatch to the discovered address.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
