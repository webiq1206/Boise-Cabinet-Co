import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Section } from "@/components/marketing/Section";
import { PageHeader } from "@/components/marketing/PageHeader";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { SectionedArticle } from "@/components/marketing/SectionedArticle";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { CtaButton } from "@/components/modals/CtaButton";
import { Button } from "@/components/ui/button";
import {
  CITIES,
  SERVICES,
  getCityBySlug,
  getCountyLabel,
  locationPath,
} from "@/shared/contentData";
import { GUIDE_PAGES } from "@/shared/guideContent";
import { getAreaImageSet } from "@/shared/cityServiceImages";
import { PROJECTS } from "@/shared/galleryData";
import { TESTIMONIALS } from "@/shared/testimonialsData";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { CTA_ESTIMATE, CTA_BOOK_VISIT } from "@/shared/ctaCopy";
import { buildPageMetadata } from "@/lib/page-metadata";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateLocalBusinessSchema,
  generateWebPageSchema,
} from "@/lib/schema";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city);
  if (!city) return {};
  return buildPageMetadata({
    kind: "area",
    path: locationPath(city.slug),
    cityName: city.name,
    citySlug: city.slug,
    titleOverride: `Custom Cabinets in ${city.name}, Idaho`,
    descriptionOverride: `Custom kitchen cabinets, bathroom vanities, and built-in storage designed, built, and installed by ${SITE_CONFIG.name} for ${city.name} homeowners in ${getCountyLabel(city.county)}.`,
  });
}

