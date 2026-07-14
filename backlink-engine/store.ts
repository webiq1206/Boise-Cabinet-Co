/**
 * Persistent pipeline store. Uses a plain JSON file under data/ so it works on
 * Replit with zero infra; swap loadState/saveState for a DB later without
 * touching the rest of the engine.
 */

import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { SITE } from "./config";
import type { Opportunity, PipelineState } from "./types";

const DATA_PATH = join(__dirname, "data", "pipeline.json");

export function idFor(domain: string): string {
  return createHash("sha1").update(domain.toLowerCase()).digest("hex").slice(0, 12);
}

export function loadState(): PipelineState {
  if (!existsSync(DATA_PATH)) {
    return {
      updatedAt: "",
      target: SITE.domain,
      opportunities: [],
      authoritySnapshots: [],
      wonDomains: [],
      lostDomains: [],
    };
  }
  return JSON.parse(readFileSync(DATA_PATH, "utf8")) as PipelineState;
}

export function saveState(state: PipelineState, now: string): void {
  state.updatedAt = now;
  mkdirSync(dirname(DATA_PATH), { recursive: true });
  writeFileSync(DATA_PATH, JSON.stringify(state, null, 2));
}

/**
 * Insert or merge an opportunity. Existing records keep their status/history
 * (so we never re-pitch a won or rejected domain); only metrics/score refresh.
 */
export function upsertOpportunity(
  state: PipelineState,
  opp: Opportunity,
  now: string,
): "new" | "updated" {
  const existing = state.opportunities.find((o) => o.id === opp.id);
  if (!existing) {
    opp.history.push({ at: now, event: `discovered (${opp.status})` });
    state.opportunities.push(opp);
    return "new";
  }
  existing.metrics = opp.metrics;
  existing.score = opp.score;
  existing.sources = Array.from(new Set([...existing.sources, ...opp.sources]));
  existing.lastUpdated = now;
  return "updated";
}
