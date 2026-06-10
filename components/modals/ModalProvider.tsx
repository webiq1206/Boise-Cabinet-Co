"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConsultationForm } from "@/components/ConsultationForm";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { CONSULT_BULLETS } from "@/shared/siteContent";
import { Check } from "lucide-react";

type ModalType = "consult" | "estimate" | null;

interface ModalsContextValue {
  openConsult: () => void;
  openEstimate: () => void;
  close: () => void;
}

const ModalsContext = createContext<ModalsContextValue>({
  openConsult: () => {},
  openEstimate: () => {},
  close: () => {},
});

export function useModals() {
  return useContext(ModalsContext);
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<ModalType>(null);

  const openConsult = useCallback(() => setOpen("consult"), []);
  const openEstimate = useCallback(() => setOpen("estimate"), []);
  const close = useCallback(() => setOpen(null), []);

  return (
    <ModalsContext.Provider value={{ openConsult, openEstimate, close }}>
      {children}

      <Dialog open={open === "consult"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-lg w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-sans font-light text-xl text-foreground">
              Schedule your free in-home visit
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              No obligation, we&apos;ll walk your space and give you an honest planning range.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2 mb-4">
            {CONSULT_BULLETS.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                {bullet}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mb-4">
            No spam. Response within one business day.
          </p>
          <ConsultationForm onRevise={() => setOpen("estimate")} />
        </DialogContent>
      </Dialog>

      <Dialog open={open === "estimate"} onOpenChange={(v) => !v && close()}>
        <DialogContent className="max-w-4xl w-[100vw] sm:w-[95vw] max-h-[100dvh] sm:max-h-[90vh] h-[100dvh] sm:h-auto overflow-y-auto rounded-none sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-sans font-light text-xl text-foreground">
              Get your planning range
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Select your project type, finish level, and size for an instant estimate.
            </DialogDescription>
          </DialogHeader>
          <EstimateCalculator inModal onBookVisit={() => setOpen("consult")} />
        </DialogContent>
      </Dialog>
    </ModalsContext.Provider>
  );
}
