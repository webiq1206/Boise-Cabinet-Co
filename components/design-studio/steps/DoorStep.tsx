"use client";

import { StyleStep } from "./StyleStep";
import { HelpHint } from "../HelpHint";

export function DoorStep() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <p className="text-sm text-muted-foreground">
          The door profile sets the personality of your cabinets. Pick the look
          you love, then choose a color next.
        </p>
        <HelpHint label="How door style affects cost">
          Flat slab doors are the most affordable; detailed shaker profiles add
          a modest premium. You can change this anytime before consultation.
        </HelpHint>
      </div>
      <StyleStep embedded section="door" />
    </div>
  );
}
