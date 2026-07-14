"use client";

import { useState, useTransition } from "react";
import type { Opportunity } from "@/backlink-engine/types";
import {
  approveOpportunity,
  markWon,
  reopenOpportunity,
  rejectOpportunity,
} from "./actions";

type Filter = "all" | "awaiting_approval" | "queued" | "actioned" | "won" | "rejected";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All active" },
  { key: "awaiting_approval", label: "Awaiting approval" },
  { key: "queued", label: "Auto-queued" },
  { key: "actioned", label: "Sent / submitted" },
  { key: "won", label: "Won" },
  { key: "rejected", label: "Rejected" },
];

const TIER_COLORS: Record<string, string> = {
  A: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  B: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  C: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export function PipelineBoard({ opportunities }: { opportunities: Opportunity[] }) {
  const [filter, setFilter] = useState<Filter>("awaiting_approval");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shown = opportunities.filter((o) =>
    filter === "all" ? !["won", "rejected", "lost"].includes(o.status) : o.status === filter,
  );

  const run = (fn: (id: string) => Promise<void>, id: string) =>
    startTransition(() => {
      void fn(id);
    });

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = opportunities.filter((o) =>
            f.key === "all" ? !["won", "rejected", "lost"].includes(o.status) : o.status === f.key,
          ).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-sm text-sm border transition-colors ${
                filter === f.key
                  ? "bg-accent/20 border-accent/40 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {shown.length === 0 && (
          <p className="text-muted-foreground text-sm py-12 text-center">
            Nothing in this view. Run a cycle: <code>npx tsx backlink-engine/cycle.ts</code>
          </p>
        )}
        {shown.map((o) => (
          <div key={o.id} className="rounded-sm border border-border bg-card">
            <div className="flex items-start gap-4 p-4">
              <div className={`shrink-0 w-12 text-center rounded-sm border px-2 py-1 ${TIER_COLORS[o.score.tier] ?? ""}`}>
                <div className="text-lg leading-none font-medium">{o.score.score}</div>
                <div className="text-[10px] tracking-wide uppercase opacity-70">{o.score.tier}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://${o.domain}`}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-foreground font-medium hover:text-accent truncate"
                  >
                    {o.domain}
                  </a>
                  <span className="text-[11px] px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">{o.category}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-sm border border-border text-muted-foreground">{o.automation}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{o.recommendedPlay}</p>
                <p className="text-[11px] text-muted-foreground/70 mt-1">
                  DR {o.metrics.domainRating} · ~{o.metrics.trafficDomain.toLocaleString()} visits/mo · from {o.sources.join(", ")}
                  {o.contact?.email && <span className="text-accent"> · ✉ {o.contact.email}</span>}
                </p>

                {o.outreachDraft && (
                  <button
                    onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    className="text-xs text-accent mt-2 hover:underline"
                  >
                    {expanded === o.id ? "Hide" : "View"} outreach draft
                  </button>
                )}
                {expanded === o.id && o.outreachDraft && (
                  <pre className="mt-2 p-3 rounded-sm bg-background border border-border text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {o.outreachDraft}
                  </pre>
                )}
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                {(o.status === "awaiting_approval" || o.status === "queued") && (
                  <>
                    <button
                      disabled={pending}
                      onClick={() => run(approveOpportunity, o.id)}
                      className="px-3 py-1.5 rounded-sm text-sm bg-accent/20 border border-accent/40 text-foreground hover:bg-accent/30 disabled:opacity-50"
                    >
                      {o.automation === "auto" ? "Approve submit" : "Approve & send"}
                    </button>
                    <button
                      disabled={pending}
                      onClick={() => run(rejectOpportunity, o.id)}
                      className="px-3 py-1.5 rounded-sm text-sm border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </>
                )}
                {o.status === "actioned" && (
                  <button
                    disabled={pending}
                    onClick={() => run(markWon, o.id)}
                    className="px-3 py-1.5 rounded-sm text-sm bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
                  >
                    Mark won
                  </button>
                )}
                {(o.status === "rejected" || o.status === "actioned") && (
                  <button
                    disabled={pending}
                    onClick={() => run(reopenOpportunity, o.id)}
                    className="px-3 py-1.5 rounded-sm text-xs border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
