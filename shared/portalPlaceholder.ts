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
  estimate: {
    projectLabel: "Kitchen Cabinets",
    sizeLabel: "24 lf base \u00b7 18 lf uppers",
    scope: "Modern Shaker \u00b7 Matte finish ($$) \u00b7 Better construction",
    rangeLabel: "$28,000 \u2013 $42,000",
  },
};
