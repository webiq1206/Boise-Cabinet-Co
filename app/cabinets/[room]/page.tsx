import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Check } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { RelatedPostCards } from "@/components/marketing/RelatedPostCards";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { Button } from "@/components/ui/button";
import { CtaButton } from "@/components/modals/CtaButton";
import { catalogMetadata, catalogDescription } from "@/lib/catalog-metadata";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateServiceSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import {
  ROOM_CATEGORIES,
  getRoomBySlug,
  CABINET_PRODUCTS,
} from "@/shared/catalog";
import { CATALOG_CONTENT } from "@/shared/catalog";
import { getRoomFaqs } from "@/shared/catalog/roomFaqs";
import { ROOM_PILLAR_GUIDES } from "@/shared/catalog/roomPillarGuides";
import { CabinetOptionsSelector } from "@/components/catalog/OptionsSelector";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { RoomCatalogShowcase } from "@/components/catalog/RoomCatalogShowcase";
import { CITIES, locationPath } from "@/shared/contentData";
import { PROJECTS } from "@/shared/galleryData";
import { TESTIMONIALS } from "@/shared/testimonialsData";
import { STANDARD_INCLUSIONS } from "@/shared/siteContent";
import { CTA_ESTIMATE, CTA_BOOK_VISIT } from "@/shared/ctaCopy";
import {
  PROJECT_PRICING,
  calculateEstimate,
  getDefaultSelectionsForProject,
  formatPlanningCurrency,
  type ProjectType,
} from "@/shared/estimateEngine";

export function generateStaticParams() {
  return ROOM_CATEGORIES.map((room) => ({ room: room.slug }));
}

/**
 * SEO head-term override for the title/H1/schema where the highest-volume
 * keyword differs from the room's display name. e.g. "laundry room cabinets"
 * (17K/mo) vs "laundry cabinets"; "built-in cabinets" (4.5K) vs "built-ins".
 * Nav labels and breadcrumbs keep the shorter display name.
 */
const SEO_NAME: Record<string, string> = {
  laundry: "Laundry Room",
  "built-ins": "Built-In",
};
const seoName = (room: { slug: string; name: string }) => SEO_NAME[room.slug] ?? room.name;

/**
 * A room's typical planning range, computed with the estimator's own
 * canonical defaults (typical size, modern-shaker door, matte/standard
 * finish, Better construction) - the same defaults `DEFAULT_SELECTIONS` uses
 * elsewhere. Only rooms with a real pricing model return a range; the other
 * five room types (closet, garage, outdoor, wet-bar, bedroom) have no
 * modeled rate, so callers must handle `null` rather than see a guessed number.
 */
function getTypicalRoomRange(roomSlug: string): { priceLow: number; priceHigh: number } | null {
  if (!(roomSlug in PROJECT_PRICING)) return null;
  const project = roomSlug as ProjectType;
  const result = calculateEstimate(getDefaultSelectionsForProject(project));
  return result ? { priceLow: result.priceLow, priceHigh: result.priceHigh } : null;
}

/** Room slugs mapped to the project-gallery `serviceType` values that genuinely depict that room. */
const PROJECT_SERVICE_MATCH: Record<string, string[]> = {
  kitchen: ["kitchen-cabinets"],
  bathroom: ["bathroom-vanities"],
  "built-ins": ["built-in-storage"],
  "wet-bar": ["bar-cabinets"],
  outdoor: ["outdoor-cabinets"],
};

/** Room slugs mapped to testimonial `serviceType` values whose review text specifically discusses that room. */
const REVIEW_SERVICE_MATCH: Record<string, string[]> = {
  kitchen: ["kitchen-remodel"],
  bathroom: ["bathroom-remodel"],
  mudroom: ["room-addition"],
  pantry: ["room-addition"],
};

export async function generateMetadata({ params }: { params: { room: string } }) {
  const room = getRoomBySlug(params.room);
  if (!room) return {};
  return catalogMetadata(
    `/cabinets/${room.slug}`,
    `${seoName(room)} Cabinets`,
    catalogDescription(
      `Custom ${seoName(room).toLowerCase()} cabinets from {company} in the Treasure Valley. ${room.description}`,
    ),
  );
}

