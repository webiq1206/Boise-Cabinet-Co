"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { DESIGN_STEP_IDS, canAdvanceStep } from "@/lib/design/designSteps";
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
import { trackDesignEvent } from "@/lib/design/designAnalytics";
import {
  useDesignDraftAutosave,
  readLocalDraft,
  clearLocalDraft,
  DRAFT_ID_STORAGE_KEY,
  type DraftSaveState,
} from "@/hooks/use-design-draft-autosave";
import { useToast } from "@/hooks/use-toast";
import type { PhotoOverlayTransform } from "@/lib/design/photoOverlayTransform";
import {
  ACCESSORY_FAMILY_BY_SLUG,
  CABINET_PRODUCT_BY_SLUG,
  HARDWARE_OPTIONS,
  getDoorStyleBySlug,
  getFinishBySlug,
  resolveDoorStyleSlug,
  resolveFinishSlug,
} from "@/shared/catalog";
import { getCabinetNeedLabel } from "@/shared/catalog/cabinetLabels";

/** Plain-English recap of every catalog selection, for the pricing/consultation payload. */
export function buildSelectionsSummary(d: DesignState): string {
  const lines: string[] = [];
  if (d.doorStyle) {
    const door = getDoorStyleBySlug(resolveDoorStyleSlug(d.doorStyle));
    lines.push(`Door style: ${door?.name ?? d.doorStyle}`);
  }
  if (d.finish) {
    const finish = getFinishBySlug(resolveFinishSlug(d.finish)) ?? getFinishBySlug(d.finish);
    lines.push(`Finish: ${finish?.name ?? d.finish}`);
  }
  if (d.hardware) {
    const hw = HARDWARE_OPTIONS.find((h) => h.slug === d.hardware);
    lines.push(`Hardware: ${hw?.name ?? d.hardware}`);
  }
  if (d.accessories.length > 0) {
    const names = d.accessories.map(
      (slug) => ACCESSORY_FAMILY_BY_SLUG[slug]?.name ?? slug.replace(/-/g, " "),
    );
    lines.push(`Accessories: ${names.join(", ")}`);
  }
  if (d.lineItemSlugs.length > 0) {
    const names = d.lineItemSlugs.map((slug) => {
      const product = CABINET_PRODUCT_BY_SLUG[slug];
      return product ? `${product.name} (${getCabinetNeedLabel(product)})` : slug.replace(/-/g, " ");
    });
    lines.push(`Cabinets: ${names.join("; ")}`);
  }
  return lines.join("\n");
}

const VERSION_GROUP_STORAGE_KEY = "brc-design-version-group";
export const PORTAL_PROJECT_STORAGE_KEY = "brc-portal-project-id";

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
  /** OSC catalog product slugs selected for this design */
  lineItemSlugs: string[];
  photoOverlayTransform: PhotoOverlayTransform | null;
}

const initialState: DesignState = {
  roomType: null,
  // Single custom-built offering; auto-selected so the wizard never asks the
  // visitor to "choose a line" when there is only one.
  collection: "custom",
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
  lineItemSlugs: [],
  photoOverlayTransform: null,
};

/** Rebuild a full editor state from a persisted/autosaved snapshot. */
function stateFromSnapshot(
  s: DesignSnapshot,
  extra?: Partial<DesignState>,
): DesignState {
  return {
    ...initialState,
    roomType: s.roomType,
    collection: s.collection ?? "custom",
    layout: (s.layout as LayoutType | null) ?? null,
    doorStyle: s.doorStyle,
    finish: s.finish,
    hardware: s.hardware,
    accessories: s.accessories ?? [],
    notes: s.notes ?? "",
    photoUrl: s.photoUrl,
    designName: s.designName ?? "",
    moduleOverrides: s.moduleOverrides ?? {},
    modules: s.modules ?? [],
    roomBounds: s.roomBounds ?? null,
    roomMeta: s.roomMeta ?? null,
    selectedModuleId: null,
    lineItemSlugs: s.lineItemSlugs ?? [],
    photoOverlayTransform: s.photoOverlayTransform ?? null,
    ...extra,
  };
}

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
  saveDesign: () => Promise<{
    id: string;
    shareToken: string;
    linkedProjectId?: string | null;
  } | null>;
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
  /** Portal project id from ?projectId= (persisted for saves). */
  portalProjectId: string | null;
  /** Current autosave status for the in-progress draft. */
  autosaveState: DraftSaveState;
  /** Epoch ms of the last successful autosave, or null. */
  autosaveLastSavedAt: number | null;
  /** Stable anonymous draft id for cross-device resume. */
  draftId: string | null;
  /** Resume URL (`/design-studio?draft=...`) for QR / share, or null. */
  resumeUrl: string | null;
  /** True while an existing draft is being loaded (suppresses autosave). */
  isHydrating: boolean;
}

