"use client";

import { VisualizeStep } from "./VisualizeStep";
import { SaveStep } from "./SaveStep";
import { wizardCopy } from "@/shared/designStudioCopy";

export function FinishStep() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Preview & <em className="brc-accent text-accent">save</em>
        </h2>
        <p className="text-muted-foreground mt-2">{wizardCopy.finishHint}</p>
      </div>
      <VisualizeStep embedded />
      <SaveStep embedded />
    </div>
  );
}
