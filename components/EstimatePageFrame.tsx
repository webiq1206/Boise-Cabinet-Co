"use client";

import { P5Estimator } from "@/components/P5Estimator";

/**
 * The estimate route loads the estimator with the page instead of a second
 * dynamic import. The shared estimator file stays unchanged.
 */
export function EstimatePageFrame() {
  return (
    <section id="calculator" style={{ minWidth: 0 }}>
      <P5Estimator layout="page" headingAs="h2" />
    </section>
  );
}
