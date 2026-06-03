"use client";

import { VisualizeStep } from "./VisualizeStep";
import { wizardCopy } from "@/shared/designStudioCopy";

export function PreviewStep() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          {wizardCopy.previewStepTitle.split(" ")[0]}{" "}
          <em className="brc-accent text-accent">design</em>
        </h2>
        <p className="text-muted-foreground mt-2">{wizardCopy.previewStepHint}</p>
      </div>
      <VisualizeStep embedded />
    </div>
  );
}
