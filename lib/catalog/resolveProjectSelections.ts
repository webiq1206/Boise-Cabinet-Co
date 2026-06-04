import { eq, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { cabinetDesigns, projects } from "@/shared/schema";
import { rowToSnapshot } from "@/lib/design/designSerialization";
import { snapshotToProjectSelections, toProjectSelections } from "@/shared/catalog/projectSelections";
import type { ProjectSelections } from "@/shared/catalog/projectSelections";
import { PLACEHOLDER_PROJECT_ID } from "@/shared/portalPlaceholder";

/** Demo selections when DB is unavailable or project is the seeded demo. */
export const DEMO_PROJECT_SELECTIONS: ProjectSelections = {
  roomType: "kitchen",
  collection: "custom",
  layout: "l-shape",
  doorStyle: "modern-shaker",
  finish: "woodgrain-canyon-oak",
  hardware: "bar-pull-160-nickel",
  accessories: ["rollout-tray"],
  lineItemSlugs: ["bfh-1d-1rot"],
};

export interface ResolvedProjectDesign {
  selections: ProjectSelections;
  designId: string | null;
  designName: string | null;
  source: "cabinet_design" | "selections_json" | "demo";
}

function mergeSelections(
  primary: ProjectSelections,
  fallback: Partial<ProjectSelections>,
): ProjectSelections {
  return toProjectSelections({ ...fallback, ...primary });
}

export async function resolveProjectDesign(
  projectId: string,
): Promise<ResolvedProjectDesign | null> {
  if (projectId === PLACEHOLDER_PROJECT_ID || !db) {
    return {
      selections: DEMO_PROJECT_SELECTIONS,
      designId: null,
      designName: "Kitchen - L-Shape (Demo)",
      source: "demo",
    };
  }

  const rows = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  const project = rows[0];
  if (!project) return null;

  let designRow = null;
  if (project.designId) {
    const designs = await db
      .select()
      .from(cabinetDesigns)
      .where(eq(cabinetDesigns.id, project.designId))
      .limit(1);
    designRow = designs[0] ?? null;
  }

  if (!designRow) {
    const linked = await db
      .select()
      .from(cabinetDesigns)
      .where(eq(cabinetDesigns.projectId, projectId))
      .orderBy(desc(cabinetDesigns.updatedAt))
      .limit(1);
    designRow = linked[0] ?? null;
  }

  if (designRow) {
    const snapshot = rowToSnapshot(designRow);
    const fromDesign = snapshotToProjectSelections(snapshot);
    return {
      selections: mergeSelections(fromDesign, {
        collection: snapshot.collection,
        roomType: snapshot.roomType,
        layout: snapshot.layout,
      }),
      designId: designRow.id,
      designName: designRow.name ?? null,
      source: "cabinet_design",
    };
  }

  if (project.selectionsJson && typeof project.selectionsJson === "object") {
    const raw = project.selectionsJson as Record<string, unknown>;
    return {
      selections: toProjectSelections({
        roomType: (raw.roomType as string) ?? null,
        collection: (raw.collectionId as string) ?? (raw.collection as string) ?? null,
        layout: (raw.layout as string) ?? null,
        doorStyle: (raw.doorStyle as string) ?? null,
        finish: (raw.finish as string) ?? null,
        hardware: (raw.hardware as string) ?? null,
        accessories: Array.isArray(raw.accessories) ? (raw.accessories as string[]) : [],
        lineItemSlugs: Array.isArray(raw.lineItemSlugs) ? (raw.lineItemSlugs as string[]) : [],
      }),
      designId: project.designId ?? null,
      designName: null,
      source: "selections_json",
    };
  }

  return {
    selections: DEMO_PROJECT_SELECTIONS,
    designId: null,
    designName: null,
    source: "demo",
  };
}
