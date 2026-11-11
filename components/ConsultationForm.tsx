"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CombinedStoredEstimate,
  EstimateSelections,
  ProjectType,
  StoredEstimate,
} from "@/shared/estimateEngine";
import {
  buildCombinedConsultationPayload,
  buildCombinedStoredEstimate,
  buildConsultationEstimatePayload,
  calculateCombinedEstimate,
  mapEstimateProjectToConsultType,
} from "@/shared/estimateEngine";
import { buildEstimateRecord } from "@/shared/estimateRecord";
import { safeCombinedEstimate } from "@/shared/estimateValidation";
import { clearWizardState, loadWizardState } from "@/lib/estimate/wizardPersistence";
import { QuoteRequestForm } from "@/components/quote/QuoteRequestForm";
import { track, trackGoogleAdsLeadOnce } from "@/lib/analytics/track";
import { trackMetaLead } from "@/lib/analytics/metaPixel";
import { trackEstimatorEvent } from "@/lib/design/designAnalytics";
import { markEstimatorCompleted } from "@/lib/estimatorSession";

/**
 * Standalone consultation form for the homepage `#consult` section and the
 * contact page. It attaches whatever planning work the visitor has done:
 *
 * 1. Preferred: the full multi-room wizard state (localStorage
 *    `brc_estimate_wizard`), priced through the same engine builders the
 *    wizard's own contact step uses - so a visitor who planned three rooms
 *    submits all three here, with an identical range and the full estimate
 *    record, instead of silently losing rooms 2+.
 * 2. Fallback: the legacy single-room snapshot (sessionStorage
 *    `brc_estimate`) written by older flows.
 *
 * Style preferences from the finder (`brc_finder`) pre-fill the message.
 *
 * The homepage, the installation page and the contact page render the family
 * short form ({@link QuoteRequestForm}): what we can help with, name and
 * phone, one quiet toggle for email and how to reach you, and "Have us call
 * you" as a text link under the button; then one quiet toggle for photos,
 * plans and details on the success screen. It fires the
 * same events this form always has (form_started, form_completed, form_error,
 * the Google Ads lead with GA4 generate_lead, the Meta Lead with the shared
 * event id) exactly once at Step 1, attaches the same estimate and estimate
 * record, and fires lead_details_added (counts only) when Step 2 is saved.
 * The contact page used to keep a step-by-step form; it moved onto this one
 * (e2e/consultation-form.spec.ts drives it at the same strength).
 */
