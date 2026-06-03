import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { cabinetDesigns, projects } from "@/shared/schema";
import { PLACEHOLDER_PROJECT_ID } from "@/shared/portalPlaceholder";

/**
 * Whether the caller may attach a saved design to this portal project.
 * Demo project is always allowed; unassigned projects allow anonymous saves;
 * assigned projects require matching customer user id.
 */
export async function canLinkDesignToProject(
  projectId: string,
  customerUserId: string | null,
): Promise<boolean> {
  if (projectId === PLACEHOLDER_PROJECT_ID) return true;
  if (!db) return false;

  const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = rows[0];
  if (!project) return false;
  if (!project.customerUserId) return true;
  if (!customerUserId) return false;
  return project.customerUserId === customerUserId;
}

/** After a design save, point the project at the design and mirror selectionsJson. */
export async function linkDesignToProject(
  projectId: string,
  designId: string,
  selectionsJson: Record<string, unknown>,
): Promise<void> {
  if (!db) return;

  await db
    .update(cabinetDesigns)
    .set({ projectId, updatedAt: new Date() })
    .where(eq(cabinetDesigns.id, designId));

  await db
    .update(projects)
    .set({
      designId,
      selectionsJson,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId));
}
