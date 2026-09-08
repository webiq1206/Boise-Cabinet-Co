import { MARKETING_IMAGES } from "@/shared/siteImages";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Section } from "@/components/marketing/Section";
import { CinematicHero } from "@/components/marketing/CinematicHero";
import { CatalogClosingCTA } from "@/components/catalog/CatalogClosingCTA";
import { CatalogSearch } from "@/components/catalog/CatalogSearch";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { ROOM_CATEGORIES } from "@/shared/catalog";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { getCollectionBySlug } from "@/shared/catalog";

export const metadata = catalogMetadata(
  "/cabinets",
  "Cabinet Catalog by Room",
  catalogDescription(
    "Browse custom cabinets by room, kitchen, bath, laundry, mudroom, and more. {company} builds and installs cabinetry across the Treasure Valley.",
  ),
);

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
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        <CinematicHero
          image={MARKETING_IMAGES.designStudio}
          alt="Finish samples and door styles laid out in the Boise Cabinet Co design studio"
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
        <Section surface="deep" spacing="xl" edge>
          <div className="ed-shell">
            <Reveal>
              <p className="ed-eyebrow">Rooms</p>
              <h2 className="ed-h2 ed-statement-wide">Twelve room categories</h2>
              <p className="ed-body mt-6">
                Each room page outlines typical cabinet types and our recommended collection line.
              </p>
            </Reveal>

            {lead && (
              <Reveal delay={60}>
                <Link
                  href={`/cabinets/${lead.slug}`}
                  className="ed-zoom group mt-[clamp(40px,5vw,72px)] grid overflow-hidden lg:grid-cols-[1.2fr_0.8fr]"
                  style={{ border: "1px solid var(--ed-line)" }}
                >
                  <div className="relative min-h-[clamp(280px,38vw,460px)] overflow-hidden">
                    <Image
                      src={lead.heroImage}
                      alt={`${lead.name} custom cabinets`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover img-brand-grade"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-[clamp(28px,3.4vw,56px)]">
                    <p className="ed-eyebrow ed-eyebrow-accent">Most requested</p>
                    <h2 className="ed-h2-sm">{lead.name}</h2>
                    <p className="ed-body mt-5">{lead.description}</p>
                    <p className="ed-small mt-5">Suggested line: {leadCollection?.name ?? "Custom Cabinets"}</p>
                    <span className="ed-link ed-link-accent mt-8 self-start">
                      Explore {lead.name.toLowerCase()} cabinets
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            )}

            <Reveal delay={100}>
              <div
                className="ed-matrix ed-matrix-hover mt-[clamp(32px,4vw,56px)]"
                style={{ ["--ed-cols" as string]: 4, ["--ed-cell-h" as string]: "220px" }}
              >
                {rest.map((room) => {
                  const collection = getCollectionBySlug(room.defaultCollectionId);
                  return (
                    <Link key={room.id} href={`/cabinets/${room.slug}`} className="group flex flex-col justify-between">
                      <span className="self-end transition-transform group-hover:translate-x-1">
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span>
                        <h2 className="ed-h4">{room.name}</h2>
                        <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-[1.6]" style={{ color: "inherit", opacity: 0.72 }}>
                          {room.description}
                        </p>
                        <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.16em]" style={{ color: "inherit", opacity: 0.6 }}>
                          {collection?.name ?? "Custom Cabinets"}
                        </p>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </Section>
        <CatalogClosingCTA />
      </div>
    </>
  );
}
