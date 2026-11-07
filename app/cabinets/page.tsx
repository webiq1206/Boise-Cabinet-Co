import { heroImageAttrs, InteriorPage } from '@/components/approved/InteriorLayout';
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { AboveFoldActions } from "@/components/marketing/AboveFoldActions";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { CABINETS_HUB_HEADLINE } from "@/lib/aboveFoldHeadlines";
import { Section } from "@/components/marketing/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import { buildCanonical } from "@/lib/page-metadata";
import { generateBreadcrumbSchema,generateWebPageSchema } from "@/lib/schema";
import { getCollectionBySlug,ROOM_CATEGORIES } from "@/shared/catalog";
import { roomLabel } from "@/shared/cabinetNav";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { ShortCopy } from "@/components/marketing/ShortCopy";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = withBrandPageMetadata({
  ...catalogMetadata(
  "/cabinets",
  "Cabinet Catalog by Room",
  catalogDescription(
    "Browse custom cabinets by room, kitchen, bath, laundry, mudroom, and more. {company} builds and installs cabinetry across the Treasure Valley.",
  ),
),
  // Explicit self canonical in the page file, so a change to the metadata
  // wrapper can never silently drop it.
  alternates: { canonical: buildCanonical("/cabinets") },
}, "/cabinets");

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
      <div className="flex flex-col ">
        <CinematicHero
          className="interior-hero-cabinets-hub interior-hero-fit"
          image={MARKETING_IMAGES.cabinetsHero}
          alt="Kitchen with white painted Shaker cabinets, a white oak island, black hardware and a shiplap range wall"
          breadcrumbs={[{ name: "Home", href: "/" }, { name: "Cabinets" }]}
          eyebrow="Product catalog"
          title={CABINETS_HUB_HEADLINE}
          // Owner requirement (e2e/mobile-above-fold.spec.ts): call and text stay
          // in the first phone screen. They now follow the one primary action as
          // its quiet secondary line, and the hero copy comes first on phones.
          actions={<AboveFoldActions />}
          description={catalogDescription(
            "Explore how {company} designs and builds cabinetry for every space in your Treasure Valley home, from primary kitchens to garage storage.",
          )}
        >
          <Button variant="brand" asChild>
            <Link href="/estimate">
              Request a quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </CinematicHero>
        <Section surface="dark" spacing="sm">
          <div className="ed-shell">
            <CatalogSearch className="max-w-xl" />
            <p className="mt-4 text-base leading-relaxed">
              Kitchens, vanities and built-ins start with <Link href="/">Boise cabinets</Link>.
            </p>
          </div>
        </Section>

        {/* WAS twelve identical cards in a three-column grid. NOW the lead room as
            a photo panel and the other eleven as a hairline matrix, the same
            pattern the homepage uses, so the catalog reads as one composed
            object rather than a wall of boxes. */}
        <section className="interior-service-grid" aria-label="Cabinet rooms">{ROOM_CATEGORIES.map((room,index)=><Link className={index===0?"interior-service-card interior-service-card--featured":"interior-service-card"} href={`/cabinets/${room.slug}`} key={room.id}><img {...heroImageAttrs(room.heroImage)} alt={room.imageAlt ?? `${room.name} cabinetry`} width={900} height={675} loading="lazy"/><div><h2>{roomLabel(room.name)}</h2><ArrowRight size={18} aria-hidden="true"/></div><ShortCopy text={room.description}/></Link>)}</section>

        <CatalogClosingCTA />
      </div>
    </></InteriorPage>
  );
}
