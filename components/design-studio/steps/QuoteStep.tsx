"use client";

import { SaveStep } from "./SaveStep";
import { wizardCopy } from "@/shared/designStudioCopy";

export function QuoteStep() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Save & <em className="brc-accent text-accent">quote</em>
        </h2>
        <p className="text-muted-foreground mt-2">{wizardCopy.saveStepHint}</p>
      </div>
      <SaveStep embedded />
    </div>
  );
}
