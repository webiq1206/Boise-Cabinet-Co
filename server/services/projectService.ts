import { db as nullableDb } from "@/lib/db";
import {
  projects,
  projectAssignments,
  changeOrders,
  entityDocuments,
  leads,
  quotes,
  users,
  projectInvoices,
  projectMessages,
  type Project,
  type InsertProject,
  type ProjectAssignment,
  type ChangeOrder,
  type EntityDocument,
  type Lead,
  type ProjectInvoice,
  type ProjectMessage,
} from "@shared/schema";
import { recordLeadActivity, actorNameFromUser } from "@/server/services/leadActivity";
import { and, desc, eq, sql } from "drizzle-orm";

/*
 * `db` is typed nullable in lib/db so the app can BUILD without a database
 * configured - that is deliberate and must stay. Every function below runs only
 * inside request handling, where a connection string is always present, so the
 * nullability is narrowed once here rather than at each of the call sites.
 *
 * This is a TYPE-ONLY assertion: it emits no code and changes no behaviour. If
 * the database really were unconfigured at runtime the failure is exactly what
 * it is today. What it buys is that `tsc` stops reporting the same non-issue
 * dozens of times and can be read for real problems again.
 */
const db = nullableDb as NonNullable<typeof nullableDb>;


export async function getAllProjects(filters?: {
  status?: string;
}): Promise<Project[]> {
  if (!db) return [];
  if (filters?.status) {
    return db
      .select()
      .from(projects)
      .where(eq(projects.status, filters.status))
      .orderBy(desc(projects.updatedAt));
  }
  return db.select().from(projects).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!db) return null;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return project ?? null;
}

export async function getProjectsForSubcontractor(
  subcontractorId: string
): Promise<Array<Project & { assignment: ProjectAssignment }>> {
  if (!db) return [];

  const rows = await db
    .select({ project: projects, assignment: projectAssignments })
    .from(projectAssignments)
    .innerJoin(projects, eq(projectAssignments.projectId, projects.id))
    .where(
      and(
        eq(projectAssignments.subcontractorId, subcontractorId),
        sql`${projectAssignments.status} != 'removed'`
      )
    )
    .orderBy(desc(projects.updatedAt));

  return rows.map((r) => ({ ...r.project, assignment: r.assignment }));
}

