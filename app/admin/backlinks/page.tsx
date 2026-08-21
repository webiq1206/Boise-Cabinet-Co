import type { Metadata } from "next";
import { rankedActive, readPipeline, summarize } from "@/lib/backlinks/pipeline";
import { PipelineBoard } from "./PipelineBoard";

// Admin-only, live data each request, needs the Node runtime for fs access.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = {
  title: "Backlink pipeline",
  robots: { index: false, follow: false },
};

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-sm border border-border bg-card px-4 py-3">
      <div className="text-2xl font-medium text-foreground leading-none">{value}</div>
      <div className="text-[12px] uppercase tracking-wide text-muted-foreground mt-1.5">{label}</div>
      {hint && <div className="text-[12px] text-muted-foreground/60 mt-0.5">{hint}</div>}
    </div>
  );
}

export default function BacklinksAdminPage() {
  const state = readPipeline();
  const s = summarize(state);
  const active = rankedActive(state);
  const lastRun = s.lastRun ? new Date(s.lastRun).toLocaleString() : "never";

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-10 max-w-5xl mx-auto">
        <div className="mb-2 text-[12px] uppercase tracking-[0.2em] text-muted-foreground">Internal · not indexed</div>
        <h1 className="font-sans font-light text-3xl md:text-4xl tracking-tight text-foreground mb-1">
          Backlink pipeline
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Target {state.target} · last cycle {lastRun} · approvals here queue outreach to send.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
          <Stat label="Active" value={s.active} />
          <Stat label="Awaiting you" value={s.awaitingApproval} hint="need approval" />
          <Stat label="Auto-queued" value={s.autoQueued} hint="submit-ready" />
          <Stat label="Tier A" value={s.byTier.A} hint="highest value" />
          <Stat label="Won" value={s.won} />
          <Stat label="Rejected" value={s.rejected} />
        </div>

        {active.length === 0 && s.total === 0 ? (
          <div className="rounded-sm border border-border bg-card p-8 text-center">
            <p className="text-foreground mb-1">Pipeline is empty.</p>
            <p className="text-sm text-muted-foreground">
              Run the first cycle on Replit: <code className="text-accent">npx tsx backlink-engine/cycle.ts</code>
            </p>
          </div>
        ) : (
          <PipelineBoard opportunities={state.opportunities} />
        )}
      </div>
    </div>
  );
}
