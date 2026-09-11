import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SplitSection } from "@/components/marketing/SplitSection";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { ConstructionExplorer } from "@/components/catalog/ConstructionExplorer";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema, generateServiceSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";

const STANDARDS = [
  {
    title: "Plywood box construction",
    body: "Cabinet boxes are built from furniture-grade plywood, not particle board, for screw holding power, moisture resistance, and long-term stability in Idaho's dry climate and seasonal humidity swings.",
  },
  {
    title: "Precision door machining",
    body: "Doors are CNC-routed and hand-finished in our Meridian shop. Hinge boring, overlay, and reveal tolerances are verified against your approved shop drawings before assembly.",
  },
  {
    title: "Drawer boxes & slides",
    body: "Dovetail hardwood or plywood drawer boxes sized to your layout. Soft-close slides are standard on our Custom Cabinets.",
  },
  {
    title: "Soft-close hinges",
    body: "Our Custom Cabinets include soft-close hinges on doors and soft-close drawer slides as standard.",
  },
  {
    title: "Installation & warranty",
    body: "Treasure Valley installation by our crew, not outsourced day labor. Our Custom Cabinets carry a limited lifetime warranty to the original homeowner, documented in your contract.",
  },
  {
    title: "Written scope before build",
    body: "You approve shop drawings, finishes, and hardware selections before production. Line-item scopes support permits, appraisals, and builder coordination across Ada and Canyon counties.",
  },
];

export const metadata = catalogMetadata(
  "/construction",
  "Frameless Cabinet Construction",
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
    generateServiceSchema(
      "Custom Cabinet Construction & Installation",
      "Frameless cabinet boxes, dovetail drawers, soft-close hardware, and professional installation, built and installed by Boise Cabinet Co across the Treasure Valley, Idaho.",
    ),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <CinematicHero
          image={MARKETING_IMAGES.construction}
          alt="CNC cabinet door machining and inspection"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Construction" }]}
          eyebrow="Quality"
          title={<>
                  Frameless cabinet{" "}
                  <em className="brc-accent text-accent">construction</em>
                </>}
          description={catalogDescription(
                "{company} cabinets are engineered and built in Meridian, Idaho, with materials and methods chosen for daily use in Treasure Valley homes, not showroom-only display.",
              )}
        >
              <Button variant="brand" asChild>
                <Link href="/compare">
                  Compare collections <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/catalog">View collections</Link>
              </Button>
        </CinematicHero>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <ConstructionExplorer />
          </div>
        </Section>

        <Section divider>
          <SplitSection header={<SectionHeader
              eyebrow="Built to last"
              title={<>What goes into every order</>}
              className="mb-0"
            />}>
            <div className="ed-grid-balance grid md:grid-cols-2 gap-6">
              {STANDARDS.map((item) => (
                <MarketingCard key={item.title}>
                  <h3 className="text-lg font-serif tracking-tight mb-2">
                    {item.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{item.body}</p>
                </MarketingCard>
              ))}
            </div>
          </SplitSection>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
