"use client";

import { StyleStep } from "./StyleStep";
import { DetailsStep } from "./DetailsStep";
import { ProductLineItemsStep } from "./ProductLineItemsStep";
import { useDesignStudio } from "../DesignStudioProvider";
import { HARDWARE_OPTIONS as CATALOG_HARDWARE } from "@/shared/catalog/hardware";
import { wizardCopy } from "@/shared/designStudioCopy";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_HARDWARE = CATALOG_HARDWARE.find((h) =>
  ["pull", "knob", "handleless"].includes(h.category),
);

export function LookStep() {
  const { design, updateDesign } = useDesignStudio();
  const [extrasOpen, setExtrasOpen] = useState(false);

  useEffect(() => {
    if (!design.hardware && DEFAULT_HARDWARE) {
      updateDesign({ hardware: DEFAULT_HARDWARE.slug });
    }
  }, [design.hardware, updateDesign]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-sans font-light tracking-tight">
          Colors & <em className="brc-accent text-accent">hardware</em>
        </h2>
        <p className="text-muted-foreground mt-2">{wizardCopy.lookHint}</p>
      </div>
      <StyleStep embedded />
      <Collapsible open={extrasOpen} onOpenChange={setExtrasOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            Hardware & extras (optional)
            <ChevronDown
              className={`h-4 w-4 transition-transform ${extrasOpen ? "rotate-180" : ""}`}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-6 space-y-8">
          <ProductLineItemsStep />
          <DetailsStep embedded />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
