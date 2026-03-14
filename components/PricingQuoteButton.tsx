"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { QuoteLightbox } from "@/components/QuoteLightbox";

interface PricingQuoteButtonProps {
  serviceSlug: string;
  serviceName: string;
  testId: string;
}

export function PricingQuoteButton({ serviceSlug, serviceName, testId }: PricingQuoteButtonProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <Button
        size="sm"
        className="flex-1"
        onClick={() => setLightboxOpen(true)}
        data-testid={testId}
      >
        Get Quote
      </Button>
      <QuoteLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        preselectedService={serviceSlug}
        serviceName={serviceName}
      />
    </>
  );
}
