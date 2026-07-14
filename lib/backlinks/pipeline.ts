/**
 * Server-side access to the backlink engine's pipeline for the admin dashboard.
 * Reads/writes the same JSON the engine cron produces. Kept separate from
 * backlink-engine/store.ts (which resolves paths via __dirname for scripts) so
 * it works inside the Next.js server runtime via process.cwd().
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import type { Opportunity, PipelineState, PipelineStatus } from "@/backlink-engine/types";

const PIPELINE_PATH = join(process.cwd(), "backlink-engine", "data", "pipeline.json");

export function readPipeline(): PipelineState {
  if (!existsSync(PIPELINE_PATH)) {
    return {
      updatedAt: "",
      target: "boisecabinet.co",
      opportunities: [],
      authoritySnapshots: [],
      wonDomains: [],
      lostDomains: [],
    };
  }
  return JSON.parse(readFileSync(PIPELINE_PATH, "utf8")) as PipelineState;
}

export function writePipeline(state: PipelineState): void {
  mkdirSync(dirname(PIPELINE_PATH), { recursive: true });
  writeFileSync(PIPELINE_PATH, JSON.stringify(state, null, 2));
}

/** Transition one opportunity's status and log it. Returns false if not found. */
export function setStatus(
  id: string,
  status: PipelineStatus,
  note: string,
  now: string,
): boolean {
  const state = readPipeline();
  const opp = state.opportunities.find((o) => o.id === id);
  if (!opp) return false;
  opp.status = status;
  opp.lastUpdated = now;
  opp.history.push({ at: now, event: note });
  state.updatedAt = now;
  writePipeline(state);
  return true;
}

export interface PipelineSummary {
  total: number;
  active: number;
  awaitingApproval: number;
  autoQueued: number;
  won: number;
  rejected: number;
  byTier: Record<"A" | "B" | "C", number>;
  lastRun: string;
}

const INACTIVE: PipelineStatus[] = ["won", "rejected", "lost"];

export function summarize(state: PipelineState): PipelineSummary {
  const s: PipelineSummary = {
    total: state.opportunities.length,
    active: 0,
    awaitingApproval: 0,
    autoQueued: 0,
    won: 0,
    rejected: 0,
    byTier: { A: 0, B: 0, C: 0 },
    lastRun: state.updatedAt,
  };
  for (const o of state.opportunities) {
    if (!INACTIVE.includes(o.status)) s.active++;
    if (o.status === "awaiting_approval") s.awaitingApproval++;
    if (o.status === "queued") s.autoQueued++;
    if (o.status === "won") s.won++;
    if (o.status === "rejected") s.rejected++;
    if (o.score.tier !== "reject") s.byTier[o.score.tier]++;
  }
  return s;
}

/** Active opportunities, highest score first. */
export function rankedActive(state: PipelineState): Opportunity[] {
  return state.opportunities
    .filter((o) => !INACTIVE.includes(o.status))
    .sort((a, b) => b.score.score - a.score.score);
}
