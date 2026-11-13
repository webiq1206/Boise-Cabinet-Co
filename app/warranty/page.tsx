import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { PhotoBreak } from "@/components/marketing/PhotoBreak";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SplitSection } from "@/components/marketing/SplitSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema,generateWebPageSchema } from "@/lib/schema";
import {
  CABINET_WORKMANSHIP_SCOPE,
  CABINET_WORKMANSHIP_WARRANTY,
  FINAL_COMPLETION_EXPLAINED,
  MANUFACTURER_WARRANTY_PASS_THROUGH,
  publicText,
  showLifetimeWarranty,
  SUBCONTRACTOR_HELP_LINE,
} from "@/shared/claims";
import { CATALOG_CONTENT } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ENRICHMENT_IMAGES, MARKETING_IMAGES } from "@/shared/siteImages";
import { ArrowRight,Check } from "lucide-react";
import Link from "next/link";

// Boise-authored warranty content. Coverage points are written by Boise Cabinet
// Co and grounded in CATALOG_CONTENT.warrantySummary - no third-party warranty
// text is linked or republished.
const COVERED = [
  "Installation workmanship performed by our own team, for one year from documented Final Completion",
  "Cabinet boxes, doors and drawer fronts against manufacturing defects, under the manufacturer's product terms",
  "Hardware we supply: hinges and drawer slides under normal use, under the manufacturer's product terms",
];

const CONDITIONS = [
  "Work performed by a subcontractor or installation partner is covered by that company's own warranty",
  "At the end of every project we provide a complete list of the subcontractors who worked on it, with their contact information",
  "Product coverage, including door and finish terms, follows the manufacturer's warranty for your cabinet line",
  "Transfer terms follow your signed agreement",
  "Normal use, care, and a stable indoor environment are required",
  "Claims are administered directly by Boise Cabinet Co",
  FINAL_COMPLETION_EXPLAINED,
  "Your signed agreement sets the notice method for a formal warranty claim",
];

const EXCLUDED = [
  "Damage from moisture, heat, or chemical exposure",
  "Improper installation by others or later modifications",
  "On supply-only orders, the workmanship of another installer",
  "Normal wear, color variation, and aging of natural materials",
  "Customer-supplied appliances, fixtures, or third-party hardware",
];

const WARRANTY_META_SOURCE =
  "Cabinet warranty from {company}: 1-year workmanship coverage on our installation from documented Final Completion, manufacturer terms on products we supply, and claims handled by us.";

/** Existing-customer help. Uses only the published brand email and phone; no other support channel is invented. */
const HELP_DETAILS = [
  "Your name",
  "The project address",
  "The affected item and where it is",
  "When it started",
  "A short description of what is happening",
  "Photos, if you have them",
];

const HELP_MAILTO = `mailto:${SITE_CONFIG.email}?subject=${encodeURIComponent(
  "Help with a completed project",
)}&body=${encodeURIComponent(
  "Name:\nProject address:\nAffected item and location:\nWhen it started:\nWhat is happening:\nPhotos: attached if available\n",
)}`;

export const metadata = withBrandPageMetadata({
  ...catalogMetadata(
  "/warranty",
  "Cabinet Warranty | 1-Year Workmanship",
  catalogDescription(
    publicText(WARRANTY_META_SOURCE) ||
      `${MANUFACTURER_WARRANTY_PASS_THROUGH}. ${CABINET_WORKMANSHIP_WARRANTY}.`,
  ),
),
  // Explicit self canonical in the page file, so a change to the metadata
  // wrapper can never silently drop it.
  alternates: { canonical: buildCanonical("/warranty") },
}, "/warranty");

