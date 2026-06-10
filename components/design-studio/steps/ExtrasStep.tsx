"use client";

import { DetailsStep } from "./DetailsStep";
import { HelpHint } from "../HelpHint";

/**
 * Optional "Finishing touches" step: hardware + storage accessories + notes,
 * merged into one screen. Nothing here is required - Continue is always
 * enabled and nothing is pre-selected (hardware adds a premium, so an
 * auto-pick would silently inflate the planning range).
 */
export function ExtrasStep() {
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