const DesignStudioContext = createContext<DesignStudioContextValue | null>(null);

export function DesignStudioProvider({
  children,
  projectId: projectIdFromUrl,
}: {
  children: ReactNode;
  projectId?: string | null;
}) {
  const [design, setDesign] = useState<DesignState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [versions, setVersions] = useState<SavedVersion[]>([]);
  const [versionGroupId, setVersionGroupId] = useState<string | null>(null);
  const [portalProjectId, setPortalProjectId] = useState<string | null>(
    projectIdFromUrl ?? null,
  );
  const [isHydrating, setIsHydrating] = useState(true);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (projectIdFromUrl) {
      setPortalProjectId(projectIdFromUrl);
      window.localStorage.setItem(PORTAL_PROJECT_STORAGE_KEY, projectIdFromUrl);
      return;
    }
    const stored = window.localStorage.getItem(PORTAL_PROJECT_STORAGE_KEY);
    if (stored) setPortalProjectId(stored);
  }, [projectIdFromUrl]);

  // One-time hydration: resume an explicit cloud draft (?draft=/?resume=), or
  // silently restore the local autosave mirror so a refresh never loses work.
  const hydrationRan = useRef(false);
  useEffect(() => {
    if (hydrationRan.current || typeof window === "undefined") return;
    hydrationRan.current = true;

    const params = new URLSearchParams(window.location.search);
    const remoteDraftId = params.get("draft") || params.get("resume");

    const finish = () => setIsHydrating(false);

    if (remoteDraftId) {
      // Adopt the incoming draft id so further edits continue the same draft.
      window.localStorage.setItem(DRAFT_ID_STORAGE_KEY, remoteDraftId);
      fetch(`/api/designs/draft?draftId=${encodeURIComponent(remoteDraftId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          const snapshot = data?.snapshot as DesignSnapshot | undefined;
          if (snapshot) {
            setDesign(stateFromSnapshot(snapshot));
            toast({
              title: "Design resumed",
              description: "Picked up right where you left off.",
            });
          }
        })
        .catch(() => {
          /* fall back to a fresh studio */
        })
        .finally(finish);
      return;
    }

    const { snapshot } = readLocalDraft();
    if (snapshot && (snapshot.roomType || snapshot.layout || snapshot.photoUrl)) {
      setDesign(stateFromSnapshot(snapshot));
      toast({
        title: "Welcome back",
        description: "We restored your in-progress design.",
      });
    }
    finish();
  }, [toast]);

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
    clearLocalDraft();
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
      const id = DESIGN_STEP_IDS[step];
      if (!id) return false;
      return canAdvanceStep(design, id);
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
      lineItemSlugs: d.lineItemSlugs,
      photoOverlayTransform: d.photoOverlayTransform,
    };
  }, []);

  // Debounced anonymous autosave (cloud + localStorage mirror). Paused while an
  // existing draft is hydrating so we never overwrite it with the empty default.
  const autosaveSnapshot = useMemo(() => toSnapshot(design), [design, toSnapshot]);
  const { draftId, saveState: autosaveState, lastSavedAt: autosaveLastSavedAt } =
    useDesignDraftAutosave(autosaveSnapshot, {
      enabled: !isHydrating,
      projectId: portalProjectId,
    });

  useEffect(() => {
    if (typeof window === "undefined" || !draftId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("draft", draftId);
    url.hash = "";
    setResumeUrl(url.toString());
  }, [draftId]);

  const saveDesign = useCallback(async () => {
    const payload = designToPayload(toSnapshot(design), {
      projectId: portalProjectId,
    });
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
      return {
        id: data.id,
        shareToken: data.shareToken,
        linkedProjectId: data.linkedProjectId ?? null,
      };
    } catch {
      trackDesignEvent("save_failed");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [design, portalProjectId, toSnapshot, updateDesign]);

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
      const payload = designToPayload(snapshot, {
        versionGroupId: groupId,
        projectId: portalProjectId,
      });
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
    [design, versions.length, versionGroupId, portalProjectId, toSnapshot, updateDesign],
  );

  const loadVersion = useCallback(
    (id: string) => {
      const version = versions.find((v) => v.id === id);
      if (!version) return;
      setDesign(
        stateFromSnapshot(version.snapshot, {
          designName: version.name,
          savedDesignId: version.id,
          shareToken: version.shareToken,
        }),
      );
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
              hardware: design.hardware,
              accessories: design.accessories,
              cabinets: design.lineItemSlugs,
            },
            selectionsSummary: buildSelectionsSummary(design),
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
      portalProjectId,
      autosaveState,
      autosaveLastSavedAt,
      draftId,
      resumeUrl,
      isHydrating,
    }),
    [
      design,
      portalProjectId,
      autosaveState,
      autosaveLastSavedAt,
      draftId,
      resumeUrl,
      isHydrating,
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