export default function WarrantyPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet warranty",
      description: showLifetimeWarranty()
        ? `${CATALOG_CONTENT.warrantyHeadline} from ${SITE_CONFIG.name}.`
        : `${MANUFACTURER_WARRANTY_PASS_THROUGH}. ${CABINET_WORKMANSHIP_WARRANTY}.`,
      url: "/warranty",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Warranty", url: "/warranty" },
    ]),
  ];

  return (
    <InteriorPage kind="warranty"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        <CinematicHero
          image={MARKETING_IMAGES.hardware}
          alt="White oak kitchen with flat-panel cabinets, black bar pulls and a long waterfall island, with tall windows facing the foothills"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Warranty" }]}
          eyebrow="Our promise"
          title={showLifetimeWarranty() ? <>
                  {CATALOG_CONTENT.warrantyHeadline.replace(/warranty$/i, "")}
                  <em className="brc-accent text-accent">warranty</em>
                </> : <>Cabinet warranty: claims <em className="brc-accent text-accent">handled by us</em></>}
          description={showLifetimeWarranty()
            ? CATALOG_CONTENT.warrantySummary
            : `${CABINET_WORKMANSHIP_WARRANTY}. Manufacturer and product warranties are separate and follow the manufacturer's terms. Tell us what is wrong and we help you through the claim.`}
        >
              <Button variant="brand" asChild>
                <Link href="#get-help">
                  Get help with a completed project <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/construction">How we build</Link>
              </Button>
        </CinematicHero>

        {/* Coverage as a hairline matrix under the heading: three cells across the
            full shell, so each list has room instead of three squeezed cards beside
            a heading column. */}
        <Section variant="greige" divider>
          <div className="ed-shell">
            <p className="ed-eyebrow">Coverage</p>
            <h2 className="ed-h2 ed-statement">What the warranty covers</h2>
            <div className="ed-matrix mt-10" style={{ '--ed-cols': '3', '--ed-cell-h': '0' } as React.CSSProperties}>
              <div>
                <h3 className="ed-h3 mb-5">Covered</h3>
                <ul className="grid gap-3">
                  {COVERED.filter((item) => publicText(item)).map((item) => (
                    <li key={item} className="ed-body flex items-start gap-3 text-[0.9375rem]">
                      <Check className="h-4 w-4 mt-1 flex-shrink-0 text-accent" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="ed-h3 mb-5">Conditions</h3>
                <ul className="grid gap-3">
                  {CONDITIONS.map((item) => (
                    <li key={item} className="ed-body text-[0.9375rem]">{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="ed-h3 mb-5">Not covered</h3>
                <ul className="grid gap-3">
                  {EXCLUDED.map((item) => (
                    <li key={item} className="ed-body text-[0.9375rem]">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Section>

        <PhotoBreak
          src="/images/approved/drawer-oak.webp"
          alt="Natural oak drawer with organized utensil storage, the everyday detail the warranty covers"
          caption="Coverage is tied to the finishes and hardware on your approved shop drawings."
        />

        <Section divider id="get-help" className="scroll-mt-24">
          <SplitSection header={<SectionHeader
              eyebrow="Existing customers"
              title={<>Get help with a completed project</>}
              align="left"
              className="mb-0"
            />}>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              If something isn&apos;t right with cabinets we installed or supplied, email or call {SITE_CONFIG.name} directly.
              {" "}{MANUFACTURER_WARRANTY_PASS_THROUGH}. Please include:
            </p>
            <ul className="grid gap-2 mb-4">
              {HELP_DETAILS.map((item) => (
                <li key={item} className="ed-body flex items-start gap-3 text-[0.9375rem]">
                  <Check className="h-4 w-4 mt-1 flex-shrink-0 text-accent" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              <a href={HELP_MAILTO} className="font-medium underline underline-offset-2">Email {SITE_CONFIG.email}</a>
              {" "}or{" "}
              <a href={SITE_CONFIG.phoneHref} className="font-medium underline underline-offset-2">call {SITE_CONFIG.phone}</a>.
              We review what you send, look at it in person when needed, explain what we find, and plan any covered correction with you.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Email and calls are the everyday way to reach us. Your signed agreement sets the notice method for a
              formal warranty claim, so follow it as well. If there is immediate danger, such as a gas smell, an active
              water leak or an electrical hazard, contact emergency services or your utility first.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              Keep your contract and approved shop drawings handy; they document the finishes, hardware, and scope your
              warranty is tied to. {CABINET_WORKMANSHIP_SCOPE}. {SUBCONTRACTOR_HELP_LINE}.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Most cabinet orders are produced within {CATALOG_CONTENT.leadTime} of an approved
              design. Your workmanship coverage begins at documented Final Completion, and replacement parts are matched
              to your original selections whenever possible.
            </p>
          </SplitSection>
        </Section>
        <CatalogClosingCTA />
      </div>
    </></InteriorPage>
  );
}
