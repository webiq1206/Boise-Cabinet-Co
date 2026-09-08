import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import Image from 'next/image';
import { DisplayNum, formatStepNumber, Section } from '@/components/marketing';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { Hairline } from '@/components/marketing/Hairline';
import { SITE_IMAGES } from '@/shared/siteImages';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { Reveal } from '@/components/Reveal';
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUsSection';
import { StatementBandSection } from '@/components/sections/StatementBandSection';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebPageSchema,
  generateFAQSchema,
} from '@/lib/schema';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HERO_STATS, PRINCIPLES, TRUST_ITEMS, TEAM } from '@/shared/siteContent';
import { CTA_ESTIMATE, CTA_EXPLORE_COLLECTIONS } from '@/shared/ctaCopy';
import { CtaButton } from '@/components/modals/CtaButton';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/shared/siteConfig';

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`;

const SPEAKABLE_SUMMARY =
  'Boise Cabinet Co is Idaho\'s premier custom cabinet company serving the Treasure Valley. We offer frameless Euro cabinetry, 299 finishes, six door styles, an online Design Studio, and a client portal to track your project from design through installation.';

function HeroBreadcrumbs() {
  const items = [
    { name: 'Home', href: '/' },
    { name: 'About' },
  ];

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-inverse-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="tap-target hover:text-inverse-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ) : (
                <span className={isLast ? 'text-inverse-foreground/90 font-medium' : ''}>
                  {item.name}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 opacity-40" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function StatCard({ num, label }: { num: string; label: string }) {
  /* Phones: a plain cell inside the strip the container draws. Boxed and
     three-up, the labels wrapped onto three or four lines each. */
  return (
    <div className="px-2 py-3 text-center md:px-6 md:py-5 md:text-left md:rounded-sm md:bg-inverse-foreground/10 md:border md:border-inverse-foreground/15 md:backdrop-blur-sm">
      <DisplayNum className="text-inverse-foreground text-lg md:text-3xl leading-none">
        {num}
      </DisplayNum>
      <div className="mt-1.5 text-[0.625rem] leading-tight tracking-[0.08em] md:text-label md:tracking-[0.1em] uppercase text-inverse-muted md:leading-snug">
        {label}
      </div>
    </div>
  );
}

export const metadata = buildPageMetadata({
  kind: 'about',
  path: '/about',
});

export default function AboutPage() {
  // Person schema only for confirmed (non-placeholder) team members so we never
  // publish structured data for fabricated names.
  const confirmedTeam = TEAM.filter((m) => !m.isPlaceholder);
  const personSchemas = confirmedTeam.map((m) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: m.name,
    jobTitle: m.role,
    description: m.bio,
    worksFor: { '@type': 'Organization', name: SITE_CONFIG.name },
  }));

  const ABOUT_FAQS = [
    {
      question: `Who is ${SITE_CONFIG.name}?`,
      answer: `${SITE_CONFIG.name} is a custom cabinet company serving Boise, Meridian, Eagle, Nampa, and the wider Treasure Valley since 2020. We design, build, and install custom kitchen, bathroom, storage, and built-in cabinetry.`,
    },
    {
      question: `What areas does ${SITE_CONFIG.name} serve?`,
      answer: `We serve the Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell, across Ada and Canyon Counties. Design consultations happen in your home by appointment.`,
    },
    {
      question: `Does ${SITE_CONFIG.name} have a showroom?`,
      answer: `We are a service-area business with no public showroom. We come to you for a free in-home design consultation, which lets us measure and plan around your actual space and lighting.`,
    },
    {
      question: `Is ${SITE_CONFIG.name} licensed and insured?`,
      answer: `Yes. We are bonded and insured for residential cabinet design and installation, and back our work with a lifetime workmanship warranty to the original homeowner.`,
    },
    {
      question: `How does a cabinet project work?`,
      answer: `Every project starts with a free design consultation, then a written scope and planning range, fabrication, and professional installation, with weekly written updates so nothing drifts.`,
    },
  ];

  const schemas = [
    generateOrganizationSchema(),
    generateWebPageSchema({
      title: `About ${SITE_CONFIG.name}`,
      description:
        'Idaho premier custom cabinet company serving the Treasure Valley. Design Studio, client portal, and white-glove installation.',
      url: '/about',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ]),
    ...personSchemas,
    generateFAQSchema(ABOUT_FAQS),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        {/* ─── Cinematic hero ─── */}
        <section className="relative min-h-[540px] md:min-h-[78vh] flex items-end overflow-hidden bg-inverse">
          <Image
            src={SITE_IMAGES.leadership}
            alt={`Custom white shaker kitchen cabinets by ${SITE_CONFIG.name} in a Treasure Valley home`}
            fill
            className="object-cover opacity-[0.9] img-brand-grade"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-inverse/85 via-inverse/45 to-inverse/5" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-inverse/50 via-inverse/15 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 pointer-events-none bg-gradient-to-b from-inverse/50 via-inverse/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: GRAIN_URL, backgroundRepeat: 'repeat', opacity: 0.03 }}
          />

          <div className="relative z-10 w-full container px-4 pb-14 md:pb-20 pt-10 fade-up">
            <HeroBreadcrumbs />
            <p data-speakable="summary" className="sr-only">
              {SPEAKABLE_SUMMARY}
            </p>
            <div className="ed-eyebrow">About us</div>
            <h1 className="ed-display ed-statement-display text-inverse-foreground mb-8">
              About {SITE_CONFIG.name.split(' ').slice(0, -1).join(' ')}{' '}
              <em className="brc-accent text-accent">{SITE_CONFIG.name.split(' ').slice(-1)}</em>
            </h1>
            <p className="text-base md:text-lg text-inverse-foreground/85 max-w-2xl leading-relaxed mb-4">
              We are Idaho&apos;s premier custom cabinet company, serving the Treasure Valley from
              design through installation.
            </p>
            <p className="text-base md:text-lg text-inverse-foreground/75 max-w-2xl leading-relaxed mb-8">
              Our focus is clarity: written scope before fabrication, proactive project updates,
              an online Design Studio to explore finishes and layouts, and a client portal to track
              every milestone. Every detail, every decision, handled with intention.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto mb-8">
              <CtaButton variant="brand">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
              <Button asChild variant="heroOutline">
                <Link href="/catalog">{CTA_EXPLORE_COLLECTIONS}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 max-w-xl divide-x divide-inverse-foreground/15 rounded-sm border border-inverse-foreground/15 bg-inverse-foreground/10 backdrop-blur-sm md:gap-3 md:divide-x-0 md:rounded-none md:border-0 md:bg-transparent md:backdrop-blur-none">
              {HERO_STATS.map((stat) => (
                <StatCard key={stat.num} num={stat.num} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── Design-build split ─── */}
        <Section variant="greige" spacing="none" divider className="p-0">
          <div className="grid md:grid-cols-2 overflow-hidden">
            <div className="relative min-h-[260px] md:min-h-[520px] overflow-hidden bg-inverse">
              <Image
                src={SITE_IMAGES.processAbout}
                alt="Boise Cabinet Co cabinetmaker assembling a frameless cabinet box in the Meridian Idaho shop"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover img-brand-grade"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary/8 to-primary/50" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: GRAIN_URL, backgroundRepeat: 'repeat', opacity: 0.028 }}
              />
              <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <div className="ed-eyebrow">How we work</div>
                <p className="font-sans font-light text-xl md:text-2xl text-inverse-foreground">
                  One team from
                  <br />
                  design to installation
                </p>
              </div>
            </div>

            <div className="section-y-sm px-8 md:px-14 lg:px-16 bg-card border-l border-border">
              <Reveal>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/svg/seal/dark/boise-cabinet-co-seal-bone-accent.svg"
                  alt="Boise Cabinet Co seal"
                  width={64}
                  height={64}
                  className="mb-7 h-16 w-16 rounded-full"
                />
                <SectionHeader
                  eyebrow="Our model"
                  title={
                    <>
                      Cabinet design,{' '}
                      <em className="brc-accent text-accent">one team</em>
                    </>
                  }
                  description="Your designer, estimator, and installation lead work together under one roof. Layout, finishes, hardware, fabrication, and schedule stay aligned so your kitchen, bath, storage, and built-in projects do not drift between vendors."
                  className="mb-8 max-w-none"
                />
                <p className="text-base text-muted-foreground leading-relaxed mb-8">
                  {SITE_CONFIG.trust.licenseNumber
                    ? `Idaho contractor license #${SITE_CONFIG.trust.licenseNumber}. `
                    : 'Idaho contractor license information is available upon request. '}
                  We are bonded and insured for residential cabinet design and installation across
                  the Treasure Valley.
                </p>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {TRUST_ITEMS.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Where your money goes"
              title={
                <>
                  Don&apos;t pay for a vendor&apos;s{' '}
                  <em className="brc-accent text-accent">overhead</em>
                </>
              }
              description="Big offices, fancy showrooms, fleets of trucks, and layers of management do not absorb themselves. They get built into the price and passed down the line."
              className="mb-6"
            />
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              We built Boise Cabinet Co lean on purpose. Instead of expensive overhead, we invest
              where it shows up in the finished space: skilled craftsmen, better materials, and
              workmanship you can stand behind. For the homeowners and builders we work with, that
              means pricing you can plan around and cabinetry built to hold up, on every project.
              Every dollar goes into the work, not our bills.
            </p>
          </div>
        </Section>

        <WhyChooseUsSection />

        {/* ─── Team ─── */}
        {/*
          The team section renders only once there are real people to name.
          TEAM still holds placeholder entries (isPlaceholder: true) as a
          scaffold, and rendering those published cards for "Founder & Owner"
          and "Lead Designer" as if they were staff - unfinished-looking to a
          visitor, and worse, fabricated people on the one page whose job is
          establishing trust.

          Gating on confirmedTeam, the same list the Person schema is built
          from, means the page and its structured data can never disagree: add
          a member with isPlaceholder: false and the section and its schema
          both appear on their own.
        */}
        {confirmedTeam.length > 0 && (
        <Section divider>
          <div className="container px-4 max-w-5xl">
            <SectionHeader
              eyebrow="The team"
              title={
                <>
                  One accountable{' '}
                  <em className="brc-accent text-accent">team</em>
                </>
              }
              description="The same people guide your project from first design conversation through final walkthrough."
              align="left"
              className="mb-10"
            />
            <div className="ed-cards-3 gap-6">
              {confirmedTeam.map((member, i) => (
                <Reveal key={member.role} delay={Math.min(i, 3) * 60}>
                  <MarketingCard className="h-full p-6">
                    <h3 className="font-serif font-medium text-base mb-1">{member.name}</h3>
                    <p className="text-xs tracking-[0.1em] uppercase text-accent mb-3">
                      {member.role}
                    </p>
                    <p className="text-base text-muted-foreground leading-relaxed">{member.bio}</p>
                  </MarketingCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
        )}

        <StatementBandSection />

        {/* ─── Principles ─── */}
        <Section variant="inverse" divider>
          <div className="container px-4 max-w-5xl">
            <SectionHeader
              eyebrow="Our standards"
              inverse
              size="display"
              title={
                <>
                  Six principles we never{' '}
                  <em className="brc-accent text-accent">compromise</em> on
                </>
              }
              className="mb-0 max-w-3xl"
            />
            <Hairline inverse className="mt-8 mb-12" />
            <div className="ed-cards-3 gap-6">
              {PRINCIPLES.map(({ title, desc }, i) => (
                <Reveal key={title} delay={Math.min(i, 5) * 60}>
                  <div className="h-full">
                    <DisplayNum className="text-2xl text-accent leading-none mb-4 block">
                      {formatStepNumber(i)}
                    </DisplayNum>
                    <h3 className="font-serif font-medium text-sm mb-2 text-inverse-foreground">
                      {title}
                    </h3>
                    <p className="text-base text-inverse-muted leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── FAQ ─── */}
        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Common questions"
              title="About Boise Cabinet Co"
              className="mb-8 max-w-none"
            />
            <Accordion type="single" collapsible className="w-full">
              {ABOUT_FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`about-faq-${i}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Section>

        {/* ─── Closing CTA ─── */}
        <Section surface="gradient" spacing="xl" edge>
          <div className="ed-shell">
            <div className="ed-split ed-split-center">
              <h2 className="ed-h2-sm ed-statement-wide">
                Ready to start your project?
              </h2>
              <div>
              <p className="ed-body">
                Schedule a free in-home visit for planning guidance, design direction, and an honest
                project range.
              </p>
              <div className="mt-8"><CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
            </div>

              </div></div>
          </div>
        </Section>
      </div>
    </>
  );
}