export default function LocationPage({ params }: { params: { city: string } }) {
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  // Each of the 8 Treasure Valley cities already has a full local-knowledge
  // guide (housing stock, popular projects, county permitting, cost context)
  // authored in shared/content/cityCabinetGuides.ts (and shared/guideContent.ts
  // for Boise). Reused verbatim below - nothing here rewrites that copy.
  const guide = GUIDE_PAGES.find(
    (g) => g.guideType === "location" && g.linkedCities?.includes(city.slug),
  );

  const images = getAreaImageSet(city.slug);
  const countyLabel = getCountyLabel(city.county);

  // Honest empty states, never fabricated: only real projects/reviews tagged
  // to this city are shown, and each section says so plainly when there are none.
  const cityProjects = PROJECTS.filter((p) => p.area === city.name).slice(0, 3);
  const cityReviews = TESTIMONIALS.filter((t) => t.city === city.slug);
  const faqs = guide?.faqs ?? [];

  const schemas = [
    generateWebPageSchema({
      title: `Custom Cabinets in ${city.name}, Idaho`,
      description: `Custom kitchen cabinets, bathroom vanities, and built-in storage for ${city.name} homes, ${countyLabel}.`,
      url: locationPath(city.slug),
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: `${city.name}, Idaho`, url: locationPath(city.slug) },
    ]),
    generateLocalBusinessSchema(city.name),
    ...(faqs.length ? [generateFAQSchema(faqs)] : []),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        {/* Local hero */}
        <Section spacing="sm" className="pt-0">
          <div className="relative aspect-[21/9] max-h-[360px] w-full overflow-hidden bg-muted">
            <Image
              src={images.hero}
              alt={images.heroAlt ?? `Custom cabinets in ${city.name}, Idaho by ${SITE_CONFIG.name}`}
              fill
              priority
              sizes="100vw"
              className="object-cover img-brand-grade"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
          </div>
          <div className="container px-4 max-w-3xl pt-6">
            <Breadcrumbs
              items={[{ name: "Home", href: "/" }, { name: `${city.name}, Idaho` }]}
            />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow={`${countyLabel} · Treasure Valley`}
              title={
                <>
                  Custom cabinets in{" "}
                  <em className="brc-accent text-accent">{city.name}</em>
                </>
              }
              description={
                guide?.quickAnswer ??
                `${SITE_CONFIG.name} designs, builds, and installs custom kitchen cabinets, bathroom vanities, and built-in storage for ${city.name} homeowners.`
              }
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto mt-4">
              <CtaButton variant="brand">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
              <Button variant="brandOutline" asChild>
                <a href={SITE_CONFIG.phoneHref}>
                  <Phone className="h-4 w-4" /> {SITE_CONFIG.phone}
                </a>
              </Button>
            </div>
          </div>
        </Section>

        {/* Local project proof */}
        {cityProjects.length > 0 && (
        <Section variant="greige" divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow={cityProjects.every((project) => project.kind === "concept") ? "Design inspiration" : "Project gallery"}
              title={<>Cabinet ideas for {city.name} homes</>}
              align="left"
              className="mb-6"
            />
              <div className="ed-cards-3 gap-6">
                {cityProjects.map((project) => (
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
                      <h3 className="ed-h4">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>
                  </MarketingCard>
                ))}
              </div>

          </div>
        </Section>
        )}

        {/* Services */}
        <Section divider>
          <div className="ed-shell">
            <SectionHeader
              eyebrow="What we build"
              title={<>Cabinet services for {city.name} homes</>}
              align="left"
              className="mb-6"
            />
            <div className="ed-cards-3 gap-4">
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  href={service.url}
                  className="group block rounded-sm border border-border bg-card p-5 brc-lift transition-colors hover:border-accent/60"
                >
                  <h3 className="ed-h4">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {service.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </Section>

        {/* Local planning considerations + cost/timeline (reused verbatim from
            the existing city guide content - housing stock, popular projects,
            county-specific permitting, and planning ranges). */}
        {guide && (
          <Section variant="greige" divider>
            <div className="ed-shell">
              <div className="ed-split ed-split-narrow">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHeader
                    eyebrow="Local planning guide"
                    title={<>Planning a project in {city.name}</>}
                    align="left"
                    className="mb-0"
                  />
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto">
                    <Button variant="brand" asChild>
                      <Link href="/estimate">
                        {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="brandOutline" asChild>
                      <Link href="/guides/boise-cabinet-cost-guide">Full cost guide</Link>
                    </Button>
                  </div>
                </div>
                <div>
                  <SectionedArticle html={guide.content} defaultOpenCount={99} />
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Reviews */}
        {cityReviews.length > 0 && (
        <Section divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
            <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeader
              eyebrow="Homeowner reviews"
              title={<>What {city.name} homeowners say</>}
              align="left"
              className="mb-0"
            />
            </div>
              <div className="ed-grid-balance grid sm:grid-cols-2 gap-4">
                {cityReviews.map((review) => (
                  <MarketingCard key={review.customerName} className="p-5">
                    <p className="text-base text-foreground/90 leading-relaxed mb-3">
                      &ldquo;{review.testimonial}&rdquo;
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.customerName} · {city.name}
                    </p>
                  </MarketingCard>
                ))}
              </div>

            </div>
          </div>
        </Section>
        )}

        {/* FAQs */}
        {faqs.length > 0 && (
          <Section variant="greige" divider>
            <div className="ed-shell">
              <div className="ed-split ed-split-narrow">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <SectionHeader
                    eyebrow="Common questions"
                    title={<>{city.name} cabinet questions</>}
                    align="left"
                    className="mb-0"
                  />
                </div>
                <div>
                  <FaqAccordion faqs={faqs} initialCount={6} idPrefix={`faq-${city.slug}`} />
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Final CTA */}
        <Section variant="inverse">
          <div className="container px-4 text-center max-w-lg mx-auto">
            <MapPin className="h-5 w-5 text-accent mx-auto mb-3" />
            <h2 className="ed-h2-sm ed-statement-wide">
              Ready to plan your {city.name} project?
            </h2>
            <p className="text-inverse-muted mb-6">
              Build a planning range in about two minutes, then book a free in-home visit. No
              obligation, no spam.
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
