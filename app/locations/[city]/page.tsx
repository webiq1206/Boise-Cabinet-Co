import { InteriorHero,InteriorPage } from '@/components/approved/InteriorLayout';
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { PageHeader } from "@/components/marketing/PageHeader";
import { Section } from "@/components/marketing/Section";
import { SectionedArticle } from "@/components/marketing/SectionedArticle";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { CtaButton } from "@/components/modals/CtaButton";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/button";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { phase1LocationAnswer } from '@/lib/phase1Answers';
import { buildPageMetadata } from "@/lib/page-metadata";
import {
generateBreadcrumbSchema,
generateFAQSchema,
generateLocalBusinessSchema,
generateWebPageSchema,
} from "@/lib/schema";
import { getAreaImageSet } from "@/shared/cityServiceImages";
import {
CITIES,
SERVICES,
getCityBySlug,
getCountyLabel,
locationPath,
} from "@/shared/contentData";
import { bot05Location } from "@/shared/content/bot05PageCopy";
import { CTA_BOOK_VISIT,CTA_ESTIMATE } from "@/shared/ctaCopy";
import { PROJECTS } from "@/shared/galleryData";
import { GUIDE_PAGES } from "@/shared/guideContent";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { visibleTestimonials } from "@/shared/testimonialsData";
import { ArrowRight,MapPin,Phone } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata(props: { params: Promise<{ city: string }> }) {
  const params = await props.params;
  const city = getCityBySlug(params.city);
  if (!city) return {};
  const copy = bot05Location(city.slug);
  return withBrandPageMetadata(await (buildPageMetadata({
    kind: "area",
    path: locationPath(city.slug),
    cityName: city.name,
    citySlug: city.slug,
    titleOverride: copy?.title ?? `Custom Cabinets in ${city.name}, Idaho`,
    descriptionOverride: copy?.description ?? `Custom kitchen cabinets, bathroom vanities, and built-in storage designed, built, and installed by ${SITE_CONFIG.name} for ${city.name} homeowners in ${getCountyLabel(city.county)}.`,
  })), "/locations/[city]");
}

export default async function LocationPage(props: { params: Promise<{ city: string }> }) {
  const params = await props.params;
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  // City guides still supply neighborhood planning. Optimized cities overlay
  // BOT-05 title, hero, process, and FAQ copy on top of that local detail.
  const guide = GUIDE_PAGES.find(
    (g) => g.guideType === "location" && g.linkedCities?.includes(city.slug),
  );

  const images = getAreaImageSet(city.slug);
  const countyLabel = getCountyLabel(city.county);

  // Honest empty states, never fabricated: only real projects/reviews tagged
  // to this city are shown, and each section says so plainly when there are none.
  const cityProjects = PROJECTS.filter((p) => p.area === city.name).slice(0, 3);
  const cityReviews = visibleTestimonials().filter((t) => t.city === city.slug);
  const copy = bot05Location(city.slug);
  const phaseAnswer = copy ? undefined : phase1LocationAnswer(city.slug);
  const guideFaqs = guide?.faqs ?? [];
  const visibleFaqs = copy?.faqs ?? guideFaqs;
  const faqs = [...visibleFaqs, ...(phaseAnswer?.faqs ?? [])];
  const pageTitle = copy?.title ?? `Custom Cabinets in ${city.name}, Idaho`;
  const pageDescription = copy?.description ?? `Custom kitchen cabinets, bathroom vanities, and built-in storage for ${city.name} homes, ${countyLabel}.`;
  const localBusiness = generateLocalBusinessSchema(city.name);
  if (copy) delete localBusiness.foundingDate;

  const schemas = [
    generateWebPageSchema({
      title: pageTitle,
      description: pageDescription,
      url: locationPath(city.slug),
    }),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: `${city.name}, Idaho`, url: locationPath(city.slug) },
    ]),
    // City coverage is areaServed. PostalAddress stays the Meridian service-area record.
    localBusiness,
    ...(faqs.length ? [generateFAQSchema(faqs)] : []),
  ];

  return (
    <InteriorPage kind="locations"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        {/* Local hero */}
        <InteriorHero layout="split" imageSrc={images.hero} imageAlt={images.heroAlt ?? `Custom cabinets in ${city.name}, Idaho by ${SITE_CONFIG.name}`}>
            <Breadcrumbs
              items={[{ name: "Home", href: "/" }, { name: `${city.name}, Idaho` }]}
            />
            <PageHeader
              align="left"
              className="mt-6"
              eyebrow={`${countyLabel} · Treasure Valley`}
              title={
                copy ? (
                  <>
                    {copy.h1Lead}{" "}
                    <em className="brc-accent text-accent">{copy.h1Accent}</em>
                  </>
                ) : (
                  <>
                    Custom cabinets in{" "}
                    <em className="brc-accent text-accent">{city.name}</em>
                  </>
                )
              }
              description={
                copy?.firstSentence ??
                guide?.quickAnswer ??
                `${SITE_CONFIG.name} designs, builds, and installs custom kitchen cabinets, bathroom vanities, and built-in storage for ${city.name} homeowners.`
              }
            />
            {copy?.aboveFold ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/90">{copy.aboveFold}</p>
            ) : null}
            {copy ? (
              <p className="mt-3 text-sm text-foreground/80">{copy.trustLine}</p>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3 [&>*]:w-full sm:[&>*]:w-auto mt-4">
              <CtaButton variant="brand" intent={copy ? "visit" : "estimate"}>
                {copy ? copy.ctaLabel : CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
              <Button variant="brandOutline" asChild>
                <a href={SITE_CONFIG.phoneHref}>
                  <Phone className="h-4 w-4" /> {SITE_CONFIG.phone}
                </a>
              </Button>
            </div>
          </InteriorHero>

        {phaseAnswer && (
          <Section divider>
            <div className="ed-shell">
              <SectionHeader
                eyebrow="Quick answer"
                title={phaseAnswer.heading}
                description={phaseAnswer.paragraph}
                align="left"
              />
              <FaqAccordion faqs={phaseAnswer.faqs} initialCount={phaseAnswer.faqs.length} idPrefix={`phase1-${city.slug}`} />
            </div>
          </Section>
        )}

        {/* Local project proof */}
        {!copy && cityProjects.length > 0 && (
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
                  <MarketingCard key={project.slug} padding="none" className="overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={project.hero.src}
                        alt={project.hero.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover img-brand-grade"
                      />
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
              eyebrow={copy ? "Cabinet services" : "What we build"}
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

        {copy?.sections?.map((section) => (
          <Section key={section.heading} divider>
            <div className="ed-shell max-w-3xl">
              <h2 className="ed-h2-sm">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-base leading-relaxed text-foreground/90">
                  {paragraph}
                </p>
              ))}
            </div>
          </Section>
        ))}

        {copy?.steps ? (
          <ProcessSection steps={copy.steps} heading={copy.processHeading} note={copy.processNote} />
        ) : null}

        {copy?.links?.length ? (
          <Section divider>
            <div className="ed-shell">
              <h2 className="ed-h2-sm">Related cabinet pages</h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {copy.links.map((link) => (
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

        {/* Neighborhood planning stays on the page. Manufacture claims are
            removed from the city guide source for the optimized URLs. */}
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
        {visibleFaqs.length > 0 && (
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
                  <FaqAccordion faqs={visibleFaqs} initialCount={6} idPrefix={`faq-${city.slug}`} />
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
              Share your project online for team review. More information or a site visit may be needed before we prepare your estimate.
              Larger plan sets may take longer. Book a free in-home visit whenever you are ready.
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
    </></InteriorPage>
  );
}
