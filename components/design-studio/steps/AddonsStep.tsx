"use client";

import { DetailsStep } from "./DetailsStep";
import { ProductLineItemsStep } from "./ProductLineItemsStep";
import { HelpHint } from "../HelpHint";

export function AddonsStep() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-2">
        <p className="text-sm text-muted-foreground">
          Optional upgrades. Add smart storage and any specific cabinets, or skip
          and continue, you can refine these with your designer.
        </p>
        <HelpHint label="About add-ons">
          Smart storage accessories and specialty cabinets each add a small
          premium to the estimate. Nothing here is required.
        </HelpHint>
      </div>
      <DetailsStep embedded show={{ accessories: true, notes: true }} />
      <ProductLineItemsStep />
    </div>
  );
}
