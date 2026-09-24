import { InteriorPage } from '@/components/approved/InteriorLayout';
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { Section } from "@/components/marketing/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema,generateWebPageSchema } from "@/lib/schema";
import { getCollectionBySlug,ROOM_CATEGORIES } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = withBrandPageMetadata((catalogMetadata(
  "/cabinets",
  "Cabinet Catalog by Room",
  catalogDescription(
    "Browse custom cabinets by room, kitchen, bath, laundry, mudroom, and more. {company} builds and installs cabinetry across the Treasure Valley.",
  ),
)), "/cabinets");

export default function CabinetsHubPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Catalog",
      description: `Custom cabinets by room from ${SITE_CONFIG.name}.`,
      url: "/cabinets",
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinets", url: "/cabinets" },
    ]),
  ];

  const [lead, ...rest] = ROOM_CATEGORIES;
  const leadCollection = lead ? getCollectionBySlug(lead.defaultCollectionId) : undefined;

  return (
    <InteriorPage kind="cabinets"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <CinematicHero
          image={MARKETING_IMAGES.designStudio}
          alt="display of cabinet finish samples and door styles"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Cabinets" }]}
          eyebrow="Product catalog"
          title={<>Cabinets by <em className="not-italic" style={{ color: "var(--ed-accent)" }}>room</em></>}
          description={catalogDescription(
            "Explore how {company} designs and builds cabinetry for every space in your Treasure Valley home, from primary kitchens to garage storage.",
          )}
        >
          <Button variant="brand" asChild>
            <Link href="/estimate">
              Get an estimate <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CinematicHero>
        <Section surface="dark" spacing="sm">
          <div className="ed-shell">
            <CatalogSearch className="max-w-xl" />
          </div>
        </Section>

        {/* WAS twelve identical cards in a three-column grid. NOW the lead room as
            a photo panel and the other eleven as a hairline matrix, the same
            pattern the homepage uses, so the catalog reads as one composed
            object rather than a wall of boxes. */}
        <section className="interior-service-grid" aria-label="Cabinet rooms">{ROOM_CATEGORIES.map(room=><Link className="interior-service-card" href={`/cabinets/${room.slug}`} key={room.id}><img src={room.heroImage} alt={`${room.name} cabinetry`} width={900} height={675} loading="lazy"/><div><h2>{room.name}</h2><ArrowRight size={18} aria-hidden="true"/></div><p>{room.description}</p><p className="interior-price">Suggested line: {getCollectionBySlug(room.defaultCollectionId)?.name ?? 'Custom Cabinets'}</p></Link>)}</section>
        <CatalogClosingCTA />
      </div>
    </></InteriorPage>
  );
}
