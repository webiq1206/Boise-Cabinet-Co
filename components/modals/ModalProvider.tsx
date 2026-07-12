"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EstimateCalculator } from "@/components/EstimateCalculator";

interface ModalsContextValue {
  /** Open the quote flow on the contact step ("just talk to us"). */
  openConsult: () => void;
  /** Open the quote flow from the start (resuming any saved progress). */
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
  const [open, setOpen] = useState(false);
  // "contact" deep-links to the booking step; undefined resumes saved progress.
  const [startStep, setStartStep] = useState<"contact" | undefined>(undefined);

  const openConsult = useCallback(() => {
    setStartStep("contact");
    setOpen(true);
  }, []);
  const openEstimate = useCallback(() => {
    setStartStep(undefined);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <ModalsContext.Provider value={{ openConsult, openEstimate, close }}>
      {children}

      <Dialog open={open} onOpenChange={(v) => !v && close()}>
        {/* Bounded flex column so the estimator fills exactly the dialog and pins
            its own CTA — the quote flow never scrolls the page or the dialog. */}
        <DialogContent className="flex max-w-4xl w-[100vw] sm:w-[95vw] h-[100dvh] sm:h-[min(88dvh,720px)] flex-col overflow-hidden rounded-none p-4 sm:rounded-lg sm:p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle className="font-sans font-light text-xl text-foreground">
              Get your free quote
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Build your planning range in about two minutes, then book a free in-home visit.
              No obligation, no spam.
            </DialogDescription>
          </DialogHeader>
          {/* Remount per open so the deep-link step + saved progress apply cleanly. */}
          <div className="min-h-0 flex-1">
            {open && <EstimateCalculator inModal startStep={startStep} />}
          </div>
        </DialogContent>
      </Dialog>
    </ModalsContext.Provider>
  );
}
