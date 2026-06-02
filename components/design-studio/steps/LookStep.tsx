"use client";

import { useEffect } from "react";
import { StyleStep } from "./StyleStep";
import { DetailsStep } from "./DetailsStep";
import { useDesignStudio } from "../DesignStudioProvider";
import { HARDWARE_OPTIONS as CATALOG_HARDWARE } from "@/shared/catalog/hardware";
import { wizardCopy } from "@/shared/designStudioCopy";

const DEFAULT_HARDWARE = CATALOG_HARDWARE.find((h) =>
  ["pull", "knob", "handleless"].includes(h.category),
);

export function LookStep() {
  const { design, updateDesign } = useDesignStudio();

  useEffect(() => {
    if (!design.hardware && DEFAULT_HARDWARE) {
      updateDesign({ hardware: DEFAULT_HARDWARE.slug });
    }
  }, [design.hardware, updateDesign]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Pick your <em className="brc-accent text-accent">look</em>
        </h2>
        <p className="text-muted-foreground mt-2">{wizardCopy.lookHint}</p>
      </div>
      <StyleStep embedded />
      <DetailsStep embedded />
    </div>
  );
}
