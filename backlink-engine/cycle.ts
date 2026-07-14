/**
 * One autonomous acquisition cycle:
 *   1. Snapshot our + competitors' authority (velocity tracking).
 *   2. Mine each competitor's referring domains + broken backlinks.
 *   3. Seed known-good targets (directories, associations, review platforms).
 *   4. Qualify + score every candidate; disqualify denylist/spam/off-topic.
 *   5. Classify survivors into a play, draft outreach, queue for approval.
 *   6. Persist the pipeline and print a ranked report.
 *
 * Run on Replit:  npx tsx backlink-engine/cycle.ts
 * Report only  :  npx tsx backlink-engine/cycle.ts --report
 *
 * Schedule it (Replit "Scheduled Deployment" or cron) daily/weekly. The engine
 * itself never sends anything: assisted/manual items wait in awaiting_approval
 * for one-tap human sign-off; only AUTO_SUBMIT categories are flagged for
 * hands-off submission by the (separate, credential-gated) submitter.
 */

import { AhrefsClient } from "./ahrefs";
import { classify } from "./classify";
import { COMPETITORS, SEED_TARGETS, SITE } from "./config";
import { draftOutreach } from "./outreach";
import { scoreCandidate } from "./scoring";
import { idFor, loadState, saveState, upsertOpportunity } from "./store";
import type { CandidateMetrics, Opportunity, PipelineState } from "./types";

async function runCycle(now: string): Promise<PipelineState> {
  const state = loadState();
  const client = new AhrefsClient();

  // 1. Authority snapshot (us + competitors) for velocity tracking.
  const domains = [SITE.domain, ...COMPETITORS.map((c) => c.domain)];
  const snap = await client.batchAnalysis(domains);
  state.authoritySnapshots.push({
    at: now,
    metrics: Object.fromEntries(
      snap.map((t) => [
        t.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
        { dr: t.domain_rating, refdomains: t.refdomains, traffic: t.org_traffic },
      ]),
    ),
  });
  // keep last 52 snapshots (~1 year weekly)
  state.authoritySnapshots = state.authoritySnapshots.slice(-52);

  // 2 + 3. Gather candidates: competitor referring domains + seeds.
  const candidates: { m: CandidateMetrics; sources: string[] }[] = [];
  for (const c of COMPETITORS) {
    try {
      const refs = await client.referringDomains(c.domain, 10, 100);
      for (const m of refs) candidates.push({ m, sources: [c.domain] });
      const broken = await client.brokenBacklinks(c.domain, 30);
      for (const m of broken) candidates.push({ m, sources: [`${c.domain} (broken)`] });
    } catch (e) {
      console.warn(`  ! ${c.domain}: ${(e as Error).message}`);
    }
  }
  // Seed targets enter as pre-vetted candidates (metrics filled on next enrich).
  for (const s of SEED_TARGETS) {
    candidates.push({
      m: { domain: s.domain, domainRating: 60, trafficDomain: 5000, dofollowLinks: 1, linksToTarget: 1, isSpam: false },
      sources: ["seed"],
    });
  }

  // Merge duplicate domains, unioning sources.
  const byDomain = new Map<string, { m: CandidateMetrics; sources: string[] }>();
  for (const c of candidates) {
    const key = c.m.domain.toLowerCase();
    const prev = byDomain.get(key);
    if (prev) prev.sources = Array.from(new Set([...prev.sources, ...c.sources]));
    else byDomain.set(key, c);
  }

  // 4 + 5. Qualify, classify, draft, upsert.
  const seedDomains = new Set(SEED_TARGETS.map((s) => s.domain.toLowerCase()));
  let added = 0;
  let disqualified = 0;
  for (const { m, sources } of byDomain.values()) {
    if (m.domain.toLowerCase().includes(SITE.domain)) continue; // never target ourselves
    const { category, automation, recommendedPlay } = classify(m);
    const score = scoreCandidate(m, {
      category,
      allowlisted: seedDomains.has(m.domain.toLowerCase()),
    });
    if (score.disqualified) {
      disqualified++;
      continue;
    }
    const opp: Opportunity = {
      id: idFor(m.domain),
      domain: m.domain,
      category,
      automation,
      metrics: m,
      score,
      sources,
      recommendedPlay,
      status: automation === "auto" ? "queued" : "awaiting_approval",
      firstDiscovered: now,
      lastUpdated: now,
      history: [],
    };
    opp.outreachDraft = draftOutreach(opp);
    if (upsertOpportunity(state, opp, now) === "new") added++;
  }

  saveState(state, now);
  console.log(`\nCycle complete: +${added} new, ${disqualified} disqualified, ${state.opportunities.length} in pipeline.`);
  return state;
}

function report(state: PipelineState): void {
  const active = state.opportunities
    .filter((o) => !["won", "rejected", "lost"].includes(o.status))
    .sort((a, b) => b.score.score - a.score.score);
  console.log(`\n=== Backlink pipeline for ${state.target} (${active.length} active) ===`);
  for (const o of active.slice(0, 25)) {
    console.log(
      `  [${o.score.tier}] ${o.score.score.toString().padStart(3)} | ${o.category.padEnd(20)} | ${o.automation.padEnd(8)} | ${o.domain}`,
    );
    console.log(`        -> ${o.recommendedPlay}`);
  }
}

async function main() {
  const now = new Date().toISOString();
  const reportOnly = process.argv.includes("--report");
  const state = reportOnly ? loadState() : await runCycle(now);
  report(state);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
