"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface QuoteLightboxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedService?: string;
  serviceName?: string;
}

export function QuoteLightbox({ 
  open, 
  onOpenChange, 
  preselectedService,
  serviceName 
}: QuoteLightboxProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0"
        data-testid="dialog-quote-lightbox"
      >
        <VisuallyHidden>
          <DialogTitle>
            {serviceName ? `Get a Quote for ${serviceName}` : "Get a Free Quote"}
          </DialogTitle>
        </VisuallyHidden>
        <div className="p-6">
          <SimpleQuoteWizard
            preselectedService={preselectedService}
            onClose={() => onOpenChange(false)}
            className="shadow-none border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
