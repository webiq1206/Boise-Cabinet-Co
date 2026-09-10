import type { CabinetModule, RoomBounds } from "./previewConfig";
import {
  normalizePhotoOverlayTransform,
  type PhotoOverlayTransform,
} from "./photoOverlayTransform";
import type { RoomMeta } from "./roomMeta";
import {
  toProjectSelections,
  type ProjectSelections,
} from "@/shared/catalog/projectSelections";

export type { ProjectSelections };

/** Per-module style override (mirrors DesignStudioProvider's ModuleOverride). */
export interface SnapshotModuleOverride {
  doorStyle?: string | null;
  finish?: string | null;
}

/**
 * The persisted, reopenable shape of a design. Captures everything needed to
 * re-render the 3D preview and repopulate the wizard for a saved version.
 */
export interface DesignSnapshot {
  roomType: string | null;
  collection: string | null;
  layout: string | null;
  doorStyle: string | null;
  finish: string | null;
  hardware: string | null;
  accessories: string[];
  notes: string;
  photoUrl: string | null;
  designName: string;
  moduleOverrides: Record<string, SnapshotModuleOverride>;
  modules: CabinetModule[];
  roomBounds: RoomBounds | null;
  roomMeta: RoomMeta | null;
  lineItemSlugs: string[];
  photoOverlayTransform: PhotoOverlayTransform | null;
}

/** Extract catalog selections aligned with shared/catalog/projectSelections */
export function snapshotToProjectSelections(snapshot: DesignSnapshot): ProjectSelections {
  return toProjectSelections({ ...snapshot });
}

/** Build styleJson keys that match ProjectSelections (plus notes). */
export function projectSelectionsToStyleJson(
  selections: ProjectSelections,
  notes = "",
): Record<string, unknown> {
  return {
    doorStyle: selections.doorStyle,
    finish: selections.finish,
    hardware: selections.hardware,
    accessories: selections.accessories,
    lineItemSlugs: selections.lineItemSlugs,
    notes,
  };
}

/** A saved, named version of a design within a version group. */
export interface SavedVersion {
  id: string;
  name: string;
  shareToken: string | null;
  createdAt: string;
  snapshot: DesignSnapshot;
}

/** Request body for POST /api/designs. */
export interface DesignPayload {
  roomType: string;
  collectionId: string;
  name: string;
  photoUrl?: string;
  versionGroupId?: string;
  /** When set, POST /api/designs links this save to the portal project. */
  projectId?: string;
  layoutJson: Record<string, unknown>;
  styleJson: Record<string, unknown>;
}

/**
 * Build the API payload for persisting a design snapshot. Returns null when the
 * snapshot is missing the required room/collection fields.
 */
export function designToPayload(
  snapshot: DesignSnapshot,
  opts?: { versionGroupId?: string; projectId?: string | null },
): DesignPayload | null {
  if (!snapshot.roomType || !snapshot.collection) return null;
  return {
    roomType: snapshot.roomType,
    collectionId: snapshot.collection,
    name: snapshot.designName || `My ${snapshot.roomType} design`,
    photoUrl: snapshot.photoUrl ?? undefined,
    versionGroupId: opts?.versionGroupId,
    projectId: opts?.projectId ?? undefined,
    layoutJson: {
      layout: snapshot.layout,
      accessories: snapshot.accessories,
      modules: snapshot.modules,
      moduleOverrides: snapshot.moduleOverrides,
      roomBounds: snapshot.roomBounds,
      roomMeta: snapshot.roomMeta,
      photoOverlayTransform: snapshot.photoOverlayTransform,
    },
    styleJson: {
      ...projectSelectionsToStyleJson(snapshotToProjectSelections(snapshot), snapshot.notes),
      roomType: snapshot.roomType,
      collection: snapshot.collection,
      layout: snapshot.layout,
    },
  };
}

/** A persisted cabinet_designs row (loosely typed for the fields we read). */
export interface DesignRow {
  id: string;
  name?: string | null;
  roomType?: string | null;
  room_type?: string | null;
  collectionId?: string | null;
  collection_id?: string | null;
  photoUrl?: string | null;
  photo_url?: string | null;
  shareToken?: string | null;
  share_token?: string | null;
  createdAt?: Date | string | null;
  created_at?: Date | string | null;
  layoutJson?: Record<string, unknown> | null;
  layout_json?: Record<string, unknown> | null;
  styleJson?: Record<string, unknown> | null;
  style_json?: Record<string, unknown> | null;
}

function asStr(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

/** Reconstruct a DesignSnapshot from a persisted design row. */
export function rowToSnapshot(row: DesignRow): DesignSnapshot {
  const layoutJson = (row.layoutJson ?? row.layout_json ?? {}) as Record<
    string,
    unknown
  >;
  const styleJson = (row.styleJson ?? row.style_json ?? {}) as Record<
    string,
    unknown
  >;
  const accessories = Array.isArray(styleJson.accessories)
    ? (styleJson.accessories as string[])
    : Array.isArray(layoutJson.accessories)
      ? (layoutJson.accessories as string[])
      : [];

  return {
    roomType: asStr(row.roomType ?? row.room_type),
    collection: asStr(row.collectionId ?? row.collection_id),
    layout: asStr(layoutJson.layout),
    doorStyle: asStr(styleJson.doorStyle),
    finish: asStr(styleJson.finish),
    hardware: asStr(styleJson.hardware),
    accessories,
    notes: asStr(styleJson.notes) ?? "",
    photoUrl: asStr(row.photoUrl ?? row.photo_url),
    designName: asStr(row.name) ?? "",
    moduleOverrides:
      (layoutJson.moduleOverrides as Record<
        string,
        SnapshotModuleOverride
      >) ?? {},
    modules: Array.isArray(layoutJson.modules)
      ? (layoutJson.modules as CabinetModule[])
      : [],
    roomBounds: (layoutJson.roomBounds as RoomBounds | null) ?? null,
    roomMeta: (layoutJson.roomMeta as RoomMeta | null) ?? null,
    lineItemSlugs: Array.isArray(styleJson.lineItemSlugs)
      ? (styleJson.lineItemSlugs as string[])
      : [],
    photoOverlayTransform: normalizePhotoOverlayTransform(
      layoutJson.photoOverlayTransform,
    ),
  };
}
