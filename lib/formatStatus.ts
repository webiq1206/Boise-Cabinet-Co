import { STAGE_DEFINITIONS, type ProjectStage } from "@/shared/projectStages";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function formatProjectStatus(status: string): string {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatProjectStage(stage: ProjectStage | string): string {
  const def = STAGE_DEFINITIONS[stage as ProjectStage];
  return def?.label ?? formatProjectStatus(stage);
}
