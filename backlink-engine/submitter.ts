/**
 * Directory / review-platform submission PREP. Generates the exact, consistent
 * NAP payload and step list for an approved listing.
 *
 * The honest compliance line: this does NOT create accounts, solve CAPTCHAs, or
 * submit forms on the user's behalf. Those steps stay human. Automating them at
 * scale is both against most platforms' terms and a footprint risk. Where a
 * directory offers a legitimate data API, that integration can be added here.
 */

import { SITE } from "./config";
import type { Opportunity } from "./types";

export interface SubmissionPrep {
  domain: string;
  targetUrl: string;
  napPayload: Record<string, string>;
  steps: string[];
  compliance: string;
}

export function prepareSubmission(opp: Opportunity): SubmissionPrep {
  return {
    domain: opp.domain,
    targetUrl: `https://${opp.domain}`,
    napPayload: {
      businessName: SITE.name,
      website: `https://${SITE.domain}`,
      phone: SITE.phone,
      street: SITE.address.street,
      city: SITE.address.city,
      region: SITE.address.region,
      postalCode: SITE.address.postalCode,
      country: SITE.address.country,
      primaryCategory: "Custom Cabinets",
      categories: "Cabinet Maker, Kitchen Remodeler, Cabinetry",
      serviceArea: SITE.serviceArea.join(", "),
    },
    steps: [
      `Open ${opp.domain} and find its add/claim-a-business flow.`,
      "Enter the NAP payload verbatim — identical name, phone, and address everywhere is what builds citation trust.",
      "Add website, categories, and service area; upload logo/photos if supported.",
    ],
    compliance:
      "Account creation, CAPTCHA, and final submission are completed by a human. No automated account creation or CAPTCHA solving.",
  };
}
