"use client";

import { AlertTriangle, CheckCircle2, Lightbulb, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PlanIssue, PlanRecommendation } from "@/lib/design/planAdvisor";

interface PlanIssuesPanelProps {
  issues: PlanIssue[];
  recommendations?: PlanRecommendation[];
  onApplyFix?: (apply: (mods: import("@/lib/design/previewConfig").CabinetModule[]) => import("@/lib/design/previewConfig").CabinetModule[]) => void;
  showRecommendations?: boolean;
  className?: string;
}

export function PlanIssuesPanel({
  issues,
  recommendations = [],
  onApplyFix,
  showRecommendations = true,
  className,
}: PlanIssuesPanelProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {issues.length > 0 ? (
        <div className="space-y-2" data-testid="panel-issues">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={cn(
                "flex flex-wrap items-start gap-3 rounded-md border p-3",
                issue.severity === "error"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border bg-muted/40",
              )}
              data-testid={`issue-${issue.id}`}
            >
              <AlertTriangle
                className={cn(
                  "mt-0.5 h-4 w-4 shrink-0",
                  issue.severity === "error"
                    ? "text-destructive"
                    : "text-muted-foreground",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{issue.title}</p>
                <p className="text-sm text-muted-foreground">{issue.message}</p>
              </div>
              {issue.fix && onApplyFix && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onApplyFix(issue.fix!.apply)}
                  data-testid={`button-fix-${issue.id}`}
                >
                  <Wand2 className="h-4 w-4" /> {issue.fix.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex items-center gap-2 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground"
          data-testid="text-no-issues"
        >
          <CheckCircle2 className="h-4 w-4 text-accent" />
          No layout problems spotted for your entered room size.
        </div>
      )}

      {showRecommendations && recommendations.length > 0 && (
        <div className="space-y-2" data-testid="panel-recommendations">
          <p className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-accent" /> Ideas to make it work better
          </p>
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="flex flex-wrap items-start gap-3 rounded-md border border-border p-3"
              data-testid={`rec-${rec.id}`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{rec.title}</p>
                <p className="text-sm text-muted-foreground">{rec.message}</p>
              </div>
              {rec.fix && onApplyFix && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => onApplyFix(rec.fix!.apply)}
                  data-testid={`button-rec-${rec.id}`}
                >
                  <Wand2 className="h-4 w-4" /> {rec.fix.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
