"use client";

import { StyleStep } from "./StyleStep";
import { HelpHint } from "../HelpHint";

export function FinishStep() {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2">
        <p className="text-sm text-muted-foreground">
          Choose your color and sheen. Swatches are grouped by matte, woodgrain,
          and high-gloss. Your 3D preview updates instantly.
        </p>
        <HelpHint label="How finish affects cost">
          Matte tones are core-priced; woodgrain and high-gloss, and deeper
          designer colors, sit in higher price tiers ($$ to $$$).
        </HelpHint>
      </div>
      <StyleStep embedded section="finish" />
    </div>
  );
}
