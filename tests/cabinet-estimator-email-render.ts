/**
 * Stored cabinet estimate fixtures for email render tests and screenshots.
 * Amounts are the saved preliminary range. Nothing here reprices a job, and nothing is sent.
 */
import {createHash} from "node:crypto";
import {issueRecord} from "../lib/p5/estimateDocument.ts";
import {estimateEmail} from "../lib/p5/estimateEmail.ts";
import {emailBrandFrom, renderEmail} from "../lib/p5/emailKit.ts";
import {emptyIntakeDetails, type IntakeSnapshot} from "../lib/p5/intakeContract.ts";
import {routeIntake} from "../lib/p5/intakePolicy.ts";
import {renderIntakeEmail} from "../lib/p5/intakeEmail.ts";
import {ESTIMATOR_BRAND} from "../lib/p5/brand.ts";
import {estimatorFromAddress} from "../lib/p5/deliveryAdapter.ts";

export const EMAIL_FROM = "P5 Home Co <hello@p5homeco.com>";
export const LEGAL_LINE = "Boise Cabinet Co is a DBA of P5 Home Co, LLC.";

const ID = "0f1e2d3c-4b5a-4000-8000-00000000abcd";

export type CabinetEmailFixture = {
  id: string;
  service: "cabinet-product" | "cabinet-install" | "change-order" | "rush";
  low: number | null;
  high: number | null;
  contractPrice: number | null;
  name: string;
  phone: string;
  uploads: {name: string; url?: string}[];
};

export const CABINET_EMAIL_FIXTURES: CabinetEmailFixture[] = [
  {
    id: "cabinet-product-small",
    service: "cabinet-product",
    low: 2400,
    high: 4800,
    contractPrice: 3600,
    name: "Ada Cabinet",
    phone: "(208) 555-0101",
    uploads: [],
  },
  {
    id: "cabinet-install-mid",
    service: "cabinet-install",
    low: 18000,
    high: 42000,
    contractPrice: 28000,
    name: "Bea Install",
    phone: "",
    uploads: [],
  },
  {
    id: "cabinet-product-major",
    service: "cabinet-product",
    low: 82000,
    high: 110000,
    contractPrice: 96000,
    name: "Cam Wholehome",
    phone: "(208) 555-0103",
    uploads: [],
  },
  {
    id: "cabinet-install-uploads",
    service: "cabinet-install",
    low: 15000,
    high: 22000,
    contractPrice: 18000,
    name: "Dee Uploads",
    phone: "(208) 555-0104",
    uploads: [
      {name: "kitchen-elevation.pdf", url: "https://boisecabinet.co/admin/p5-estimators"},
      {name: "existing-run.jpg", url: "https://boisecabinet.co/admin/p5-estimators"},
    ],
  },
  {
    id: "cabinet-change-withheld",
    service: "change-order",
    low: null,
    high: null,
    contractPrice: null,
    name: "Eve <script>Change",
    phone: "(208) 555-0105",
    uploads: [],
  },
];

function money(amount: number): string {
  return amount.toLocaleString("en-US", {style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0});
}

export function storedRangeLabel(fixture: CabinetEmailFixture): {low: string; high: string} | null {
  if (fixture.low == null || fixture.high == null) return null;
  return {low: money(fixture.low), high: money(fixture.high)};
}

function recordFor(fixture: CabinetEmailFixture) {
  const contact = {name: fixture.name, email: "cabinet.customer@example.com", phone: fixture.phone};
  const scope = {
    text: "Supply and install painted shaker kitchen cabinets.",
    answers: {service: fixture.service, location: "Meridian, ID", finish: "mid-range"},
    uploads: fixture.uploads,
    uncertainFields: [] as string[],
  };
  const issue = issueRecord({
    brandId: ESTIMATOR_BRAND.id,
    id: ID,
    revision: 2,
    now: new Date("2026-11-15T16:00:00Z"),
    contact,
    scope,
  });
  const priced = fixture.low != null && fixture.high != null;
  const customer = priced
    ? {
        range: {low: fixture.low, high: fixture.high},
        categoryRanges: [{category: "Cabinets", low: fixture.low, high: fixture.high}],
        lineItems: [{id: "cab-1", category: "Cabinets", description: "Painted shaker base cabinets", quantity: 1, unit: "EA", low: fixture.low, high: fixture.high}],
        exclusions: ["Appliances"],
        assumptions: [],
        issue,
      }
    : {range: null, categoryRanges: [], lineItems: [], exclusions: [], assumptions: [], issue};
  const internal = {
    service: fixture.service,
    lines: priced
      ? [{id: "l1", trade: "Cabinets", category: "materials", description: "Painted shaker base cabinets", quantity: 1, unit: "EA", unitCost: 1000, cost: 1000, evidence: {basis: "owner-estimating-schedule", reference: "Owner book; PB-12-02-02"}}]
      : [],
    directCost: priced ? 1000 : 0,
    contractPrice: fixture.contractPrice ?? undefined,
    publishable: priced,
    warnings: [],
  };
  return {contact, scope, customer, internal, uploads: fixture.uploads};
}

export type RenderedEmail = {id: string; kind: "admin" | "customer"; html: string; text: string; from: string};

export function renderCabinetEstimate(fixture: CabinetEmailFixture): {admin: RenderedEmail; customer: RenderedEmail} {
  const record = recordFor(fixture);
  const customer = estimateEmail(ID, record, false);
  const admin = estimateEmail(ID, record, true);
  const from = estimatorFromAddress();
  return {
    customer: {id: fixture.id, kind: "customer", html: customer.html, text: customer.text, from},
    admin: {id: fixture.id, kind: "admin", html: admin.html, text: admin.text, from},
  };
}

export function renderCabinetIntake(): {team: {html: string; text: string; subject: string}; customer: {html: string; text: string; subject: string}} {
  const draftId = "12345678-1234-4234-8234-123456789abc";
  const snapshot: IntakeSnapshot = {
    schema: 1,
    projectId: `cabinet:${draftId}`,
    originSite: "cabinet",
    currentSite: "cabinet",
    draftId,
    revision: 1,
    contextVersion: 1,
    savedAt: "2026-11-15T16:00:00.000Z",
    contact: {name: "Ada Cabinet", email: "cabinet.customer@example.com", phone: "2085550101", preferredContact: "email"},
    details: {...emptyIntakeDetails(), desiredOutcome: "New kitchen cabinets"},
    scope: {text: "Replace the kitchen cabinets with painted shaker doors.", answers: {service: "cabinet-product"}, uploads: [], extraction: null},
    routing: routeIntake("cabinet", "cabinet-product"),
    unresolved: [],
  };
  return {team: renderIntakeEmail(snapshot, true, []), customer: renderIntakeEmail(snapshot, false, [])};
}

/** The internal delivery alert uses the same brand record as the other estimator mail. */
export function renderCabinetDeliveryAlert(): {html: string; text: string} {
  const mail = emailBrandFrom(ESTIMATOR_BRAND);
  return renderEmail({
    brand: mail,
    preheader: "Estimate delivery needs review.",
    title: "Estimate delivery needs attention",
    kicker: ID.slice(0, 8),
    blocks: [
      {type: "notice", kind: "review", text: "Do not resubmit the lead to retry delivery."},
      {type: "section", title: "Delivery", rows: [{label: "Reference", value: ID}, {label: "Reason", value: "Delivery failed"}]},
      {type: "buttons", items: [{label: "Open the estimator admin", href: `${mail.siteUrl}/admin/p5-estimators`, variant: "primary"}]},
    ],
    footerNote: "Internal delivery alert.",
  });
}

export function sha256(bytes: Buffer | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}
