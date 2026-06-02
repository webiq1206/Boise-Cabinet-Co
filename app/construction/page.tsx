import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { CatalogPageHero } from "@/components/catalog/CatalogPageHero";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";

const STANDARDS = [
  {
    title: "Plywood box construction",
    body: "Cabinet boxes are built from furniture-grade plywood, not particle board, for screw holding power, moisture resistance, and long-term stability in Idaho's dry climate and seasonal humidity swings.",
  },
  {
    title: "Precision door machining",
    body: "Doors are CNC-routed and hand-finished in our Kuna shop. Hinge boring, overlay, and reveal tolerances are verified against your approved shop drawings before assembly.",
  },
  {
    title: "Drawer boxes & slides",
    body: "Dovetail hardwood or plywood drawer boxes on premium lines; configurable dowel or dovetail options on Semi-Custom. Soft-close slides are standard on Full Custom, Semi-Custom, and Reserve.",
  },
  {
    title: "Soft-close hinges",
    body: "Every collection includes soft-close hinges on doors. Spec Grade offers soft-close drawer slides as an upgrade; other lines include them standard or as configurable packages.",
  },
  {
    title: "Installation & warranty",
    body: "Treasure Valley installation by our crew, not outsourced day labor. Workmanship warranties range from 3 years on Spec Grade to 5 years on custom lines, documented in your contract.",
  },
  {
    title: "Written scope before build",
    body: "You approve shop drawings, finishes, and hardware selections before production. Line-item scopes support permits, appraisals, and builder coordination across Ada and Canyon counties.",
  },
];

export const metadata = catalogMetadata(
  "/construction",
  "Construction Standards",
  catalogDescription(
    "How {company} builds custom cabinets, plywood boxes, dovetail drawers, soft-close hardware, and professional installation in the Treasure Valley.",
  ),
);

export default function ConstructionPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Construction Standards",
      description: `Cabinet construction quality from ${SITE_CONFIG.name}.`,
      url: "/construction",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Construction", url: "/construction" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <Section spacing="sm" className="pt-8 md:pt-12">
          <div className="container px-4 max-w-3xl">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Construction" }]} />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Quality"
              title={
                <>
                  Construction{" "}
                  <em className="brc-accent text-accent">standards</em>
                </>
              }
              description={catalogDescription(
                "{company} cabinets are engineered and built in Kuna, Idaho, with materials and methods chosen for daily use in Treasure Valley homes, not showroom-only display.",
              )}
            />
            <CatalogPageHero
              src={MARKETING_IMAGES.process}
              alt="CNC cabinet door machining and quality inspection at Boise Cabinet Co Kuna shop"
              title="Cabinet Construction Standards | Boise Cabinet Co"
            />
            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="brand" asChild>
                <Link href="/compare">
                  Compare collections <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/collections">View collections</Link>
              </Button>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-4xl">
            <SectionHeader
              eyebrow="Built to last"
              title={<>What goes into every order</>}
              align="center"
              className="mb-10 max-w-2xl mx-auto text-center [&_.brc-label]:justify-center"
            />
            <div className="grid md:grid-cols-2 gap-6">
              {STANDARDS.map((item) => (
                <MarketingCard key={item.title}>
                  <h3 className="text-lg font-sans font-light tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
                </MarketingCard>
              ))}
            </div>
          </div>
        </Section>

        <Section variant="inverse">
          <div className="container px-4 text-center max-w-lg mx-auto">
            <p className="text-inverse-muted mb-4">
              See how construction details differ by collection line.
            </p>
            <Button variant="brand" asChild>
              <Link href="/compare">Collection comparison</Link>
            </Button>
          </div>
        </Section>
      </div>
    </>
  );
}
