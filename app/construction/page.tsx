import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { ConstructionExplorer } from "@/components/catalog/ConstructionExplorer";
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
import { generateBreadcrumbSchema,generateServiceSchema,generateWebPageSchema } from "@/lib/schema";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ENRICHMENT_IMAGES, MARKETING_IMAGES } from "@/shared/siteImages";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const STANDARDS = [
  {
    title: "Box and side construction",
    body: "Structural boxes use moisture-resistant panel stock with matching edgebanding. Exposed sides are 3/4 inch birch plywood for screw holding power and long-term stability in Idaho's dry climate and seasonal humidity swings.",
  },
  {
    title: "Precision door machining",
    body: "Doors are machined and finished to your approved shop drawings. Hinge boring, overlay, and reveal tolerances are verified before assembly.",
  },
  {
    title: "Drawer boxes & slides",
    body: "Drawer boxes sized to your layout. Soft-close slide options are available.",
  },
  {
    title: "Soft-close hinges",
    body: "Our Custom Cabinets offer soft-close hinge and drawer-slide options.",
  },
  {
    title: "Installation and warranty",
    body: "Treasure Valley installation by our own crew. Warranty claims are handled by us under a 2-year workmanship warranty on cabinet installation. Manufacturer coverage on boxes and hardware is administered through our team.",
  },
  {
    title: "Written scope before build",
    body: "You approve shop drawings, finishes, and hardware selections before production. Line-item scopes support permits, appraisals, and builder coordination across Ada and Canyon counties.",
  },
];

export const metadata = withBrandPageMetadata({
  ...catalogMetadata(
  "/construction",
  "How our cabinets are built",
  catalogDescription(
    "How {company} builds custom cabinets: frameless options, plywood sides and drawers, soft-close hardware, and professional installation in the Treasure Valley.",
  ),
),
  // Explicit self canonical in the page file, so a change to the metadata
  // wrapper can never silently drop it.
  alternates: { canonical: buildCanonical("/construction") },
}, "/construction");

export default function ConstructionPage() {
  const schemas = [
    generateWebPageSchema({
      title: "How our cabinets are built",
      description: `Cabinet construction quality from ${SITE_CONFIG.name}.`,
      url: "/construction",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Construction", url: "/construction" },
    ]),
    generateServiceSchema(
      "Custom Cabinet Construction & Installation",
      "Cabinet boxes with frameless and soft-close options, and professional installation, designed and installed by Boise Cabinet Co across the Treasure Valley, Idaho.",
    ),
  ];

  return (
    <InteriorPage kind="construction"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        <CinematicHero
          image={MARKETING_IMAGES.construction}
          alt="Large kitchen with white oak cabinets, a walnut island and a vaulted wood ceiling | Boise Cabinet Co"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Construction" }]}
          eyebrow="Quality"
          title={<>
                  How our cabinets{" "}
                  <em className="brc-accent text-accent">are built</em>
                </>}
          description={catalogDescription(
                "{company} designs custom cabinets to your measurements, builds each order to your layout, finishes and hardware, and installs it with our own Treasure Valley crew.",
              )}
        >
              <Button variant="brand" asChild>
                <Link href="/estimate">
                  Request a quote <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="brandOutline" asChild>
                <Link href="/compare">Compare collections</Link>
              </Button>
        </CinematicHero>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <ConstructionExplorer />
          </div>
        </Section>

        <PhotoBreak
          src={ENRICHMENT_IMAGES.constructionDetail}
          alt="Frameless plywood cabinet box with dovetail drawer and soft-close slide detail"
          caption="Box, drawer, hinge and finish specifications published per cabinet line."
        />

        <Section divider>
          <SplitSection header={<SectionHeader
              eyebrow="Built to last"
              title={<>What goes into every order</>}
              className="mb-0"
            />}>
            <div className="ed-grid-balance grid md:grid-cols-2 gap-6">
              {STANDARDS.slice(0, 3).map((item) => (
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

        <PhotoBreak
          src={ENRICHMENT_IMAGES.drawerHardware}
          alt="Natural oak dovetail drawer with soft-close slide and organized utensil storage"
          caption="Hardware you feel every day, checked before installation."
        />

        <Section variant="greige" divider>
          <SplitSection header={<SectionHeader
              eyebrow="Install & accountability"
              title={<>From approved design to your home</>}
              className="mb-0"
            />}>
            <div className="ed-grid-balance grid md:grid-cols-2 gap-6">
              {STANDARDS.slice(3).map((item) => (
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
    </></InteriorPage>
  );
}
