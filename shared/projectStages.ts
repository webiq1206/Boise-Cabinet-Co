/**
 * Customer-facing project timeline stages for Boise Cabinet Co.
 */

export type ProjectStage =
  | "consultation"
  | "design"
  | "design_review"
  | "approved"
  | "fabrication"
  | "quality_check"
  | "shipping"
  | "delivery"
  | "installation"
  | "punch_list"
  | "complete"
  | "warranty";

export type StageStatus = "completed" | "in_progress" | "upcoming" | "action_required";

export interface TimelineStageDefinition {
  id: ProjectStage;
  label: string;
  description: string;
  customerAction?: string;
}

export const PROJECT_STAGE_ORDER: ProjectStage[] = [
  "consultation",
  "design",
  "design_review",
  "approved",
  "fabrication",
  "quality_check",
  "shipping",
  "delivery",
  "installation",
  "punch_list",
  "complete",
  "warranty",
];

export const STAGE_DEFINITIONS: Record<ProjectStage, TimelineStageDefinition> = {
  consultation: {
    id: "consultation",
    label: "Consultation",
    description: "We learn your space, goals, and preferences.",
  },
  design: {
    id: "design",
    label: "Design",
    description: "Your cabinet layout, selections, and renderings take shape.",
  },
  design_review: {
    id: "design_review",
    label: "Design Review",
    description: "Review and approve your design before we build.",
    customerAction: "Approve your design",
  },
  approved: {
    id: "approved",
    label: "Approved",
    description: "Design is locked and your order enters production.",
    customerAction: "Sign agreement & pay deposit",
  },
  fabrication: {
    id: "fabrication",
    label: "Fabrication",
    description: "Your cabinets are built to order in our partner facility.",
  },
  quality_check: {
    id: "quality_check",
    label: "Quality Check",
    description: "Every cabinet is inspected before it leaves the shop.",
  },
  shipping: {
    id: "shipping",
    label: "Shipping",
    description: "Your order is on its way to the Treasure Valley.",
  },
  delivery: {
    id: "delivery",
    label: "Delivery",
    description: "Cabinets arrive at your home, ready for install.",
  },
  installation: {
    id: "installation",
    label: "Installation",
    description: "Our team installs and adjusts every cabinet.",
  },
  punch_list: {
    id: "punch_list",
    label: "Final Walkthrough",
    description: "We address any final details together.",
    customerAction: "Confirm completion",
  },
  complete: {
    id: "complete",
    label: "Complete",
    description: "Your project is finished. Enjoy your new cabinets.",
  },
  warranty: {
    id: "warranty",
    label: "Warranty",
    description: "Lifetime warranty support for your cabinetry.",
  },
};

export interface TimelineEvent {
  stage: ProjectStage;
  status: StageStatus;
  label: string;
  description?: string;
  completedAt?: string;
  estimatedAt?: string;
  actionUrl?: string;
  actionLabel?: string;
}

export function buildDefaultTimeline(currentStage: ProjectStage): TimelineEvent[] {
  const currentIndex = PROJECT_STAGE_ORDER.indexOf(currentStage);

  return PROJECT_STAGE_ORDER.map((stage, index) => {
    const def = STAGE_DEFINITIONS[stage];
    let status: StageStatus = "upcoming";

    if (index < currentIndex) status = "completed";
    else if (index === currentIndex) {
      status = def.customerAction ? "action_required" : "in_progress";
    }

    return {
      stage,
      status,
      label: def.label,
      description: def.description,
      actionLabel: status === "action_required" ? def.customerAction : undefined,
    };
  });
}
