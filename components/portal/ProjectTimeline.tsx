"use client";

import { cn } from "@/lib/utils";
import {
  buildDefaultTimeline,
  type ProjectStage,
  type TimelineEvent,
  type StageStatus,
} from "@/shared/projectStages";
import { Check, Circle, AlertCircle } from "lucide-react";

interface ProjectTimelineProps {
  currentStage: ProjectStage;
  compact?: boolean;
  className?: string;
}

const statusStyles: Record<StageStatus, { dot: string; line: string; icon: typeof Check }> = {
  completed: {
    dot: "bg-primary border-primary text-primary-foreground",
    line: "bg-primary",
    icon: Check,
  },
  in_progress: {
    dot: "bg-accent border-accent text-accent-foreground ring-4 ring-accent/20",
    line: "bg-accent/40",
    icon: Circle,
  },
  action_required: {
    dot: "bg-destructive border-destructive text-destructive-foreground ring-4 ring-destructive/20",
    line: "bg-muted",
    icon: AlertCircle,
  },
  upcoming: {
    dot: "bg-muted border-border text-muted-foreground",
    line: "bg-muted",
    icon: Circle,
  },
};

function TimelineNode({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const styles = statusStyles[event.status];
  const Icon = styles.icon;

  return (
    <div className="flex flex-col items-center min-w-[4.5rem] sm:min-w-[5.5rem] shrink-0">
      <div className="relative flex items-center w-full">
        {!isLast && (
          <div
            className={cn(
              "absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2",
              event.status === "completed" ? styles.line : "bg-border"
            )}
            aria-hidden
          />
        )}
        <div
          className={cn(
            "relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
            styles.dot
          )}
          title={event.label}
        >
          {event.status === "completed" ? (
            <Icon className="h-3.5 w-3.5" />
          ) : event.status === "action_required" ? (
            <Icon className="h-3.5 w-3.5" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-current opacity-60" />
          )}
        </div>
      </div>
      <p
        className={cn(
          "mt-2 text-center text-[10px] sm:text-xs leading-tight max-w-[5rem] sm:max-w-[6rem]",
          event.status === "in_progress" || event.status === "action_required"
            ? "font-semibold text-foreground"
            : event.status === "completed"
              ? "text-muted-foreground"
              : "text-muted-foreground/70"
        )}
      >
        {event.label}
      </p>
    </div>
  );
}

export function ProjectTimeline({ currentStage, compact, className }: ProjectTimelineProps) {
  const events = buildDefaultTimeline(currentStage);
  const visibleEvents = compact
    ? events.filter(
        (e) =>
          e.status === "completed" ||
          e.status === "in_progress" ||
          e.status === "action_required"
      )
    : events;

  const currentEvent = events.find(
    (e) => e.status === "in_progress" || e.status === "action_required"
  );

  return (
    <div className={cn("space-y-4", className)}>
      {currentEvent && (
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
            Current stage
          </p>
          <p className="font-semibold">{currentEvent.label}</p>
          {currentEvent.description && (
            <p className="text-sm text-muted-foreground mt-1">{currentEvent.description}</p>
          )}
          {currentEvent.actionLabel && (
            <p className="text-sm text-accent mt-2 font-medium">{currentEvent.actionLabel}</p>
          )}
        </div>
      )}

      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex items-start min-w-max gap-0 py-2">
          {visibleEvents.map((event, index) => (
            <TimelineNode
              key={event.stage}
              event={event}
              isLast={index === visibleEvents.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
