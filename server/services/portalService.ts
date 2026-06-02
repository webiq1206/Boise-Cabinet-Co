import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import {
  projects,
  projectInvoices,
  projectMessages,
  projectOrders,
  type Project,
} from "@/shared/schema";
import type { ProjectStage } from "@/shared/projectStages";
import {
  PLACEHOLDER_PROJECT,
  PLACEHOLDER_PROJECT_ID,
} from "@/shared/portalPlaceholder";

export interface PortalProjectSummary {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  currentStage: ProjectStage;
  status: string;
  estimatedCompletion: string;
  projectManager: string;
}

export interface PortalAttentionItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  href: string;
  actionLabel: string;
}

export interface PortalInvoice {
  id: string;
  number: string;
  description: string;
  amount: number;
  status: "paid" | "due" | "upcoming" | "draft" | "sent" | "overdue";
  dueDate: string;
  paidDate: string | null;
}

export interface PortalMessage {
  id: string;
  body: string;
  senderRole: string;
  createdAt: string;
  isOwn: boolean;
}

const DEMO_INVOICES: PortalInvoice[] = [
  {
    id: "inv-1",
    number: "INV-2026-0042",
    description: "Design & consultation deposit",
    amount: 2500,
    status: "paid",
    dueDate: "May 10, 2026",
    paidDate: "May 8, 2026",
  },
  {
    id: "inv-2",
    number: "INV-2026-0058",
    description: "Production deposit — 50%",
    amount: 8750,
    status: "due",
    dueDate: "June 15, 2026",
    paidDate: null,
  },
  {
    id: "inv-3",
    number: "INV-2026-0071",
    description: "Final balance — upon installation",
    amount: 8750,
    status: "upcoming",
    dueDate: "Upon completion",
    paidDate: null,
  },
];

const DEMO_MESSAGES: PortalMessage[] = [
  {
    id: "msg-1",
    body: "Hi! Your kitchen design is ready for review. Take a look at the layout and finish selections when you have a moment.",
    senderRole: "admin",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isOwn: false,
  },
  {
    id: "msg-2",
    body: "Thanks! I love the white oak finish. Can we add a pull-out spice rack to the left of the range?",
    senderRole: "customer",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    isOwn: true,
  },
];

function mapProject(p: Project): PortalProjectSummary {
  const stage = (p.currentStage as ProjectStage) ?? "consultation";
  return {
    id: p.id,
    title: p.title,
    address: p.address ?? "",
    city: p.city,
    state: "ID",
    currentStage: stage,
    status: formatStatus(stage),
    estimatedCompletion: p.estimatedDeliveryDate
      ? new Date(p.estimatedDeliveryDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
      : "TBD",
    projectManager: "Your project team",
  };
}

function formatStatus(stage: ProjectStage): string {
  const labels: Record<ProjectStage, string> = {
    consultation: "Consultation",
    design: "Design",
    design_review: "Design Review",
    approved: "Approved",
    fabrication: "In Fabrication",
    quality_check: "Quality Check",
    shipping: "Shipping",
    delivery: "Delivery",
    installation: "Installation",
    punch_list: "Final Walkthrough",
    complete: "Complete",
    warranty: "Warranty",
  };
  return labels[stage] ?? "In Progress";
}

function buildAttentionItems(projectId: string, stage: ProjectStage): PortalAttentionItem[] {
  const items: PortalAttentionItem[] = [];
  if (stage === "design_review") {
    items.push({
      id: "approve-design",
      title: "Approve your cabinet design",
      description: "Review layout, door style, and finish selections before we begin fabrication.",
      priority: "high",
      href: `/portal/projects/${projectId}/design`,
      actionLabel: "Review",
    });
  }
  items.push({
    id: "deposit-invoice",
    title: "Production deposit ready",
    description: "Sign your agreement and pay the project deposit to lock in production.",
    priority: "high",
    href: `/portal/projects/${projectId}/payments`,
    actionLabel: "Pay now",
  });
  items.push({
    id: "upload-inspiration",
    title: "Upload inspiration photos",
    description: "Share reference images to help us refine your design selections.",
    priority: "medium",
    href: `/portal/projects/${projectId}/documents`,
    actionLabel: "Upload",
  });
  return items;
}

export async function getCustomerProjects(customerUserId?: string | null): Promise<PortalProjectSummary[]> {
  if (!db || !customerUserId) {
    return [PLACEHOLDER_PROJECT];
  }

  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.customerUserId, customerUserId));

  if (rows.length === 0) return [PLACEHOLDER_PROJECT];
  return rows.map(mapProject);
}

export async function getCustomerProject(
  projectId: string,
  customerUserId?: string | null,
): Promise<PortalProjectSummary | null> {
  if (projectId === PLACEHOLDER_PROJECT_ID || !db) {
    return PLACEHOLDER_PROJECT;
  }

  const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = rows[0];
  if (!project) return null;
  if (customerUserId && project.customerUserId !== customerUserId) return null;
  return mapProject(project);
}

export async function getPortalDashboard(customerUserId?: string | null) {
  const projectList = await getCustomerProjects(customerUserId);
  const activeProject = projectList[0] ?? PLACEHOLDER_PROJECT;
  return {
    projects: projectList,
    activeProject,
    attentionItems: buildAttentionItems(activeProject.id, activeProject.currentStage),
  };
}

export async function getProjectInvoices(projectId: string): Promise<PortalInvoice[]> {
  if (!db || projectId === PLACEHOLDER_PROJECT_ID) return DEMO_INVOICES;

  const rows = await db
    .select()
    .from(projectInvoices)
    .where(eq(projectInvoices.projectId, projectId));

  if (rows.length === 0) return DEMO_INVOICES;

  return rows.map((inv, i) => ({
    id: inv.id,
    number: `INV-${inv.id.slice(0, 8).toUpperCase()}`,
    description: inv.description ?? "Invoice",
    amount: Number(inv.amount),
    status: mapInvoiceStatus(inv.status),
    dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "TBD",
    paidDate: inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : null,
  }));
}

function mapInvoiceStatus(status: string | null): PortalInvoice["status"] {
  if (status === "paid") return "paid";
  if (status === "sent" || status === "overdue") return "due";
  if (status === "draft") return "upcoming";
  return "upcoming";
}

export async function getProjectMessages(
  projectId: string,
  viewerRole: string,
): Promise<PortalMessage[]> {
  if (!db || projectId === PLACEHOLDER_PROJECT_ID) return DEMO_MESSAGES;

  const rows = await db
    .select()
    .from(projectMessages)
    .where(eq(projectMessages.projectId, projectId));

  if (rows.length === 0) return DEMO_MESSAGES;

  return rows.map((m) => ({
    id: m.id,
    body: m.body,
    senderRole: m.senderRole,
    createdAt: m.createdAt.toISOString(),
    isOwn: m.senderRole === viewerRole,
  }));
}

export async function getProjectOrders(projectId: string) {
  if (!db || projectId === PLACEHOLDER_PROJECT_ID) {
    return [
      {
        id: "ord-1",
        orderNumber: "BCC-2026-0142",
        status: "fabrication",
        estimatedShipDate: "July 2026",
        trackingNumber: null,
      },
    ];
  }

  const rows = await db.select().from(projectOrders).where(eq(projectOrders.projectId, projectId));
  return rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    estimatedShipDate: o.estimatedShipDate
      ? new Date(o.estimatedShipDate).toLocaleDateString()
      : null,
    trackingNumber: o.trackingNumber,
  }));
}
