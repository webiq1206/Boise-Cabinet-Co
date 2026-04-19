"use client";

import { useCallback, useEffect, useState } from "react";

type ExportedRecord = Record<string, string>;

function storageKey(userId: string | undefined): string | null {
  if (!userId) return null;
  return `lawnCareKuna.exportedLeads.${userId}`;
}

function readFromStorage(key: string): ExportedRecord {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      const out: ExportedRecord = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v === "string") out[k] = v;
      }
      return out;
    }
  } catch {
    // ignore parse errors
  }
  return {};
}

function writeToStorage(key: string, value: ExportedRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export function useExportedLeads(userId: string | undefined) {
  const [record, setRecord] = useState<ExportedRecord>({});

  useEffect(() => {
    const key = storageKey(userId);
    if (!key) {
      setRecord({});
      return;
    }
    setRecord(readFromStorage(key));

    // Keep in sync across tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        setRecord(readFromStorage(key));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userId]);

  const markExported = useCallback(
    (leadIds: string[]) => {
      const key = storageKey(userId);
      if (!key || leadIds.length === 0) return;
      const now = new Date().toISOString();
      setRecord(prev => {
        const next = { ...prev };
        for (const id of leadIds) next[id] = now;
        writeToStorage(key, next);
        return next;
      });
    },
    [userId],
  );

  const isExported = useCallback(
    (leadId: string) => Boolean(record[leadId]),
    [record],
  );

  const exportedAt = useCallback(
    (leadId: string): Date | null => {
      const iso = record[leadId];
      if (!iso) return null;
      const d = new Date(iso);
      return Number.isNaN(d.getTime()) ? null : d;
    },
    [record],
  );

  return { record, markExported, isExported, exportedAt };
}

export function formatExportedDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
