"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { DesignSummaryPanel } from "../DesignSummaryPanel";
import { useEstimateTuner } from "../EstimateTunerContext";
import { useIsDesktop } from "@/hooks/use-media-query";
import { RoomStepLivePreview } from "../RoomStepLivePreview";
import { VisualizeStep } from "./VisualizeStep";
import { SaveStep } from "./SaveStep";
import { gotoDesignStep, isCoreDesignComplete } from "@/lib/design/designSteps";
import { CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Merged "Review & estimate" final step: a recap on top, a 3D look, then the
 * contact form whose button is the single primary CTA for the whole flow.
 */
export function ReviewStep() {
  const { design } = useDesignStudio();
  const { tuner, onTunerChange } = useEstimateTuner();
  const isDesktop = useIsDesktop();

  const ready = isCoreDesignComplete({
    roomType: design.roomType,
    roomMeta: design.roomMeta,
    layout: design.layout,
    doorStyle: design.doorStyle,
    finish: design.finish,
    hardware: design.hardware,
    accessories: design.accessories,
    lineItemSlugs: design.lineItemSlugs,
    pricingSubmitted: design.pricingSubmitted,
  });

  return (
    <div className="space-y-6">
      <div
        className={
          "flex items-start gap-2 rounded-md border p-3 text-sm " +
          (ready
            ? "border-primary/30 bg-primary/5"
            : "border-amber-500/30 bg-amber-500/10")
        }
        role="status"
      >
        {ready ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        ) : (
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        )}
        <p>
          {ready
            ? "Your design is complete. Review it below, then send it to get your estimate and book a free consultation."
            : "A few key choices are still open. Use Edit in the summary to finish them, then send your request below."}
        </p>
      </div>

      {/* On desktop the 3D preview lives in the sticky sidebar; on mobile we add
          it here so Review always offers a 3D look (without a second canvas). */}
      {!isDesktop && <RoomStepLivePreview />}

      <VisualizeStep embedded />

      {/* On desktop the recap lives in the sticky sidebar; show it inline only
          on smaller screens so the review step isn't duplicated. */}
      {!isDesktop && (
        <DesignSummaryPanel
          variant="review"
          tuner={tuner}
          onTunerChange={onTunerChange}
          onNavigate={gotoDesignStep}
        />
      )}

      <SaveStep embedded />
    </div>
  );
}
