"use client";

/**
 * Sends the framed estimator's events to this site's own analytics.
 *
 * EstimatorFrame.tsx repeats each estimator event on this page as a
 * "p5-estimator-event" window event. This component listens and passes every
 * one to GA4 through track(), with the brand and the project and nothing else:
 * the estimator never sends a name, a phone number, an email or an address
 * across the frame, and this file adds none.
 *
 * "estimator_completed" is the only event that is a lead: the visitor gave
 * their contact details and was shown their range. On it, and on no other
 * event, this page also fires the accepted-lead conversion the quote request
 * form fires once the server accepts a request: the Google Ads lead
 * conversion (trackGoogleAdsLeadOnce), a GA4 generate_lead and the Meta Pixel
 * Lead event (owner, 13 November 2026, so Meta campaigns for the instant
 * estimate can optimize for finished estimates), all labelled
 * "instant_estimator". It fires once per page view.
 *
 * The estimator runs on another origin, so it cannot hand this page the
 * server's id for the lead. The dedupe key is made here instead: an opaque
 * random id, never contact details. The Ads helper only sends GA4
 * generate_lead for this site's own estimator keys, so generate_lead goes
 * through track() directly.
 */

import { useEffect, useRef } from "react";
import { track, trackGoogleAdsLeadOnce } from "@/lib/analytics/track";
import { trackMetaEvent } from "@/lib/analytics/metaPixel";
import type { EstimatorEventDetail } from "./EstimatorFrame";

/** The form and source label for a lead that came from the framed estimator. */
export const INSTANT_ESTIMATOR_LEAD_SOURCE = "instant_estimator";
const COMPLETED_EVENT = "estimator_completed";
const EVENT_NAME = /^estimator_[a-z_]{1,40}$/;

function opaqueId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // Fall through to the time-based id.
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export default function EstimatorAnalytics() {
  const leadSent = useRef(false);

  useEffect(() => {
    const onEstimatorEvent = (event: Event) => {
      const detail = (event as CustomEvent<EstimatorEventDetail>).detail;
      if (!detail || typeof detail.name !== "string" || !EVENT_NAME.test(detail.name)) return;
      const brand = typeof detail.brand === "string" ? detail.brand : "";
      const project = typeof detail.project === "string" ? detail.project : "";
      track(detail.name, { estimator_brand: brand, estimator_project: project });

      if (detail.name !== COMPLETED_EVENT || leadSent.current) return;
      leadSent.current = true;
      const leadId = `${INSTANT_ESTIMATOR_LEAD_SOURCE}:${opaqueId()}`;
      track("generate_lead", {
        form: INSTANT_ESTIMATOR_LEAD_SOURCE,
        lead_source: INSTANT_ESTIMATOR_LEAD_SOURCE,
        project_type: project || "unknown",
        estimator_brand: brand,
        estimator_project: project,
        event_id: leadId,
      });
      trackGoogleAdsLeadOnce(leadId, { projectType: project || INSTANT_ESTIMATOR_LEAD_SOURCE });
      // A project category and the opaque id only: no contact details.
      trackMetaEvent("Lead", { content_name: project || "unknown", content_category: INSTANT_ESTIMATOR_LEAD_SOURCE }, leadId);
    };

    window.addEventListener("p5-estimator-event", onEstimatorEvent);
    return () => window.removeEventListener("p5-estimator-event", onEstimatorEvent);
  }, []);

  return null;
}
