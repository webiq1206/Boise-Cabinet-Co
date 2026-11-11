"use client";

import { QuoteRequestForm } from "@/components/quote/QuoteRequestForm";
import { track, trackGoogleAdsLeadOnce } from "@/lib/analytics/track";

/**
 * The quote form on /estimate, /kitchen-cabinets, /builders and the built-ins
 * room page: the family short form (components/quote/QuoteRequestForm.tsx).
 * It was a four-step name, phone, email, project sequence; it is now the
 * two-step form (one short screen, then optional details and files on the
 * success screen) with the same field names, the same /api/consultation
 * request, the same "context: project" project type and the same Google Ads
 * lead event, plus lead_details_added (counts only) when Step 2 is saved.
 */
const QUOTE_STORAGE_KEY = "brc_estimate_quote_v1";

export function KitchenCabinetsQuoteForm({
  context,
  projectPrompt,
  idPrefix = "kc",
  heading = "h2",
  dock = false,
  showPhone = true,
}: {
  context?: "built-ins" | "builder-contractor" | "cabinet-project";
  projectPrompt?: string;
  /** Stable field ids; "kc" is the /estimate form's ("#kc-name"). */
  idPrefix?: string;
  /** "Request a quote" / "Request a call" heading; null where the page H1 already says it. */
  heading?: "h2" | "h3" | null;
  /** /estimate only: the send button docks to the bottom of the screen. */
  dock?: boolean;
  /** False where the page already shows the phone beside the form (/estimate). */
  showPhone?: boolean;
} = {}) {
  return (
    <QuoteRequestForm
      idPrefix={idPrefix}
      headingLevel={heading}
      context={context}
      freeTextProjectType
      projectPlaceholder={projectPrompt}
      // The four-step form kept this tab's draft; the one screen keeps doing so.
      persistKey={`${QUOTE_STORAGE_KEY}${idPrefix === "kc" ? "" : `:${idPrefix}`}`}
      dock={dock}
      showPhone={showPhone}
      onAccepted={({ submissionId, replayed }) => {
        if (!replayed) trackGoogleAdsLeadOnce(submissionId, { projectType: context ?? "kitchen" });
      }}
      onDetailsSaved={({ fields, files }) =>
        track("lead_details_added", { form: "estimate_quote", fields_count: fields, files_count: files })
      }
    />
  );
}
