"use client";

import { useEffect, useRef, useState } from "react";
import type { StoredEstimate } from "@/shared/estimateEngine";
import { ConsultationFields } from "@/components/consultation/ConsultationFields";

/**
 * Standalone consultation form for the homepage `#consult` section and the
 * contact page. It reads any planning range the visitor built in the estimator
 * (sessionStorage `brc_estimate`) and any style preferences from the finder
 * (`brc_finder`), then hands them to the shared {@link ConsultationFields}.
 *
 * The unified quote flow renders {@link ConsultationFields} directly as its
 * final step, so all of the contact UI lives in one place.
 */
export function ConsultationForm() {
  const [estimate, setEstimate] = useState<StoredEstimate | null>(null);
  const [defaultProjectType, setDefaultProjectType] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("");
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    function loadEstimate() {
      try {
        const raw = sessionStorage.getItem("brc_estimate");
        if (!raw) {
          setEstimate(null);
          lastKeyRef.current = null;
          return;
        }
        const parsed: StoredEstimate = JSON.parse(raw);
        const key = `${parsed.project}|${parsed.scopeSummary}|${parsed.size}|${parsed.priceLow}|${parsed.priceHigh}|${parsed.confidenceLabel}`;
        if (key === lastKeyRef.current) return;
        lastKeyRef.current = key;
        setEstimate(parsed);
      } catch {
        /* sessionStorage unavailable; non-fatal */
      }
    }
    loadEstimate();
    window.addEventListener("brc_estimate_updated", loadEstimate);
    return () => window.removeEventListener("brc_estimate_updated", loadEstimate);
  }, []);

  // Pre-fill from the guided finder ("Find your look"), if the visitor used it.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("brc_finder");
      if (!raw) return;
      const f = JSON.parse(raw) as {
        room?: string;
        look?: string;
        mood?: string;
        recommendedDoor?: string;
        finishNames?: string[];
      };
      const roomMap: Record<string, string> = {
        kitchen: "kitchen",
        bathroom: "bathroom",
        laundry: "laundry",
        mudroom: "laundry",
        pantry: "kitchen",
      };
      if (f.room && roomMap[f.room]) {
        setDefaultProjectType(roomMap[f.room]);
      }
      const parts: string[] = [];
      if (f.look) parts.push(`Style: ${f.look}`);
      if (f.mood) parts.push(`Color mood: ${f.mood}`);
      if (f.recommendedDoor) parts.push(`Door: ${f.recommendedDoor}`);
      if (f.finishNames?.length) parts.push(`Finishes I like: ${f.finishNames.slice(0, 4).join(", ")}`);
      if (parts.length) {
        setDefaultMessage(`From the finder - ${parts.join(". ")}.`);
      }
    } catch {
      /* sessionStorage unavailable; non-fatal */
    }
  }, []);

  return (
    <ConsultationFields
      estimate={estimate}
      defaultProjectType={defaultProjectType}
      defaultMessage={defaultMessage}
    />
  );
}