export async function createProject(data: InsertProject): Promise<Project> {
  if (!db) throw new Error("Database not available");
  const [project] = await db.insert(projects).values(data).returning();
  return project;
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<Project | null> {
  if (!db) throw new Error("Database not available");
  const [project] = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  return project ?? null;
}

export async function convertLeadToProject(
  leadId: string,
  adminUserId: string
): Promise<Project> {
  if (!db) throw new Error("Database not available");

  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) throw new Error("Lead not found");
  if (lead.projectId) throw new Error("Lead already converted to project");

  let quoteScheduledDate: Date | null = null;
  if (lead.quoteId) {
    const [quote] = await db
      .select()
      .from(quotes)
      .where(eq(quotes.id, lead.quoteId))
      .limit(1);
    quoteScheduledDate = quote?.scheduledDate ?? null;
  }

  const importedNotes = Array.isArray(lead.notes)
    ? (lead.notes as Array<{ text: string; addedBy: string; addedAt: string }>).map(
        (n) => ({
          ...n,
          type: "imported_from_lead",
        })
      )
    : [];

  /*
   * A lead is not guaranteed to carry a service type or a person's name. The
   * unified leads table makes both nullable on purpose - company-only leads and
   * no-email imports are valid rows - so building the title by reaching straight
   * through them threw "Cannot read properties of null (reading 'replace')" and
   * returned a 500 from both admin convert routes for exactly those leads.
   */
  const service = lead.serviceType?.replace(/-/g, " ").trim();
  const who = lead.name?.trim() || lead.companyName?.trim();
  const title = [service || "Cabinet project", who].filter(Boolean).join(" - ");

  const [project] = await db
    .insert(projects)
    .values({
      leadId: lead.id,
      quoteId: lead.quoteId,
      title,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      city: lead.city,
      propertyProfile: lead.propertyProfile ?? undefined,
      propertyType: lead.propertyType,
      serviceType: lead.serviceType,
      selectedServices: lead.selectedServices,
      lineItems: lead.lineItems,
      serviceData: lead.serviceData,
      message: lead.message,
      scopeOfWork: lead.message ?? undefined,
      budget: lead.finalQuote,
      contractAmount: lead.finalQuote,
      paymentTerms: "Net 30 upon completion",
      startDate: quoteScheduledDate,
      status: "draft",
      internalNotes: importedNotes,
      customFields: {
        priority: lead.priority,
        tags: lead.tags,
      },
      createdBy: adminUserId,
      convertedFromLeadAt: new Date(),
    })
    .returning();

  await db
    .update(leads)
    .set({
      projectId: project.id,
      convertedToProjectAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(leads.id, leadId));

  const [actor] = await db.select().from(users).where(eq(users.id, adminUserId)).limit(1);
  await recordLeadActivity({
    leadId,
    type: "converted",
    message: `Converted to project: ${title}`,
    detail: { projectId: project.id, title },
    actorId: adminUserId,
    actorName: actorNameFromUser(actor),
  });

  return project;
}

export async function getProjectAssignments(
  projectId: string
): Promise<Array<ProjectAssignment & { subcontractor: typeof users.$inferSelect }>> {
  if (!db) return [];
  const rows = await db
    .select({ assignment: projectAssignments, subcontractor: users })
    .from(projectAssignments)
    .innerJoin(users, eq(projectAssignments.subcontractorId, users.id))
    .where(
      and(
        eq(projectAssignments.projectId, projectId),
        sql`${projectAssignments.status} != 'removed'`
      )
    );
  return rows.map((r) => ({ ...r.assignment, subcontractor: r.subcontractor }));
}

export async function assignSubcontractorToProject(
  projectId: string,
  subcontractorId: string,
  adminUserId: string,
  role: "primary" | "sub" = "primary"
): Promise<ProjectAssignment> {
  if (!db) throw new Error("Database not available");

  const [assignment] = await db
    .insert(projectAssignments)
    .values({
      projectId,
      subcontractorId,
      role,
      status: "assigned",
      assignedBy: adminUserId,
    })
    .returning();

  await addProjectActivityNote(
    projectId,
    `Subcontractor assigned to project`,
    adminUserId,
    "assignment"
  );

  return assignment;
}

export async function removeProjectAssignment(
  assignmentId: string,
  adminUserId: string
): Promise<void> {
  if (!db) throw new Error("Database not available");
  await db
    .update(projectAssignments)
    .set({ status: "removed" })
    .where(eq(projectAssignments.id, assignmentId));

  const [assignment] = await db
    .select()
    .from(projectAssignments)
    .where(eq(projectAssignments.id, assignmentId))
    .limit(1);

  if (assignment) {
    await addProjectActivityNote(
      assignment.projectId,
      "Subcontractor removed from project",
      adminUserId,
      "assignment"
    );
  }
}

export async function addProjectActivityNote(
  projectId: string,
  text: string,
  addedBy: string,
  type = "note"
): Promise<void> {
  if (!db) return;
  const project = await getProjectById(projectId);
  if (!project) return;

  const notes = Array.isArray(project.internalNotes) ? [...project.internalNotes] : [];
  notes.push({ text, addedBy, addedAt: new Date().toISOString(), type });

  await db
    .update(projects)
    .set({ internalNotes: notes, updatedAt: new Date() })
    .where(eq(projects.id, projectId));
}

export async function getChangeOrdersForProject(projectId: string): Promise<ChangeOrder[]> {
  if (!db) return [];
  return db
    .select()
    .from(changeOrders)
    .where(eq(changeOrders.projectId, projectId))
    .orderBy(changeOrders.number);
}

export async function createChangeOrder(
  projectId: string,
  data: {
    title: string;
    description: string;
    amountDelta: string;
    scopeDelta?: string;
    createdBy: string;
  }
): Promise<ChangeOrder> {
  if (!db) throw new Error("Database not available");

  const existing = await getChangeOrdersForProject(projectId);
  const nextNumber = existing.length > 0 ? Math.max(...existing.map((c) => c.number)) + 1 : 1;

  const [order] = await db
    .insert(changeOrders)
    .values({
      projectId,
      number: nextNumber,
      title: data.title,
      description: data.description,
      amountDelta: data.amountDelta,
      scopeDelta: data.scopeDelta,
      status: "draft",
      createdBy: data.createdBy,
    })
    .returning();

  return order;
}

export async function updateChangeOrderStatus(
  changeOrderId: string,
  status: ChangeOrder["status"],
  adminUserId: string
): Promise<ChangeOrder | null> {
  if (!db) throw new Error("Database not available");

  const [order] = await db
    .update(changeOrders)
    .set({
      status,
      approvedAt: status === "approved" ? new Date() : null,
    })
    .where(eq(changeOrders.id, changeOrderId))
    .returning();

  if (order && status === "approved") {
    const project = await getProjectById(order.projectId);
    if (project) {
      const currentAmount = parseFloat(project.contractAmount ?? "0");
      const delta = parseFloat(order.amountDelta ?? "0");
      await updateProject(order.projectId, {
        contractAmount: String(currentAmount + delta),
        scopeOfWork: project.scopeOfWork
          ? `${project.scopeOfWork}\n\nChange Order #${order.number}: ${order.scopeDelta ?? order.description}`
          : order.scopeDelta ?? order.description,
      });
    }
    await addProjectActivityNote(
      order.projectId,
      `Change order #${order.number} approved`,
      adminUserId,
      "change_order"
    );
  }

  return order ?? null;
}

export async function getEntityDocuments(
  entityType: string,
  entityId: string
): Promise<EntityDocument[]> {
  if (!db) return [];
  return db
    .select()
    .from(entityDocuments)
    .where(
      and(
        eq(entityDocuments.entityType, entityType),
        eq(entityDocuments.entityId, entityId)
      )
    )
    .orderBy(desc(entityDocuments.createdAt));
}

export async function createEntityDocument(data: {
  entityType: string;
  entityId: string;
  category: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSize?: number;
  uploadedBy: string;
}): Promise<EntityDocument> {
  if (!db) throw new Error("Database not available");
  const [doc] = await db.insert(entityDocuments).values(data).returning();
  return doc;
}

export async function getEntityDocumentById(id: string): Promise<EntityDocument | null> {
  if (!db) return null;
  const [doc] = await db
    .select()
    .from(entityDocuments)
    .where(eq(entityDocuments.id, id))
    .limit(1);
  return doc ?? null;
}

export async function deleteEntityDocument(id: string): Promise<boolean> {
  if (!db) throw new Error("Database not available");
  const deleted = await db
    .delete(entityDocuments)
    .where(eq(entityDocuments.id, id))
    .returning({ id: entityDocuments.id });
  return deleted.length > 0;
}

export async function getProjectStats(): Promise<{
  active: number;
  completed: number;
  draft: number;
  totalAssignments: number;
}> {
  if (!db) {
    return { active: 0, completed: 0, draft: 0, totalAssignments: 0 };
  }

  const allProjects = await getAllProjects();
  const assignments = await db
    .select()
    .from(projectAssignments)
    .where(sql`${projectAssignments.status} IN ('assigned', 'active')`);

  return {
    active: allProjects.filter((p) => p.status === "active").length,
    completed: allProjects.filter((p) => p.status === "completed").length,
    draft: allProjects.filter((p) => p.status === "draft").length,
    totalAssignments: assignments.length,
  };
}

export type LeadWithProject = Lead & { hasProject: boolean };

export async function getAdminProjectInvoices(projectId: string): Promise<ProjectInvoice[]> {
  if (!db) return [];
  return db
    .select()
    .from(projectInvoices)
    .where(eq(projectInvoices.projectId, projectId))
    .orderBy(desc(projectInvoices.createdAt));
}

export async function getAdminProjectMessages(projectId: string): Promise<ProjectMessage[]> {
  if (!db) return [];
  return db
    .select()
    .from(projectMessages)
    .where(eq(projectMessages.projectId, projectId))
    .orderBy(desc(projectMessages.createdAt));
}

export async function createProjectInvoice(
  projectId: string,
  data: { description: string; amount: string; dueDate?: string; status?: string },
): Promise<ProjectInvoice> {
  if (!db) throw new Error("Database not available");

  const [invoice] = await db
    .insert(projectInvoices)
    .values({
      projectId,
      description: data.description,
      amount: data.amount,
      status: data.status ?? "draft",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    })
    .returning();

  return invoice;
}

export async function updateProjectInvoice(
  invoiceId: string,
  data: { status?: string; paidAt?: Date | null },
): Promise<ProjectInvoice | null> {
  if (!db) throw new Error("Database not available");

  const patch: Partial<ProjectInvoice> = {};
  if (data.status) patch.status = data.status;
  if (data.status === "paid") patch.paidAt = data.paidAt ?? new Date();
  if (data.paidAt === null) patch.paidAt = null;

  const [invoice] = await db
    .update(projectInvoices)
    .set(patch)
    .where(eq(projectInvoices.id, invoiceId))
    .returning();

  return invoice ?? null;
}

export async function sendAdminProjectMessage(
  projectId: string,
  adminUserId: string,
  body: string,
): Promise<ProjectMessage> {
  if (!db) throw new Error("Database not available");

  const [message] = await db
    .insert(projectMessages)
    .values({
      projectId,
      senderUserId: adminUserId,
      senderRole: "admin",
      body,
    })
    .returning();

  return message;
}

export async function linkCustomerToProject(
  projectId: string,
): Promise<{ userId: string; email: string | null }> {
  if (!db) throw new Error("Database not available");

  const project = await getProjectById(projectId);
  if (!project?.email) {
    throw new Error("Project has no customer email on file");
  }

  const normalizedEmail = project.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
    .limit(1);

  if (!user) {
    throw new Error(
      "No account found with matching email. Ask the customer to sign in with the project email first.",
    );
  }

  await db
    .update(users)
    .set({ role: "customer" })
    .where(eq(users.id, user.id));

  await updateProject(projectId, { customerUserId: user.id });

  return { userId: user.id, email: user.email };
}
