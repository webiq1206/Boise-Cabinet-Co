"use client";

import { createContext, useCallback, useContext, useState } from "react";
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

      {/* The estimator is its own full-screen experience beneath the site
          header, not a form inside a dialog: it owns the screen with its own
          scroll area and bottom-anchored input, and Exit returns here. Saved
          progress resumes on its own. */}
      {open && <EstimateCalculator inModal sectionId="estimate-modal" onExit={close} startStep={startStep} />}
    </ModalsContext.Provider>
  );
}
