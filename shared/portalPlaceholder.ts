import type { ProjectStage } from "@/shared/projectStages";

export const PLACEHOLDER_PROJECT_ID = "demo-001";

export const PLACEHOLDER_PROJECT = {
  id: PLACEHOLDER_PROJECT_ID,
  title: "Kitchen Cabinet Refresh",
  address: "1842 N Harrison Blvd",
  city: "Boise",
  state: "ID",
  currentStage: "design_review" as ProjectStage,
  status: "Design Review",
  estimatedCompletion: "August 2026",
  projectManager: "Sarah Mitchell",
};
