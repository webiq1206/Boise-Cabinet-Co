"use client";

import { useEffect } from "react";
import { DetailsStep } from "./DetailsStep";
import { HelpHint } from "../HelpHint";
import { useDesignStudio } from "../DesignStudioProvider";
import { HARDWARE_OPTIONS as CATALOG_HARDWARE } from "@/shared/catalog/hardware";

const DEFAULT_HARDWARE = CATALOG_HARDWARE.find((h) =>
  ["pull", "knob", "handleless"].includes(h.category),
);

export function HardwareStep() {
  const { design, updateDesign } = useDesignStudio();

  // Start with a popular default so the visitor never lands on an empty step.
  useEffect(() => {
    if (!design.hardware && DEFAULT_HARDWARE) {
      updateDesign({ hardware: DEFAULT_HARDWARE.slug });
    }
  }, [design.hardware, updateDesign]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <p className="text-sm text-muted-foreground">
          Optional. We start you with a popular pull, change it here or finalize
          handles during your free consultation.
        </p>
        <HelpHint label="About hardware">
          Decorative knobs and pulls are confirmed at consultation and priced
          with your final quote. Handleless options keep a clean, modern face.
        </HelpHint>
      </div>
      <DetailsStep embedded show={{ hardware: true }} />
    </div>
  );
}
