/**
 * Monitoring: fully automated, no human needed. Each cycle we diff our current
 * referring domains against the last known set to detect links WON (new) and
 * LOST (disappeared), auto-transition matching opportunities, and compute
 * competitor + our-own authority velocity from the snapshot history.
 */

import { AhrefsClient } from "./ahrefs";
import { COMPETITORS, SITE } from "./config";
import type { PipelineState } from "./types";

export interface MonitorResult {
  gained: string[];
  lost: string[];
  ourVelocity: { drDelta: number; refdomainsDelta: number };
  competitorVelocity: { domain: string; drDelta: number; refdomainsDelta: number }[];
}

export async function runMonitor(
  client: AhrefsClient,
  state: PipelineState,
  now: string,
): Promise<MonitorResult> {
  // --- Gained / lost link detection ---
  const current = new Set(await client.allReferringDomains(SITE.domain, 200));
  const known = new Set(state.wonDomains);

  const gained = [...current].filter((d) => !known.has(d));
  const lost = state.wonDomains.filter((d) => !current.has(d));

  for (const d of gained) {
    if (!state.wonDomains.includes(d)) state.wonDomains.push(d);
    const opp = state.opportunities.find((o) => o.domain.toLowerCase() === d);
    if (opp && opp.status !== "won") {
      opp.status = "won";
      opp.lastUpdated = now;
      opp.history.push({ at: now, event: "Link detected live (auto-monitor)" });
    }
  }
  for (const d of lost) {
    state.wonDomains = state.wonDomains.filter((x) => x !== d);
    if (!state.lostDomains.includes(d)) state.lostDomains.push(d);
    const opp = state.opportunities.find((o) => o.domain.toLowerCase() === d);
    if (opp) {
      opp.status = "lost";
      opp.lastUpdated = now;
      opp.history.push({ at: now, event: "Link lost (auto-monitor)" });
    }
  }

  // --- Authority velocity from snapshot history (first vs latest) ---
  const snaps = state.authoritySnapshots;
  const velocityFor = (domain: string) => {
    const first = snaps.find((s) => s.metrics[domain]);
    const last = [...snaps].reverse().find((s) => s.metrics[domain]);
    if (!first || !last) return { drDelta: 0, refdomainsDelta: 0 };
    return {
      drDelta: +(last.metrics[domain].dr - first.metrics[domain].dr).toFixed(1),
      refdomainsDelta: last.metrics[domain].refdomains - first.metrics[domain].refdomains,
    };
  };

  return {
    gained,
    lost,
    ourVelocity: velocityFor(SITE.domain),
    competitorVelocity: COMPETITORS.map((c) => ({ domain: c.domain, ...velocityFor(c.domain) })),
  };
}
