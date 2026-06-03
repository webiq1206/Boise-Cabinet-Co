"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LayoutSlug } from "@/shared/catalog/layouts";
import {
  layoutToModules,
  type CabinetModule,
  type RoomBounds,
} from "@/lib/design/previewConfig";
import { hasUserRoomDimensions, type RoomMeta } from "@/lib/design/roomMeta";
import { syncRoomForModules } from "@/lib/design/syncDesignRoom";
import { estimateRoomFromPhotoAspect } from "@/lib/design/photoRoomEstimate";
import { isScannedRoom } from "@/lib/design/roomScanGeometry";
import { roomMetaToBounds } from "@/lib/design/roomMeta";
import { buildLayoutSummary } from "@/lib/design/layoutSummary";
import { fitModulesIntoRoomBounds } from "@/lib/design/fitModulesToRoom";
import {
  designToPayload,
  rowToSnapshot,
  type DesignRow,
  type DesignSnapshot,
  type SavedVersion,
} from "@/lib/design/designSerialization";

const VERSION_GROUP_STORAGE_KEY = "brc-design-version-group";

/** Room slug from shared/catalog/roomCategories */
export type RoomType = string;

/** Collection slug from shared/catalog/collections */
export type CabinetCollection = string;

export type LayoutType = LayoutSlug;

/** Door style slug from shared/catalog/doorStyles */
export type DoorStyle = string;

/** Finish slug from shared/catalog/finishes */
export type FinishOption = string;

/** Per-module style overrides keyed by module id from previewConfig. */
export interface ModuleOverride {
  doorStyle?: DoorStyle | null;
  finish?: FinishOption | null;
}

export interface DesignState {
  roomType: RoomType | null;
  collection: CabinetCollection | null;
  layout: LayoutType | null;
  doorStyle: DoorStyle | null;
  finish: FinishOption | null;
  hardware: string | null;
  accessories: string[];
  notes: string;
  photoUrl: string | null;
  designName: string;
  savedDesignId: string | null;
  shareToken: string | null;
  pricingSubmitted: boolean;
  moduleOverrides: Record<string, ModuleOverride>;
  /** Placed cabinet modules, single source of truth for 2D planner + 3D preview. */
  modules: CabinetModule[];
  /** Room rectangle the planner snaps to (meters). */
  roomBounds: RoomBounds | null;
  /** User-measured room dimensions and obstacles (inches). */
  roomMeta: RoomMeta | null;
  /** Currently selected module id, shared across the 2D planner and 3D preview. */
  selectedModuleId: string | null;
}

const initialState: DesignState = {
  roomType: null,
  collection: null,
  layout: null,
  doorStyle: null,
  finish: null,
  hardware: null,
  accessories: [],
  notes: "",
  photoUrl: null,
  designName: "",
  savedDesignId: null,
  shareToken: null,
  pricingSubmitted: false,
  moduleOverrides: {},
  modules: [],
  roomBounds: null,
  roomMeta: null,
  selectedModuleId: null,
};

interface DesignStudioContextValue {
  design: DesignState;
  updateDesign: (patch: Partial<DesignState>) => void;
  resetDesign: () => void;
  updateModuleOverride: (moduleId: string, patch: ModuleOverride) => void;
  resetModuleOverride: (moduleId: string) => void;
  resetAllModuleOverrides: () => void;
  setModules: (modules: CabinetModule[]) => void;
  updateModule: (id: string, patch: Partial<CabinetModule>) => void;
  removeModule: (id: string) => void;
  addModule: (module: CabinetModule) => void;
  resetModulesToLayout: () => void;
  setSelectedModuleId: (id: string | null) => void;
  isStepComplete: (step: number) => boolean;
  saveDesign: () => Promise<{ id: string; shareToken: string } | null>;
  submitPricingRequest: (contact: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  }) => Promise<boolean>;
  isSaving: boolean;
  /** Saved named versions in the current version group (newest first). */
  versions: SavedVersion[];
  /** Save the current design as a new named version. */
  saveVersion: (name: string) => Promise<SavedVersion | null>;
  /** Reopen a saved version into the editor. */
  loadVersion: (id: string) => void;
  /** Remove a version from the local list. */
  deleteVersion: (id: string) => void;
}

const DesignStudioContext = createContext<DesignStudioContextValue | null>(null);

