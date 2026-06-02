"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { LayoutSlug } from "@/shared/catalog/layouts";

/** Room slug from shared/catalog/roomCategories */
export type RoomType = string;

/** Collection slug from shared/catalog/collections */
export type CabinetCollection = string;

export type LayoutType = LayoutSlug;

/** Door style slug from shared/catalog/doorStyles */
export type DoorStyle = string;

/** Finish slug from shared/catalog/finishes */
export type FinishOption = string;

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
};

interface DesignStudioContextValue {
  design: DesignState;
  updateDesign: (patch: Partial<DesignState>) => void;
  resetDesign: () => void;
  isStepComplete: (step: number) => boolean;
  saveDesign: () => Promise<{ id: string; shareToken: string } | null>;
  submitPricingRequest: (contact: {
    name: string;
    email: string;
    phone: string;
    message?: string;
  }) => Promise<boolean>;
  isSaving: boolean;
}

const DesignStudioContext = createContext<DesignStudioContextValue | null>(null);

export function DesignStudioProvider({ children }: { children: ReactNode }) {
  const [design, setDesign] = useState<DesignState>(initialState);
  const [isSaving, setIsSaving] = useState(false);

  const updateDesign = useCallback((patch: Partial<DesignState>) => {
    setDesign((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDesign = useCallback(() => {
    setDesign(initialState);
  }, []);

  const isStepComplete = useCallback(
    (step: number) => {
      switch (step) {
        case 0:
          return design.roomType !== null;
        case 1:
          return design.collection !== null;
        case 2:
          return design.layout !== null;
        case 3:
          return design.doorStyle !== null && design.finish !== null;
        case 4:
          return design.hardware !== null;
        case 5:
          return true;
        case 6:
          return design.roomType !== null && design.collection !== null;
        default:
          return false;
      }
    },
    [design],
  );

  const saveDesign = useCallback(async () => {
    if (!design.roomType || !design.collection) return null;
    setIsSaving(true);
    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomType: design.roomType,
          collectionId: design.collection,
          name: design.designName || `My ${design.roomType} design`,
          photoUrl: design.photoUrl ?? undefined,
          layoutJson: {
            layout: design.layout,
            accessories: design.accessories,
          },
          styleJson: {
            doorStyle: design.doorStyle,
            finish: design.finish,
            hardware: design.hardware,
            accessories: design.accessories,
            notes: design.notes,
          },
        }),
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
  }, [design, updateDesign]);

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
      isStepComplete,
      saveDesign,
      submitPricingRequest,
      isSaving,
    }),
    [
      design,
      updateDesign,
      resetDesign,
      isStepComplete,
      saveDesign,
      submitPricingRequest,
      isSaving,
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
