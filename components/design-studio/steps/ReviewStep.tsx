"use client";

import { DesignSummaryPanel } from "../DesignSummaryPanel";
import { useEstimateTuner } from "../EstimateTunerContext";
import { useIsDesktop } from "@/hooks/use-media-query";
import { RoomStepLivePreview } from "../RoomStepLivePreview";
import { VisualizeStep } from "./VisualizeStep";
import { SaveStep } from "./SaveStep";
import { gotoDesignStep } from "@/lib/design/designSteps";

/** Keep the estimate first; visual design tools remain optional. */
export function ReviewStep() {
  const { tuner, onTunerChange } = useEstimateTuner();
  const isDesktop = useIsDesktop();

  return (
    <div className="space-y-6">
      <SaveStep embedded />
      <details className="rounded-md border p-4">
        <summary className="cursor-pointer font-medium">Preview your design and layout checks</summary>
        <div className="mt-4 space-y-6">
          {!isDesktop && <RoomStepLivePreview />}
          <VisualizeStep embedded />
          {!isDesktop && <DesignSummaryPanel variant="review" tuner={tuner} onTunerChange={onTunerChange} onNavigate={gotoDesignStep} />}
        </div>
      </details>
    </div>
  );
}
