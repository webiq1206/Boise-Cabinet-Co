"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EstimateTuner } from "./DesignSummaryPanel";

interface EstimateTunerContextValue {
  tuner: EstimateTuner;
  onTunerChange: (patch: Partial<EstimateTuner>) => void;
}

const EstimateTunerContext = createContext<EstimateTunerContextValue | null>(
  null,
);

/**
 * Shares the cost tuners (size override, construction tier) across every
 * summary surface (desktop sidebar, mobile sheet, review step) so a change in
 * one place is reflected everywhere instantly.
 */
export function EstimateTunerProvider({ children }: { children: ReactNode }) {
  const [tuner, setTuner] = useState<EstimateTuner>({
    construction: "better",
  });
  const onTunerChange = useCallback((patch: Partial<EstimateTuner>) => {
    setTuner((prev) => ({ ...prev, ...patch }));
  }, []);
  const value = useMemo(() => ({ tuner, onTunerChange }), [tuner, onTunerChange]);
  return (
    <EstimateTunerContext.Provider value={value}>
      {children}
    </EstimateTunerContext.Provider>
  );
}

export function useEstimateTuner(): EstimateTunerContextValue {
  const ctx = useContext(EstimateTunerContext);
  if (!ctx) {
    throw new Error(
      "useEstimateTuner must be used within an EstimateTunerProvider",
    );
  }
  return ctx;
}