export function DesignStudioProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<DesignState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [versionGroupId, setVersionGroupId] = useState<string | null>(null);

  const updateDesign = useCallback((patch: Partial<DesignState>) => {
    setDesign((prev) => {
      const next = { ...prev, ...patch };
      // Module overrides are keyed by layout-specific module ids; changing the
      // layout invalidates them, so clear them and reseed the placed modules.
      if (patch.layout !== undefined && patch.layout !== prev.layout) {
        next.moduleOverrides = {};
        next.selectedModuleId = null;
        if (patch.layout) {
          const seeded = layoutToModules(patch.layout);
          next.modules = seeded;
          const keptMeta = patch.roomMeta ?? prev.roomMeta;
          const keepRoom =
            (keptMeta?.source === "manual" && hasUserRoomDimensions(keptMeta)) ||
            isScannedRoom(keptMeta);
          if (keepRoom && keptMeta) {
            const bounds = patch.roomBounds ?? roomMetaToBounds(keptMeta);
            next.roomMeta = keptMeta;
            next.roomBounds = bounds;
            next.modules = fitModulesIntoRoomBounds(seeded, bounds);
          } else {
            const synced = syncRoomForModules({
              layout: patch.layout,
              roomType: next.roomType ?? prev.roomType,
              modules: seeded,
              roomMeta: null,
            });
            next.roomBounds = synced.roomBounds;
            next.roomMeta = synced.roomMeta;
          }
        } else {
          next.modules = [];
          next.roomBounds = null;
          next.roomMeta = null;
        }
      }
      return next;
    });
  }, []);

  const resetDesign = useCallback(() => {
    setDesign(initialState);
  }, []);

  const updateModuleOverride = useCallback(
    (moduleId: string, patch: ModuleOverride) => {
      setDesign((prev) => ({
        ...prev,
        moduleOverrides: {
          ...prev.moduleOverrides,
          [moduleId]: { ...prev.moduleOverrides[moduleId], ...patch },
        },
      }));
    },
    [],
  );

  const resetModuleOverride = useCallback((moduleId: string) => {
    setDesign((prev) => {
      const next = { ...prev.moduleOverrides };
      delete next[moduleId];
      return { ...prev, moduleOverrides: next };
    });
  }, []);

  const resetAllModuleOverrides = useCallback(() => {
    setDesign((prev) => ({ ...prev, moduleOverrides: {} }));
  }, []);

  const setModules = useCallback((modules: CabinetModule[]) => {
    setDesign((prev) => {
      const synced = syncRoomForModules({
        layout: prev.layout,
        roomType: prev.roomType,
        modules,
        roomMeta: prev.roomMeta,
      });
      return { ...prev, modules, ...synced };
    });
  }, []);

  const updateModule = useCallback(
    (id: string, patch: Partial<CabinetModule>) => {
      setDesign((prev) => {
        const modules = prev.modules.map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        );
        const synced = syncRoomForModules({
          layout: prev.layout,
          roomType: prev.roomType,
          modules,
          roomMeta: prev.roomMeta,
        });
        return { ...prev, modules, ...synced };
      });
    },
    [],
  );

  const removeModule = useCallback((id: string) => {
    setDesign((prev) => {
      const nextOverrides = { ...prev.moduleOverrides };
      delete nextOverrides[id];
      const modules = prev.modules.filter((m) => m.id !== id);
      const synced = syncRoomForModules({
        layout: prev.layout,
        roomType: prev.roomType,
        modules,
        roomMeta: prev.roomMeta,
      });
      return {
        ...prev,
        modules,
        ...synced,
        moduleOverrides: nextOverrides,
        selectedModuleId:
          prev.selectedModuleId === id ? null : prev.selectedModuleId,
      };
    });
  }, []);

  const addModule = useCallback((module: CabinetModule) => {
    setDesign((prev) => {
      const modules = [...prev.modules, module];
      const synced = syncRoomForModules({
        layout: prev.layout,
        roomType: prev.roomType,
        modules,
        roomMeta: prev.roomMeta,
      });
      return {
        ...prev,
        modules,
        ...synced,
        selectedModuleId: module.id,
      };
    });
  }, []);

  const resetModulesToLayout = useCallback(() => {
    setDesign((prev) => {
      if (!prev.layout) return prev;
      let seeded = layoutToModules(prev.layout);
      if (isScannedRoom(prev.roomMeta) && prev.roomBounds) {
        seeded = fitModulesIntoRoomBounds(seeded, prev.roomBounds);
      }
      const synced = syncRoomForModules({
        layout: prev.layout,
        roomType: prev.roomType,
        modules: seeded,
        roomMeta:
          prev.roomMeta?.source === "manual" ? prev.roomMeta : prev.roomMeta,
      });
      return {
        ...prev,
        modules: seeded,
        ...synced,
        moduleOverrides: {},
        selectedModuleId: null,
      };
    });
  }, []);

  const setSelectedModuleId = useCallback((id: string | null) => {
    setDesign((prev) => ({ ...prev, selectedModuleId: id }));
  }, []);

  const isStepComplete = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return (
            design.roomType !== null && isScannedRoom(design.roomMeta)
          );
        case 1:
          return design.layout !== null;
        case 2:
          return design.collection !== null;
        case 3:
          return design.doorStyle !== null && design.finish !== null;
        case 4:
          return (
            design.roomType !== null &&
            design.layout !== null &&
            design.collection !== null &&
            design.doorStyle !== null &&
            design.finish !== null
          );
        default:
          return false;
      }
    },
    [design],
  );

  const toSnapshot = useCallback((d: DesignState): DesignSnapshot => {
    return {
      roomType: d.roomType,
      collection: d.collection,
      layout: d.layout,
      doorStyle: d.doorStyle,
      finish: d.finish,
      hardware: d.hardware,
      accessories: d.accessories,
      notes: d.notes,
      photoUrl: d.photoUrl,
      designName: d.designName,
      moduleOverrides: d.moduleOverrides,
      modules: d.modules,
      roomBounds: d.roomBounds,
      roomMeta: d.roomMeta,
    };
  }, []);

  const saveDesign = useCallback(async () => {
    const payload = designToPayload(toSnapshot(design));
    if (!payload) return null;
    setIsSaving(true);
    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      updateDesign({ savedDesignId: data.id, shareToken: data.shareToken });
      return { id: data.id, shareToken: data.shareToken };
    } catch {
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [design, toSnapshot, updateDesign]);

  const refreshVersions = useCallback(async (groupId: string) => {
    try {
      const res = await fetch(
        `/api/designs?versionGroupId=${encodeURIComponent(groupId)}`,
      );
      if (!res.ok) return;
      const data = await res.json();
      const rows: DesignRow[] = data.versions ?? [];
      const loaded: SavedVersion[] = rows.map((row) => ({
        id: String(row.id),
        name:
          (typeof row.name === "string" && row.name) ||
          "Untitled version",
        shareToken:
          typeof row.shareToken === "string"
            ? row.shareToken
            : typeof row.share_token === "string"
              ? (row.share_token as string)
              : null,
        createdAt:
          typeof row.createdAt === "string"
            ? row.createdAt
            : typeof row.created_at === "string"
              ? (row.created_at as string)
              : new Date().toISOString(),
        snapshot: rowToSnapshot(row),
      }));
      setVersions(loaded);
    } catch {
      /* ignore, versions are a best-effort enhancement */
    }
  }, []);

  // Auto-estimate room size when a room photo is added (Layout or Visualize step).
  useEffect(() => {
    const url = design.photoUrl;
    if (
      !url ||
      !design.layout ||
      design.roomMeta?.source === "manual" ||
      isScannedRoom(design.roomMeta)
    ) {
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      const meta = estimateRoomFromPhotoAspect(
        img.naturalWidth,
        img.naturalHeight,
        design.layout,
        design.roomType,
        design.roomMeta,
      );
      setDesign((prev) => {
        if (prev.photoUrl !== url || prev.roomMeta?.source === "manual") {
          return prev;
        }
        const synced = syncRoomForModules({
          layout: prev.layout,
          roomType: prev.roomType,
          modules: prev.modules,
          roomMeta: meta,
        });
        return { ...prev, ...synced };
      });
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [design.photoUrl, design.layout, design.roomType, design.roomMeta?.source]);

  // Hydrate saved versions for a returning visitor from their last group.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(VERSION_GROUP_STORAGE_KEY);
    if (stored) {
      setVersionGroupId(stored);
      void refreshVersions(stored);
    }
  }, [refreshVersions]);

  const saveVersion = useCallback(
    async (name: string) => {
      const trimmed = name.trim() || `Version ${versions.length + 1}`;
      const snapshot = toSnapshot({ ...design, designName: trimmed });
      let groupId = versionGroupId;
      if (!groupId) {
        groupId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `grp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setVersionGroupId(groupId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(VERSION_GROUP_STORAGE_KEY, groupId);
        }
      }
      const payload = designToPayload(snapshot, { versionGroupId: groupId });
      if (!payload) return null;
      setIsSaving(true);
      try {
        const res = await fetch("/api/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Save failed");
        const data = await res.json();
        const version: SavedVersion = {
          id: String(data.id),
          name: trimmed,
          shareToken: data.shareToken ?? null,
          createdAt: new Date().toISOString(),
          snapshot,
        };
        setVersions((prev) => [version, ...prev]);
        updateDesign({
          designName: trimmed,
          savedDesignId: version.id,
          shareToken: version.shareToken,
          pricingSubmitted: false,
        });
        return version;
      } catch {
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [design, versions.length, versionGroupId, toSnapshot, updateDesign],
  );

  const loadVersion = useCallback(
    (id: string) => {
      const version = versions.find((v) => v.id === id);
      if (!version) return;
      const s = version.snapshot;
      setDesign({
        ...initialState,
        roomType: s.roomType,
        collection: s.collection,
        layout: s.layout as LayoutType | null,
        doorStyle: s.doorStyle,
        finish: s.finish,
        hardware: s.hardware,
        accessories: s.accessories ?? [],
        notes: s.notes ?? "",
        photoUrl: s.photoUrl,
        designName: version.name,
        moduleOverrides: s.moduleOverrides ?? {},
        modules: s.modules ?? [],
        roomBounds: s.roomBounds ?? null,
        roomMeta: s.roomMeta ?? null,
        savedDesignId: version.id,
        shareToken: version.shareToken,
        pricingSubmitted: false,
        selectedModuleId: null,
      });
    },
    [versions],
  );

  const deleteVersion = useCallback((id: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const submitPricingRequest = useCallback(
    async (contact: {
      name: string;
      email: string;
      phone: string;
      message?: string;
    }) => {
      setIsSaving(true);
      try {
        const res = await fetch("/api/designs/pricing-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            designId: design.savedDesignId ?? undefined,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            message: contact.message,
            roomType: design.roomType,
            collectionId: design.collection,
            styleJson: {
              doorStyle: design.doorStyle,
              finish: design.finish,
              layout: design.layout,
            },
            layoutSummary: buildLayoutSummary({
              modules: design.modules,
              roomBounds: design.roomBounds,
              roomMeta: design.roomMeta,
              layout: design.layout,
            }),
          }),
        });
        if (!res.ok) return false;
        updateDesign({ pricingSubmitted: true });
        return true;
      } catch {
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [design, updateDesign],
  );

  const value = useMemo(
    () => ({
      design,
      updateDesign,
      resetDesign,
      updateModuleOverride,
      resetModuleOverride,
      resetAllModuleOverrides,
      setModules,
      updateModule,
      removeModule,
      addModule,
      resetModulesToLayout,
      setSelectedModuleId,
      isStepComplete,
      saveDesign,
      submitPricingRequest,
      isSaving,
      versions,
      saveVersion,
      loadVersion,
      deleteVersion,
    }),
    [
      design,
      updateDesign,
      resetDesign,
      updateModuleOverride,
      resetModuleOverride,
      resetAllModuleOverrides,
      setModules,
      updateModule,
      removeModule,
      addModule,
      resetModulesToLayout,
      setSelectedModuleId,
      isStepComplete,
      saveDesign,
      submitPricingRequest,
      isSaving,
      versions,
      saveVersion,
      loadVersion,
      deleteVersion,
    ],
  );

  return (
    <DesignStudioContext.Provider value={value}>
      {children}
    </DesignStudioContext.Provider>
  );
}

export function useDesignStudio() {
  const ctx = useContext(DesignStudioContext);
  if (!ctx) {
    throw new Error("useDesignStudio must be used within DesignStudioProvider");
  }
  return ctx;
}
