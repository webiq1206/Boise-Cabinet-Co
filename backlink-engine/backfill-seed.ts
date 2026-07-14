/**
 * Offline seed/backfill: runs the REAL referring-domain data captured from
 * competitor profiles on 2026-07-14 through the live scoring + classification
 * chain, then writes the pipeline. Lets us validate the engine and populate the
 * pipeline before AHREFS_API_KEY is wired into Replit Secrets.
 *
 *   npx tsx backlink-engine/backfill-seed.ts
 */

import { classify } from "./classify";
import { SEED_TARGETS, SITE } from "./config";
import { draftOutreach } from "./outreach";
import { scoreCandidate } from "./scoring";
import { idFor, loadState, saveState, upsertOpportunity } from "./store";
import type { CandidateMetrics, Opportunity } from "./types";

// Real subset from premiumcabinets.com referring domains (Ahrefs, 2026-07-14),
// spanning the full quality spectrum so we can see qualify vs. disqualify.
const REAL: CandidateMetrics[] = [
  { domain: "squarespace.com", domainRating: 95, trafficDomain: 3217058, dofollowLinks: 4, linksToTarget: 4, isSpam: false },
  { domain: "blogspot.com", domainRating: 95, trafficDomain: 23232608, dofollowLinks: 16291, linksToTarget: 16316, isSpam: false },
  { domain: "amazonaws.com", domainRating: 95, trafficDomain: 1607028, dofollowLinks: 2, linksToTarget: 4, isSpam: false },
  { domain: "netlify.app", domainRating: 92, trafficDomain: 3162457, dofollowLinks: 9, linksToTarget: 9, isSpam: false },
  { domain: "prnewswire.com", domainRating: 92, trafficDomain: 1164861, dofollowLinks: 2, linksToTarget: 2, isSpam: false },
  { domain: "expertise.com", domainRating: 88, trafficDomain: 15441, dofollowLinks: 5, linksToTarget: 5, isSpam: false },
  { domain: "birdeye.com", domainRating: 85, trafficDomain: 572476, dofollowLinks: 10, linksToTarget: 38, isSpam: false },
  { domain: "alignable.com", domainRating: 84, trafficDomain: 36819, dofollowLinks: 6, linksToTarget: 6, isSpam: false },
  { domain: "hotfrog.com", domainRating: 81, trafficDomain: 26347, dofollowLinks: 3, linksToTarget: 3, isSpam: false },
  { domain: "ezlocal.com", domainRating: 81, trafficDomain: 5740, dofollowLinks: 12, linksToTarget: 15, isSpam: false },
  { domain: "threebestrated.com", domainRating: 80, trafficDomain: 4470, dofollowLinks: 4, linksToTarget: 21, isSpam: false },
  { domain: "communityimpact.com", domainRating: 79, trafficDomain: 44585, dofollowLinks: 1, linksToTarget: 1, isSpam: false },
  { domain: "thebluebook.com", domainRating: 79, trafficDomain: 56129, dofollowLinks: 1, linksToTarget: 1, isSpam: false },
  { domain: "chambermaster.com", domainRating: 78, trafficDomain: 56749, dofollowLinks: 8, linksToTarget: 8, isSpam: false },
  { domain: "colum.edu", domainRating: 75, trafficDomain: 20232, dofollowLinks: 3, linksToTarget: 3, isSpam: false },
  { domain: "dnb.com", domainRating: 90, trafficDomain: 578090, dofollowLinks: 3, linksToTarget: 3, isSpam: false },
  // High-DR traps that MUST be disqualified:
  { domain: "viesearch.com", domainRating: 73, trafficDomain: 757, dofollowLinks: 2375, linksToTarget: 2378, isSpam: false },
  { domain: "folkd.com", domainRating: 73, trafficDomain: 1833, dofollowLinks: 444, linksToTarget: 686, isSpam: false },
  { domain: "apsense.com", domainRating: 73, trafficDomain: 17905, dofollowLinks: 71, linksToTarget: 121, isSpam: false },
  { domain: "linkcentre.com", domainRating: 72, trafficDomain: 556, dofollowLinks: 3, linksToTarget: 3, isSpam: false },
];

function main() {
  const now = new Date().toISOString();
  const state = loadState();

  const all: CandidateMetrics[] = [
    ...REAL,
    ...SEED_TARGETS.map((s) => ({
      domain: s.domain,
      domainRating: 60,
      trafficDomain: 5000,
      dofollowLinks: 1,
      linksToTarget: 1,
      isSpam: false,
    })),
  ];

  const seedDomains = new Set(SEED_TARGETS.map((s) => s.domain.toLowerCase()));
  let added = 0;
  let dq = 0;
  const dqList: string[] = [];
  for (const m of all) {
    const { category, automation, recommendedPlay } = classify(m);
    const score = scoreCandidate(m, {
      category,
      allowlisted: seedDomains.has(m.domain.toLowerCase()),
    });
    if (score.disqualified) {
      dq++;
      dqList.push(`${m.domain} — ${score.disqualifyReason}`);
      continue;
    }
    const opp: Opportunity = {
      id: idFor(m.domain),
      domain: m.domain,
      category,
      automation,
      metrics: m,
      score,
      sources: ["premiumcabinets.com / seed (2026-07-14)"],
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

  console.log(`Seeded ${SITE.domain}: +${added} qualified, ${dq} disqualified.\n`);
  console.log("Disqualified (the denylist/quality filter at work):");
  for (const d of dqList) console.log(`  x ${d}`);
}

main();