export default function RoomCabinetPage({ params }: { params: { room: string } }) {
  const room = getRoomBySlug(params.room);
  if (!room) notFound();

  // Pre-filter the catalog to the cabinet types this room uses, so the grid
  // leads with relevant options (homeowner-first) rather than the full 320.
  const roomCats = new Set<string>();
  for (const t of room.typicalCabinetTypes) {
    if (t.includes("vanity")) roomCats.add("vanity");
    else if (t.includes("wall")) roomCats.add("wall");
    else if (t.includes("tall")) roomCats.add("tall");
    else if (t.includes("base")) roomCats.add("base");
  }
  if (roomCats.size === 0) ["base", "wall", "tall"].forEach((c) => roomCats.add(c));
  const roomCabinets = CABINET_PRODUCTS.filter((c) => roomCats.has(c.category));

  const faqs = getRoomFaqs(room);
  const pillarGuide = ROOM_PILLAR_GUIDES[room.slug];
  const typicalRange = getTypicalRoomRange(room.slug);
  const roomProjects = PROJECTS.filter((p) =>
    (PROJECT_SERVICE_MATCH[room.slug] ?? []).includes(p.serviceType),
  ).slice(0, 3);
  const roomReviews = TESTIMONIALS.filter((t) =>
    (REVIEW_SERVICE_MATCH[room.slug] ?? []).includes(t.serviceType),
  );

  const schemas = [
    generateWebPageSchema({
      title: `${seoName(room)} Cabinets`,
      description: room.description,
      url: `/cabinets/${room.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinets", url: "/cabinets" },
      { name: room.name, url: `/cabinets/${room.slug}` },
    ]),
    generateServiceSchema(
      `Custom ${seoName(room)} Cabinets`,
      `${room.description} Designed, built, and installed by ${SITE_CONFIG.name} for Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.`,
    ),
    generateFAQSchema(faqs),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        {/* Hero */}
        <Section spacing="sm" className="pt-0">
          <div className="relative aspect-[21/9] max-h-[360px] w-full overflow-hidden bg-muted">
            <Image
              src={room.heroImage}
              alt={`${room.name} custom cabinets`}
              fill
              priority
              sizes="100vw"
              className="object-cover img-brand-grade"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
          </div>
          <div className="container px-4 max-w-3xl pt-6">
            <Breadcrumbs
              items={[
                { name: "Home", href: "/" },
                { name: "Cabinets", href: "/cabinets" },
                { name: room.name },
              ]}
            />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow="Room catalog"
              title={
                <>
                  {seoName(room)}{" "}
                  <em className="brc-accent text-accent">cabinets</em>
                </>
              }
              description={room.description}
            />
            <div className="flex flex-wrap gap-3 mt-4">
              <CtaButton variant="brand">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
            </div>
          </div>
        </Section>

        {/* Cost and timeline expectation */}
        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Cost & timeline"
              title={<>What to expect for {room.name.toLowerCase()} cabinets</>}
              align="left"
              className="mb-6"
            />
            <MarketingCard className="p-6">
              {typicalRange ? (
                <p className="text-base text-foreground/90 leading-relaxed mb-3">
                  Most {room.name.toLowerCase()} projects plan from{" "}
                  <strong className="text-foreground">
                    {formatPlanningCurrency(typicalRange.priceLow)} to{" "}
                    {formatPlanningCurrency(typicalRange.priceHigh)}
                  </strong>{" "}
                  installed, based on a typical size and Better-tier construction. Your exact
                  range depends on linear footage, door style, and finish.
                </p>
              ) : (
                <p className="text-base text-foreground/90 leading-relaxed mb-3">
                  {room.name} cabinets are sized and priced individually based on your layout and
                  material choices, so we do not publish a generic starting price for this room.
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Most projects move into production {CATALOG_CONTENT.leadTime} after your
                selections and project details are finalized.
              </p>
              <Button variant="brandOutline" asChild>
                <Link href="/estimate">
                  Build your {room.name.toLowerCase()} planning range{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </MarketingCard>
          </div>
        </Section>

        {/* Project proof */}
        <Section divider>
          <div className="container px-4 max-w-5xl">
            <SectionHeader
              eyebrow="Project proof"
              title={<>{room.name} cabinet work</>}
              align="left"
              className="mb-6"
            />
            {roomProjects.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomProjects.map((project) => (
                  <MarketingCard key={project.slug} className="overflow-hidden p-0">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={project.hero.src}
                        alt={project.hero.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover img-brand-grade"
                      />
                      {project.kind === "concept" && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-sm bg-inverse/75 backdrop-blur-sm text-inverse-foreground text-[12px] tracking-[0.14em] uppercase font-medium">
                          Design concept
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-sans font-medium text-sm mb-1 text-foreground">
                        {project.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </MarketingCard>
                ))}
              </div>
            ) : (
              <MarketingCard className="p-6">
                <p className="text-sm text-muted-foreground">
                  We&apos;re still building out {room.name.toLowerCase()}-specific project
                  photos. See{" "}
                  <Link href="/testimonials" className="text-accent hover:underline">
                    projects across the Treasure Valley
                  </Link>{" "}
                  for examples of our work.
                </p>
              </MarketingCard>
            )}
          </div>
        </Section>

        {/* What is included */}
        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="What's included"
              title={<>Included on every {room.name.toLowerCase()} project</>}
              align="left"
              className="mb-6"
            />
            <ul className="grid sm:grid-cols-2 gap-3">
              {STANDARD_INCLUSIONS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground/90">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Options / scope levels */}
        <Section divider>
          <div className="container px-4 max-w-5xl">
            <RoomCatalogShowcase
              roomSlug={room.slug}
              roomName={room.name}
              defaultCollectionId={room.defaultCollectionId}
            />
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-5xl">
            <SectionHeader
              eyebrow="Cabinets for this room"
              title={<>What we build for {room.name.toLowerCase()}</>}
              description={`${SITE_CONFIG.name} sizes these cabinets to fit ${room.name.toLowerCase()} layouts common in Ada and Canyon County homes. Filter by what you need or see the full range.`}
              align="left"
              className="mb-6"
            />
            <CabinetOptionsSelector cabinets={roomCabinets} />
            {pillarGuide && (
              <p className="mt-6 text-sm text-muted-foreground">
                Planning a {room.name.toLowerCase()} project? Read our{" "}
                <Link
                  href={pillarGuide.href}
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  {pillarGuide.label}
                </Link>{" "}
                for Treasure Valley layouts, costs, and timelines.
              </p>
            )}
          </div>
        </Section>

        {/* Process */}
        <ProcessSection />

        {/* Reviews */}
        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Homeowner reviews"
              title={<>What homeowners say</>}
              align="left"
              className="mb-6"
            />
            {roomReviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {roomReviews.map((review) => (
                  <MarketingCard key={review.customerName} className="p-5">
                    <p className="text-base text-foreground/90 leading-relaxed mb-3">
                      &ldquo;{review.testimonial}&rdquo;
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {review.customerName} ·{" "}
                      {review.city.charAt(0).toUpperCase() + review.city.slice(1)}
                    </p>
                  </MarketingCard>
                ))}
              </div>
            ) : (
              <MarketingCard className="p-6">
                <p className="text-sm text-muted-foreground">
                  We don&apos;t have a published review specific to {room.name.toLowerCase()}{" "}
                  cabinets yet. See{" "}
                  <Link href="/testimonials" className="text-accent hover:underline">
                    reviews from across the Treasure Valley
                  </Link>
                  .
                </p>
              </MarketingCard>
            )}
          </div>
        </Section>

        {/* Relevant FAQs */}
        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Common questions"
              title={<>{room.name} cabinet questions</>}
              align="left"
              className="mb-6"
            />
            <FaqAccordion faqs={faqs} initialCount={6} idPrefix={`faq-${room.slug}`} />
          </div>
        </Section>

        <Section>
          <div className="container px-4">
            <RelatedPostCards
              path={`/cabinets/${room.slug}`}
              title={`Guides for ${room.name.toLowerCase()} cabinets`}
            />
          </div>
        </Section>

        {/* Location links */}
        <Section variant="greige" divider>
          <div className="container px-4 max-w-4xl">
            <SectionHeader
              eyebrow="Where we work"
              title={<>{room.name} cabinets across the Treasure Valley</>}
              align="left"
              className="mb-6"
            />
            <div className="flex flex-wrap gap-3">
              {CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={locationPath(city.slug)}
                  className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-accent/60 hover:text-accent transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {city.name}
                </Link>
              ))}
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <Section variant="inverse">
          <div className="container px-4 text-center max-w-lg mx-auto">
            <p className="text-inverse-muted mb-4">
              Tell us about your layout and finishes to get a planning estimate, then schedule a
              consultation.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
              <CtaButton variant="brandOutline" intent="visit">
                {CTA_BOOK_VISIT}
              </CtaButton>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