export function ConsultationForm({
  idPrefix = "qf",
}: {
  /** Stable field ids for the short form; one form per page. */
  idPrefix?: string;
} = {}) {
  const [estimate, setEstimate] = useState<StoredEstimate | null>(null);
  const [combinedEstimate, setCombinedEstimate] = useState<CombinedStoredEstimate | null>(null);
  const [estimateRooms, setEstimateRooms] = useState<EstimateSelections[] | undefined>(undefined);
  const [resolvedProjectType, setResolvedProjectType] = useState<string | undefined>(undefined);
  const [defaultProjectType, setDefaultProjectType] = useState("");
  const [defaultMessage, setDefaultMessage] = useState("");
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let reloadTimer: ReturnType<typeof setTimeout> | null = null;

    function loadEstimate() {
      try {
        // Multi-room wizard state first: the same rooms + combined range the
        // wizard's own contact step would submit.
        const wizard = loadWizardState();
        const rooms = wizard?.rooms ?? [];
        // Validated before attaching: a corrupt persisted state falls back to
        // the plain form rather than submitting a suspicious range.
        const validated = safeCombinedEstimate(
          calculateCombinedEstimate(rooms),
          rooms,
          "consultation-form",
        );
        const combined = validated ? buildCombinedStoredEstimate(rooms) : null;
        if (combined) {
          const key = `combined|${combined.priceLow}|${combined.priceHigh}|${combined.rooms
            .map((r) => `${r.projectLabel}:${r.sizeLabel}:${r.scopeSummary}`)
            .join("|")}`;
          if (key === lastKeyRef.current) return;
          lastKeyRef.current = key;
          const projects = rooms
            .map((r) => r.project)
            .filter((p): p is ProjectType => !!p);
          setCombinedEstimate(combined);
          setEstimateRooms(rooms);
          setResolvedProjectType(
            projects.length === 1
              ? mapEstimateProjectToConsultType(projects[0])
              : projects.length > 1
                ? "other"
                : undefined,
          );
          setEstimate(null);
          return;
        }

        // Legacy single-room snapshot from older flows.
        const raw = sessionStorage.getItem("brc_estimate");
        if (!raw) {
          if (lastKeyRef.current === null) return;
          lastKeyRef.current = null;
          setEstimate(null);
          setCombinedEstimate(null);
          setEstimateRooms(undefined);
          setResolvedProjectType(undefined);
          return;
        }
        const parsed: StoredEstimate = JSON.parse(raw);
        const key = `single|${parsed.project}|${parsed.scopeSummary}|${parsed.size}|${parsed.priceLow}|${parsed.priceHigh}|${parsed.confidenceLabel}`;
        if (key === lastKeyRef.current) return;
        lastKeyRef.current = key;
        setEstimate(parsed);
        setCombinedEstimate(null);
        setEstimateRooms(undefined);
        setResolvedProjectType(undefined);
      } catch {
        /* storage unavailable; non-fatal */
      }
    }

    // The wizard dispatches `brc_estimate_updated` before its own persistence
    // effect writes the wizard state, so re-read on the next tick to pick up
    // the freshly saved rooms rather than the previous ones.
    function scheduleReload() {
      if (reloadTimer) clearTimeout(reloadTimer);
      reloadTimer = setTimeout(loadEstimate, 0);
    }

    loadEstimate();
    window.addEventListener("brc_estimate_updated", scheduleReload);
    return () => {
      window.removeEventListener("brc_estimate_updated", scheduleReload);
      if (reloadTimer) clearTimeout(reloadTimer);
    };
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

  const projectFromEstimate =
    resolvedProjectType ?? (estimate?.project ? mapEstimateProjectToConsultType(estimate.project) : "");
  const estimateAttached = Boolean(combinedEstimate || estimate);
  return (
    <QuoteRequestForm
      idPrefix={idPrefix}
      defaultProjectType={projectFromEstimate || defaultProjectType}
      projectTypeLocked={Boolean(projectFromEstimate)}
      defaultMessage={defaultMessage}
      estimateAttached={estimateAttached}
      extraPayload={({ notes }) => ({
        estimate: combinedEstimate
          ? buildCombinedConsultationPayload(combinedEstimate)
          : buildConsultationEstimatePayload(estimate),
        estimateRecord: estimateRooms?.length
          ? buildEstimateRecord({
              rooms: estimateRooms,
              capturedAt: new Date().toISOString(),
              budget: "",
              notes,
              propertyAddress: "",
            })
          : null,
      })}
      onFirstFocus={() => track("form_started", { form: "consultation" })}
      onFailed={() => track("form_error", { form: "consultation" })}
      onAccepted={({ submissionId, replayed, projectType }) => {
        markEstimatorCompleted("consultation");
        try { sessionStorage.removeItem("brc_estimate"); } catch { /* Receipt remains valid without browser storage. */ }
        try { clearWizardState(); } catch { /* A saved request remains accepted when optional cleanup fails. */ }
        if (replayed) return;
        trackEstimatorEvent("estimator_lead_submitted");
        track("form_completed", { form: "consultation" });
        trackGoogleAdsLeadOnce(submissionId, { projectType });
        // The shared event id dedupes this browser Lead with the server's Conversions API Lead.
        trackMetaLead(submissionId);
      }}
      onDetailsSaved={({ fields, files }) =>
        track("lead_details_added", { form: "consultation", fields_count: fields, files_count: files })
      }
    />
  );
}
