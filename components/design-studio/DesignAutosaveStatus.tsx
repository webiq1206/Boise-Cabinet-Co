"use client";

import { useEffect, useState } from "react";
import { Check, CloudOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDesignStudio } from "./DesignStudioProvider";

function relativeTime(ts: number | null): string {
  if (!ts) return "";
  const secs = Math.round((Date.now() - ts) / 1000);
  if (secs < 5) return "just now";
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs}h ago`;
}

/**
 * Compact "Saved" indicator for the studio header so the visitor always knows
 * their work is being kept (one of the brief's core "did my selection save?"
 * reassurances).
 */
export function DesignAutosaveStatus({ className }: { className?: string }) {
  const { autosaveState, autosaveLastSavedAt } = useDesignStudio();
  const [, force] = useState(0);

  // Refresh the relative timestamp every 20s while idle/saved.
  useEffect(() => {
    if (autosaveState !== "saved") return;
    const t = window.setInterval(() => force((n) => n + 1), 20000);
    return () => window.clearInterval(t);
  }, [autosaveState]);

  const base =
    "inline-flex items-center gap-1.5 text-xs text-muted-foreground";

  // Reassure from the very start, before the first edit triggers a save.
  if (autosaveState === "idle" && !autosaveLastSavedAt) {
    return (
      <span className={cn(base, className)} data-testid="autosave-status">
        <Check className="h-3.5 w-3.5 text-primary" />
        Changes save automatically
      </span>
    );
  }

  if (autosaveState === "saving") {
    return (
      <span className={cn(base, className)} aria-live="polite" data-testid="autosave-status">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (autosaveState === "error") {
    return (
      <span
        className={cn(base, "text-amber-600 dark:text-amber-400", className)}
        aria-live="polite"
        data-testid="autosave-status"
      >
        <CloudOff className="h-3.5 w-3.5" />
        Saved on this device
      </span>
    );
  }

  return (
    <span className={cn(base, className)} aria-live="polite" data-testid="autosave-status">
      <Check className="h-3.5 w-3.5 text-primary" />
      Saved {relativeTime(autosaveLastSavedAt)}
    </span>
  );
}
