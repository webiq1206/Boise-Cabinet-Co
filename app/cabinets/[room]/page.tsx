import { AboveFoldActions } from "@/components/marketing/AboveFoldActions";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import { InteriorHero,InteriorPage } from '@/components/approved/InteriorLayout';
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CabinetOptionsSelector } from "@/components/catalog/OptionsSelector";
import { RoomCatalogShowcase } from "@/components/catalog/RoomCatalogShowcase";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { HeroFollowOn } from "@/components/marketing/HeroFollowOn";
import { PageHeader } from "@/components/marketing/PageHeader";
import { PhotoBreak } from "@/components/marketing/PhotoBreak";
import { ProjectDetailStrip } from "@/components/marketing/ProjectDetailStrip";
import { RelatedPostCards } from "@/components/marketing/RelatedPostCards";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CtaButton } from "@/components/modals/CtaButton";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { phase1RoomAnswer } from '@/lib/phase1Answers';
import { splitLead } from '@/lib/heroLead';
import { catalogDescription,catalogMetadata } from "@/lib/catalog-metadata";
import {
generateBreadcrumbSchema,
generateFAQSchema,
generateServiceSchema,
generateWebPageSchema,
} from "@/lib/schema";
import {
CABINET_PRODUCTS,
CATALOG_CONTENT,
ROOM_CATEGORIES,
getRoomBySlug,
} from "@/shared/catalog";
import { getRoomFaqs } from "@/shared/catalog/roomFaqs";
import { roomSeo,sentenceStart } from "@/shared/catalog/roomSeo";
import { ROOM_PILLAR_GUIDES } from "@/shared/catalog/roomPillarGuides";
import { bot05Room, LEAD_TIME_LINE } from "@/shared/content/bot05PageCopy";
import { CITIES,locationPath } from "@/shared/contentData";
import { CTA_ESTIMATE,CTA_QUOTE_HREF } from "@/shared/ctaCopy";
import {
PROJECT_PRICING,
calculateEstimate,
formatPlanningCurrency,
getDefaultSelectionsForProject,
type ProjectType,
} from "@/shared/estimateEngine";
import { PROJECTS } from "@/shared/galleryData";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ENRICHMENT_IMAGES } from "@/shared/siteImages";
import { STANDARD_INCLUSIONS } from "@/shared/siteContent";
import { visibleTestimonials } from "@/shared/testimonialsData";
import { ArrowRight,Check,MapPin,Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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

export async function generateMetadata(props: { params: Promise<{ room: string }> }) {
  const params = await props.params;
  const room = getRoomBySlug(params.room);
  if (!room) return {};
  const seo = roomSeo(room);
  return withBrandPageMetadata(await (catalogMetadata(
    `/cabinets/${room.slug}`,
    seo.title,
    catalogDescription(
      seo.description ??
        `Custom ${seoName(room).toLowerCase()} cabinets from {company} in the Treasure Valley. ${room.description}`,
    ),
  )), "/cabinets/[room]");
}

export default async function RoomCabinetPage(props: { params: Promise<{ room: string }> }) {
  const params = await props.params;
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

  const roomCopy = bot05Room(room.slug);
  const seo = roomSeo(room);
  const phaseAnswer = roomCopy ? undefined : phase1RoomAnswer(room.slug);
  const roomFaqs = roomCopy?.faqs ?? getRoomFaqs(room);
  const faqs = [...roomFaqs, ...(phaseAnswer?.faqs ?? [])];
  const pillarGuide = ROOM_PILLAR_GUIDES[room.slug];
  // The hero keeps the first sentence; the rest of its copy, the BOT-05 subhead
  // and trust line, and the built-ins prompt follow in the first section below.
  const heroLead = splitLead(roomCopy?.firstSentence ?? room.description);
  const heroFollowOn = [
    heroLead.rest,
    roomCopy?.aboveFold,
    roomCopy?.trustLine,
    room.slug === "built-ins" ? "Tell Boise Cabinet Co which room you are working on and what you need to store." : undefined,
  ].filter((paragraph): paragraph is string => Boolean(paragraph));
  const typicalRange = getTypicalRoomRange(room.slug);
  const roomProjects = PROJECTS.filter((p) =>
    (PROJECT_SERVICE_MATCH[room.slug] ?? []).includes(p.serviceType),
  ).slice(0, 3);
  const roomReviews = visibleTestimonials().filter((t) =>
    (REVIEW_SERVICE_MATCH[room.slug] ?? []).includes(t.serviceType),
  );

  const schemas = [
    generateWebPageSchema({
      title: roomCopy?.title ?? `${seoName(room)} Cabinets`,
      description: roomCopy?.description ?? room.description,
      url: `/cabinets/${room.slug}`,
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinets", url: "/cabinets" },
      { name: room.name, url: `/cabinets/${room.slug}` },
    ]),
    generateServiceSchema(
      roomCopy?.title ?? `Custom ${seoName(room)} Cabinets`,
      roomCopy
        ? `${roomCopy.firstSentence} ${SITE_CONFIG.name} designs, builds, and installs these cabinets for Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.`
        : `${room.description} Designed, built, and installed by ${SITE_CONFIG.name} for Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell.`,
    ),
    generateFAQSchema(faqs),
  ];

  return (
    <InteriorPage kind="cabinets"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        {/* On phones the unchanged support sentence follows the hero, keeping
            the larger title, contact actions and cabinet photograph together. */}
        <InteriorHero className="interior-hero-fit interior-hero-commercial" layout="split" imageSrc={room.heroImage} imageAlt={room.imageAlt ?? `${room.name} custom cabinets`}>
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
                roomCopy ? (
                  <>
                    {roomCopy.h1Lead}{" "}
                    <em className="brc-accent text-accent">{roomCopy.h1Accent}</em>
                  </>
                ) : (
                  <>
                    {seo.h1Lead}{" "}
                    <em className="brc-accent text-accent">Boise, Idaho</em>
                  </>
                )
              }
              description={heroLead.lead}
            />
            <div className="interior-hero-cta">
              <CtaButton variant="brand" className="min-h-12 px-6">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
              <AboveFoldActions />
            </div>
          </InteriorHero>
        {(heroLead.lead || heroFollowOn.length > 0) && (
          <HeroFollowOn>
            <p className="commercial-mobile-lead">{heroLead.lead}</p>
            {heroFollowOn.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </HeroFollowOn>
        )}
        {room.slug === "built-ins" && <section id="built-in-inquiry" data-quote-anchor="" data-suppress-sticky-cta="" className="mx-auto w-full max-w-3xl px-6 py-8">
          <KitchenCabinetsQuoteForm context="built-ins" idPrefix="builtins-quote" projectPrompt="Which room, and what would you like to store?" />
          <p className="mt-4 text-sm text-muted-foreground">Dimensions and photos can follow; they are not required to get in touch.</p>
        </section>}

        {phaseAnswer && (
          <Section divider>
            <div className="ed-shell">
              <SectionHeader
                eyebrow="Quick answer"
                title={phaseAnswer.heading}
                description={phaseAnswer.paragraph}
                align="left"
              />
              <FaqAccordion faqs={phaseAnswer.faqs} initialCount={phaseAnswer.faqs.length} idPrefix={`phase1-${room.slug}`} />
            </div>
          </Section>
        )}

        {/* Cost and timeline expectation */}
        <Section variant="greige" divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
            <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              eyebrow="Cost & timeline"
              title={<>What to expect for {seo.phrase}</>}
              align="left"
              className="mb-0"
            />
            </div>
            <MarketingCard className="p-6">
              {roomCopy ? (
                <>
                  <p className="text-base text-foreground/90 leading-relaxed mb-3">{roomCopy.pricingNote}</p>
                  <p className="text-sm text-muted-foreground mb-4">{LEAD_TIME_LINE}</p>
                </>
              ) : typicalRange ? (
                <p className="text-base text-foreground/90 leading-relaxed mb-3">
                  Most {seo.label} projects plan from{" "}
                  <strong className="text-foreground">
                    {formatPlanningCurrency(typicalRange.priceLow)} to{" "}
                    {formatPlanningCurrency(typicalRange.priceHigh)}
                  </strong>{" "}
                  installed, based on a typical size and Better-tier construction. Your exact
                  range depends on linear footage, door style, and finish.
                </p>
              ) : (
                <p className="text-base text-foreground/90 leading-relaxed mb-3">
                  {sentenceStart(seo.phrase)} are sized and priced individually based on your layout and
                  material choices, so we do not publish a generic starting price for this room.
                </p>
              )}
              {roomCopy ? null : (
              <p className="text-sm text-muted-foreground mb-4">
                Most projects move into production {CATALOG_CONTENT.leadTime} after your
                selections and project details are finalized.
              </p>
              )}
              <Button variant="brandOutline" asChild>
                <Link href={CTA_QUOTE_HREF}>
                  {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </MarketingCard>
            </div>
          </div>
        </Section>

        <PhotoBreak
          src={room.heroImage}
          alt={room.imageAlt ?? `${room.name} custom cabinets for Treasure Valley homes`}
          caption={`${sentenceStart(seo.label)} cabinetry designed for Boise and Treasure Valley homes.`}
        />

        {/* Project proof */}
        {!roomCopy && roomProjects.length > 0 && (
        <Section divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow={roomProjects.every((project) => project.kind === "concept") ? "Cabinet styles" : "Project gallery"}
              title={<>{sentenceStart(seo.phrase)} ideas</>}
              align="left"
              className="mb-6"
            />
              <div className="ed-cards-3 gap-6">
                {roomProjects.map((project) => (
                  <MarketingCard key={project.slug} padding="none" className="overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={project.hero.src}
                        alt={project.hero.alt}
                        fill
                        sizes={roomProjects.length === 1 ? "(max-width: 1023px) 100vw, 66vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
                        className="object-cover img-brand-grade"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="ed-h3">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                      {project.detail.length > 0 ? (
                        <div className="mt-4">
                          <ProjectDetailStrip images={project.detail.slice(0, 3)} />
                        </div>
                      ) : null}
                    </div>
                  </MarketingCard>
                ))}
              </div>

          </div>
        </Section>
        )}

        {/* What is included */}
        <Section variant="greige" divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeader
                  eyebrow="What's included"
                  title={<>Included on every {seo.label} project</>}
                  align="left"
                  className="mb-0"
                />
              </div>
              <ul className="ed-inset ed-grid-balance m-0 grid list-none gap-x-8 gap-y-4 p-[clamp(24px,2.6vw,40px)] sm:grid-cols-2">
                {STANDARD_INCLUSIONS.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[0.9375rem] text-foreground/90">
                    <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* Options / scope levels */}
        <Section divider>
          <div className="ed-shell">
            <RoomCatalogShowcase
              roomSlug={room.slug}
              roomName={seo.label}
              defaultCollectionId={room.defaultCollectionId}
            />
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="Cabinets for this room"
              title={
                  <>What we build for {seo.label === "built-in" ? "built-ins" : seo.label}</>
              }
              description={
                `${SITE_CONFIG.name} sizes and builds these cabinets to fit ${seo.label} layouts common in Ada and Canyon County homes. Filter by what you need or see the full range.`
              }
              align="left"
              className="mb-6"
            />
            <CabinetOptionsSelector cabinets={roomCabinets} />
            {pillarGuide && (
              <p className="mt-6 text-sm text-muted-foreground">
                Planning a {seo.label} project? Read our{" "}
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
        {roomCopy?.sections?.map((section, index) => (
          <div key={section.heading}>
            <Section divider>
              <div className="ed-shell max-w-3xl">
                <h2 className="ed-h2-sm">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-relaxed text-foreground/90">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Section>
            {index === 0 ? (
              <PhotoBreak
                src={ENRICHMENT_IMAGES.oakBuiltIns}
                alt={`${sentenceStart(seo.label)} cabinetry detail in a Treasure Valley home`}
                caption={`More ${seo.label} planning detail for Ada and Canyon County homes.`}
              />
            ) : null}
          </div>
        ))}

        <ProcessSection
          steps={roomCopy?.steps}
          heading={roomCopy?.processHeading}
          note={roomCopy?.processNote}
        />

        {roomCopy?.links?.length ? (
          <Section divider>
            <div className="ed-shell">
              <h2 className="ed-h2-sm">Related cabinet pages</h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {roomCopy.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm underline underline-offset-2 hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Section>
        ) : null}

        {/* Reviews */}
        {roomReviews.length > 0 && (
        <Section divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
            <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              eyebrow="Homeowner reviews"
              title={<>What homeowners say</>}
              align="left"
              className="mb-0"
            />
            </div>
              <div className="ed-grid-balance grid sm:grid-cols-2 gap-4">
                {roomReviews.map((review) => (
                  <MarketingCard key={review.customerName} className="p-5">
                    <p className="text-base text-foreground/90 leading-relaxed mb-3">
                      &ldquo;{review.testimonial}&rdquo;
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.customerName} ·{" "}
                      {review.city.charAt(0).toUpperCase() + review.city.slice(1)}
                    </p>
                  </MarketingCard>
                ))}
              </div>

            </div>
          </div>
        </Section>
        )}

        {/* Relevant FAQs */}
        <Section variant="greige" divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <SectionHeader
                  eyebrow="Common questions"
                  title={<>{sentenceStart(seo.phrase)} questions</>}
                  align="left"
                  className="mb-0"
                />
              </div>
              <div>
                <FaqAccordion faqs={roomFaqs} initialCount={6} idPrefix={`faq-${room.slug}`} />
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="ed-shell">
            <RelatedPostCards
              path={`/cabinets/${room.slug}`}
              title={`Guides for ${seo.phrase}`}
            />
          </div>
        </Section>

        {/* Location links */}
        <Section variant="greige" divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
            <SectionHeader
              eyebrow="Where we work"
              title={<>{sentenceStart(seo.phrase)} across the Treasure Valley</>}
              align="left"
              className="mb-0"
            />
            <div className="flex flex-wrap content-start gap-3">
              {CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={locationPath(city.slug)}
                  className="tap-target inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground hover:border-accent/60 hover:text-accent transition-colors"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {city.name}
                </Link>
              ))}
            </div>
            </div>
          </div>
        </Section>

        {/* Final CTA */}
        <Section variant="inverse">
          <div className="container px-4 text-center max-w-lg mx-auto">
            <p className="text-inverse-muted mb-4">
              Share your layout and finishes for team review. We may need more information or a
              site visit before preparing your estimate.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
              <Button variant="brandOutline" asChild>
                <a href={SITE_CONFIG.phoneHref}>
                  <Phone className="h-4 w-4" /> Call {SITE_CONFIG.phone}
                </a>
              </Button>
            </div>
          </div>
        </Section>
      </div>
    </></InteriorPage>
  );
}
