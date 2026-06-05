"use client";

import { useEffect } from "react";
import { DetailsStep } from "./DetailsStep";
import { HelpHint } from "../HelpHint";
import { useDesignStudio } from "../DesignStudioProvider";
import { HARDWARE_OPTIONS as CATALOG_HARDWARE } from "@/shared/catalog/hardware";

const DEFAULT_HARDWARE = CATALOG_HARDWARE.find((h) =>
  ["pull", "knob", "handleless"].includes(h.category),
);

/**
 * Optional "Finishing touches" step: hardware + storage accessories + notes,
 * merged into one screen. Nothing here is required - Continue is always enabled.
 */
export function ExtrasStep() {
  const { design, updateDesign } = useDesignStudio();

  // Start with a popular hardware default so the recap is never empty.
  useEffect(() => {
    if (!design.hardware && DEFAULT_HARDWARE) {
      updateDesign({ hardware: DEFAULT_HARDWARE.slug });
    }
  }, [design.hardware, updateDesign]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-md border border-dashed bg-muted/40 p-3">
        <p className="text-sm text-muted-foreground">
          These are optional. Pick hardware and smart storage if you like, or
          just press Continue, you can finalize anything here with your
          designer.
        </p>
        <HelpHint label="About finishing touches">
          Hardware and storage accessories each add a small premium to the
          planning estimate. None of it is required to get your quote.
        </HelpHint>
      </div>
      <DetailsStep
        embedded
        show={{ hardware: true, accessories: true, notes: true }}
      />
    </div>
  );
}
