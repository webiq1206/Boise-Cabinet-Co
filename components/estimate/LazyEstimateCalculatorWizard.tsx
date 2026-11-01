"use client";

/**
 * The step-by-step planning wizard on /estimate, server-rendered inside its
 * closed <details> exactly as before but shipped as its own chunk. Imported
 * directly, it put the estimate engine, the catalog visuals and the product
 * catalog into the /estimate route's client modules, and every page with a
 * visible "Request a quote" link prefetches /estimate, so each of them
 * downloaded and evaluated all of it shortly after load.
 */
import dynamic from "next/dynamic";

export const LazyEstimateCalculatorWizard = dynamic(() =>
  import("@/components/estimate/EstimateCalculatorWizard").then((m) => m.EstimateCalculatorWizard),
);
