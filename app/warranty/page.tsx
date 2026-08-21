import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { CATALOG_CONTENT } from "@/shared/catalog";

// Boise-authored warranty content. Coverage points are written by Boise Cabinet
// Co and grounded in CATALOG_CONTENT.warrantySummary - no third-party warranty
// text is linked or republished.
const COVERED = [
  "Cabinet boxes against defects in materials and workmanship",
  "Doors and drawer fronts against manufacturing defects",
  "Hardware we supply: hinges and drawer slides under normal use",
  "Coverage for the lifetime of original home ownership",
];

const CONDITIONS = [
  "Coverage applies to the original homeowner at the installation address",
  "Door warping is covered only within the first 180 days",
  "Normal use, care, and a stable indoor environment are required",
  "Claims are administered directly by Boise Cabinet Co",
];

const EXCLUDED = [
  "Damage from moisture, heat, or chemical exposure",
  "Improper installation by others or later modifications",
  "Normal wear, color variation, and aging of natural materials",
  "Customer-supplied appliances, fixtures, or third-party hardware",
];

export const metadata = catalogMetadata(
  "/warranty",
  "Warranty",
  catalogDescription(
    "{company}'s limited lifetime cabinet warranty: what's covered, the conditions, and how to file a claim in the Treasure Valley.",
  ),
);

export default function WarrantyPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Warranty",
      description: `${CATALOG_CONTENT.warrantyHeadline} from ${SITE_CONFIG.name}.`,
      url: "/warranty",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Warranty", url: "/warranty" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-4 md:pt-6">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Warranty" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Our promise"
              title={
                <>
                  {CATALOG_CONTENT.warrantyHeadline.replace(/warranty$/i, "")}
                  <em className="brc-accent text-accent">warranty</em>
                </>
              }
              description={CATALOG_CONTENT.warrantySummary}
            />
            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="brand" asChild>
                <Link href="/estimate">
                  Get an Estimate <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/construction">How we build</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-4xl">
            <SectionHeader
              eyebrow="Coverage"
              title={<>What the warranty covers</>}
              align="center"
              className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid md:grid-cols-3 gap-6">
              <MarketingCard>
                <h3 className="text-lg font-sans font-light tracking-tight mb-3">Covered</h3>
                <ul className="space-y-2">
                  {COVERED.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 mt-0.5 flex-shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </MarketingCard>
              <MarketingCard>
                <h3 className="text-lg font-sans font-light tracking-tight mb-3">Conditions</h3>
                <ul className="space-y-2">
                  {CONDITIONS.map((item) => (
                    <li key={item} className="text-base text-muted-foreground leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </MarketingCard>
              <MarketingCard>
                <h3 className="text-lg font-sans font-light tracking-tight mb-3">Not covered</h3>
                <ul className="space-y-2">
                  {EXCLUDED.map((item) => (
                    <li key={item} className="text-base text-muted-foreground leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </MarketingCard>
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Claims"
              title={<>How to file a claim</>}
              align="left"
              className="mb-6"
            />
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              If something isn&apos;t right, reach out to {SITE_CONFIG.name} directly. Every claim is
              reviewed and administered by our team - not a distant manufacturer. Keep your contract
              and approved shop drawings handy; they document the finishes, hardware, and scope your
              warranty is tied to.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Most cabinet orders are produced within {CATALOG_CONTENT.leadTime} of an approved
              design, and your warranty begins at installation. Replacement parts are matched to your
              original selections whenever possible.
            </p>
          </div>
        </Section>

        <Section variant="inverse">
          <div className="container px-4 text-center max-w-lg mx-auto">
            <p className="text-inverse-muted mb-4">
              Questions about coverage for your project? We&apos;re happy to walk you through it.
            </p>
            <Button variant="brand" asChild>
              <Link href="/#consult">Talk to our team</Link>
            </Button>
          </div>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
