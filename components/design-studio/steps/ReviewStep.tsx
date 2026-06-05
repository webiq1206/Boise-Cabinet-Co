"use client";

import { useDesignStudio } from "../DesignStudioProvider";
import { DesignSummaryPanel } from "../DesignSummaryPanel";
import { useEstimateTuner } from "../EstimateTunerContext";
import { VisualizeStep } from "./VisualizeStep";
import { gotoDesignStep } from "@/lib/design/designSteps";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function ReviewStep() {
  const { design } = useDesignStudio();
  const { tuner, onTunerChange } = useEstimateTuner();

  const ready =
    design.roomType !== null &&
    design.layout !== null &&
    design.doorStyle !== null &&
    design.finish !== null;

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
            ? "Your design is complete. Review everything below, then continue to get your estimate and book a free consultation."
            : "A few key choices are still open. Use Edit below to finish them, then continue for your estimate."}
        </p>
      </div>

      <VisualizeStep embedded />

      <DesignSummaryPanel
        variant="review"
        tuner={tuner}
        onTunerChange={onTunerChange}
        onNavigate={gotoDesignStep}
      />
    </div>
  );
}
