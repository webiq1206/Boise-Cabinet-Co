"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DesignSnapshot } from "@/lib/design/designSerialization";

export const DRAFT_ID_STORAGE_KEY = "brc-design-draft-id";
export const DRAFT_SNAPSHOT_STORAGE_KEY = "brc-design-draft";

export type DraftSaveState = "idle" | "saving" | "saved" | "error";

interface UseDesignDraftAutosaveOptions {
  /** When false, autosave is paused (e.g. while hydrating an existing draft). */
  enabled?: boolean;
  /** Links the cloud draft to a portal project when present. */
  projectId?: string | null;
  /** Debounce window before persisting, ms. */
  debounceMs?: number;
}

export interface DesignDraftAutosave {
  draftId: string | null;
  saveState: DraftSaveState;
  lastSavedAt: number | null;
  /** Force an immediate save, bypassing the debounce. */
  saveNow: () => void;
}

function createDraftId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** True when nothing meaningful has been chosen yet (skip persisting empties). */
function isEmptySnapshot(s: DesignSnapshot): boolean {
  return (
    !s.roomType &&
    !s.layout &&
    !s.doorStyle &&
    !s.finish &&
    !s.photoUrl &&
    (!s.modules || s.modules.length === 0)
  );
}

/** Read a locally mirrored draft snapshot, if any. Safe on the server. */
export function readLocalDraft(): {
  draftId: string | null;
  snapshot: DesignSnapshot | null;
} {
  if (typeof window === "undefined") return { draftId: null, snapshot: null };
  try {
    const draftId = window.localStorage.getItem(DRAFT_ID_STORAGE_KEY);
    const raw = window.localStorage.getItem(DRAFT_SNAPSHOT_STORAGE_KEY);
    const snapshot = raw ? (JSON.parse(raw) as DesignSnapshot) : null;
    return { draftId, snapshot };
  } catch {
    return { draftId: null, snapshot: null };
  }
}

/** Clear the locally mirrored draft (e.g. after Start over). */
export function clearLocalDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(DRAFT_SNAPSHOT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Debounced, anonymous autosave for the Design Studio. Mirrors every change to
 * localStorage for instant offline restore and pushes the snapshot to
 * `/api/designs/draft` so it can be resumed on another device via the draftId.
 */
export function useDesignDraftAutosave(
  snapshot: DesignSnapshot,
  { enabled = true, projectId, debounceMs = 1500 }: UseDesignDraftAutosaveOptions = {},
): DesignDraftAutosave {
  const [draftId, setDraftId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<DraftSaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  const timerRef = useRef<number | null>(null);
  const lastSerializedRef = useRef<string>("");
  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  // Ensure a stable draftId exists for this browser.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let id = window.localStorage.getItem(DRAFT_ID_STORAGE_KEY);
    if (!id) {
      id = createDraftId();
      window.localStorage.setItem(DRAFT_ID_STORAGE_KEY, id);
    }
    setDraftId(id);
  }, []);

  const persist = useCallback(
    async (id: string, serialized: string, snap: DesignSnapshot) => {
      // Instant local mirror first, so a refresh never loses work.
      try {
        window.localStorage.setItem(DRAFT_SNAPSHOT_STORAGE_KEY, serialized);
      } catch {
        /* storage may be full or blocked; cloud save still attempted */
      }
      setSaveState("saving");
      try {
        const res = await fetch("/api/designs/draft", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draftId: id,
            snapshot: snap,
            projectId: projectId ?? undefined,
          }),
        });
        if (!res.ok) throw new Error("draft save failed");
        setSaveState("saved");
        setLastSavedAt(Date.now());
      } catch {
        // Local mirror already succeeded, so the user has not lost anything.
        setSaveState("error");
      }
    },
    [projectId],
  );

  useEffect(() => {
    if (!enabled || !draftId) return;
    if (isEmptySnapshot(snapshot)) return;
    const serialized = JSON.stringify(snapshot);
    if (serialized === lastSerializedRef.current) return;
    lastSerializedRef.current = serialized;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void persist(draftId, serialized, snapshot);
    }, debounceMs);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [snapshot, enabled, draftId, debounceMs, persist]);

  const saveNow = useCallback(() => {
    if (!draftId) return;
    const snap = snapshotRef.current;
    if (isEmptySnapshot(snap)) return;
    const serialized = JSON.stringify(snap);
    lastSerializedRef.current = serialized;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    void persist(draftId, serialized, snap);
  }, [draftId, persist]);

  return { draftId, saveState, lastSavedAt, saveNow };
}
