import { ArrowRight, Check, ChevronRight, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import Link from 'next/link';
import { JsonLd } from '@/components/seo/JsonLd';
import Image from 'next/image';
import { DisplayNum, Section } from '@/components/marketing';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { Hairline } from '@/components/marketing/Hairline';
import { SITE_IMAGES } from '@/shared/siteImages';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { Reveal } from '@/components/Reveal';
import { StatementBandSection } from '@/components/sections/StatementBandSection';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateWebPageSchema,
} from '@/lib/schema';
import { BUSINESS_INFO } from '@/lib/seo';
import { SITE_CONFIG } from '@/shared/siteConfig';
import { ConsultationForm } from '@/components/ConsultationForm';
import { SiteEmailLink } from '@/components/SiteEmailLink';
import { CTA_ESTIMATE } from '@/shared/ctaCopy';
import { CONSULT_BULLETS, HERO_STATS } from '@/shared/siteContent';
import { CtaButton } from '@/components/modals/CtaButton';

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E")`;

const SPEAKABLE_SUMMARY =
  'Contact Boise Cabinet Co for a free design consultation. Call our team, schedule a visit, or use the Design Studio to explore cabinet options for your Treasure Valley home.';

function HeroBreadcrumbs() {
  const items = [
    { name: 'Home', href: '/' },
    { name: 'Contact' },
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

interface ContactChannelProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  subtext: string;
  featured?: boolean;
}

function ContactChannel({
  icon,
  label,
  href,
  external,
  children,
  subtext,
  featured,
}: ContactChannelProps) {
  const inner = (
    <MarketingCard
      className={`h-full transition-colors ${
        href ? 'group-hover:border-accent/60' : ''
      } ${featured ? 'md:p-10' : ''}`}
      padding={featured ? 'lg' : 'default'}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-sm bg-accent/10 text-accent">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="ed-eyebrow !mb-2">{label}</p>
          <div
            className={`text-foreground ${featured ? 'text-xl md:text-2xl' : 'text-base'} ${
              href ? 'group-hover:text-foreground/70 transition-colors' : ''
            }`}
          >
            {children}
          </div>
          <p className="text-base text-muted-foreground mt-1.5 leading-relaxed">{subtext}</p>
        </div>
      </div>
    </MarketingCard>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block h-full group"
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {inner}
      </a>
    );
  }

  return inner;
}

export const metadata = buildPageMetadata({
  kind: 'contact',
  path: '/contact',
});

export default function ContactPage() {
  const schemas = [
    generateLocalBusinessSchema(),
    generateWebPageSchema({
      title: `Contact ${SITE_CONFIG.name}`,
      description:
        'Schedule a free design consultation or explore options in our online Design Studio.',
      url: '/contact',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Contact', url: '/contact' },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="flex flex-col pb-20 md:pb-0">
        {/* ─── Cinematic hero ─── */}
        <section className="relative min-h-[520px] md:min-h-[72vh] flex items-end overflow-hidden bg-inverse">
          <Image
            src={SITE_IMAGES.contactHero}
            alt="Custom bathroom vanity cabinets in a Meridian Idaho home by Boise Cabinet Co"
            title="Contact Boise Cabinet Co | Custom Cabinets Idaho"
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
            <div className="ed-eyebrow">Get in touch</div>
            <h1 className="ed-display ed-statement-display text-inverse-foreground mb-8">
              Contact {SITE_CONFIG.name.split(' ').slice(0, -1).join(' ')}{' '}
              <em className="brc-accent text-accent">{SITE_CONFIG.name.split(' ').slice(-1)}</em>
            </h1>
            <p className="text-base md:text-lg text-inverse-foreground/85 max-w-2xl leading-relaxed mb-6">
              Schedule a free design consultation, call our team, or use the Design Studio to
              explore cabinet options for your home.
            </p>
            <a
              href={SITE_CONFIG.phoneHref}
              className="tap-target inline-block brc-display-num tabular-nums text-2xl md:text-3xl text-inverse-foreground hover:text-inverse-foreground/75 transition-colors mb-8"
            >
              {BUSINESS_INFO.phone}
            </a>
            <div className="flex flex-wrap gap-3 mb-8">
              <CtaButton variant="brand">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
            </div>
            <div className="grid grid-cols-3 max-w-xl divide-x divide-inverse-foreground/15 rounded-sm border border-inverse-foreground/15 bg-inverse-foreground/10 backdrop-blur-sm md:gap-3 md:divide-x-0 md:rounded-none md:border-0 md:bg-transparent md:backdrop-blur-none">
              {HERO_STATS.map((stat) => (
                <StatCard key={stat.num} num={stat.num} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── Consultation form ─── */}
        <Section id="consult" divider data-suppress-sticky-cta="">
          <div className="container px-4 max-w-5xl mx-auto grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <SectionHeader
                eyebrow="Begin a conversation"
                size="display"
                title={
                  <>
                    Tell us about your{' '}
                    <em className="brc-accent text-accent">project</em>
                  </>
                }
                description="We respond within one business day. Share your goals and we will schedule a free in-home design consultation."
                className="max-w-none"
              />
            </div>
            <MarketingCard className="md:col-span-3" padding="lg">
              <ConsultationForm />
            </MarketingCard>
          </div>
        </Section>

        {/* ─── Contact channels ─── */}
        <Section variant="greige" divider>
          <div className="container px-4 max-w-5xl">
            <SectionHeader
              eyebrow="Reach us directly"
              size="display"
              title={
                <>
                  Every way to{' '}
                  <em className="brc-accent text-accent">connect</em>
                </>
              }
              description="Call, email, or visit, we respond within one business day and never use high-pressure sales tactics."
              className="max-w-3xl"
            />
            <div className="ed-grid-balance grid sm:grid-cols-2 gap-4">
              <Reveal className="sm:col-span-2">
                <ContactChannel
                  icon={<Phone className="h-5 w-5" strokeWidth={1.5} />}
                  label="Call us"
                  href={SITE_CONFIG.phoneHref}
                  subtext="Mon – Fri 7 am – 6 pm · Sat 8 am – 4 pm"
                  featured
                >
                  <span className="brc-display-num tabular-nums">{BUSINESS_INFO.phone}</span>
                </ContactChannel>
              </Reveal>
              <Reveal delay={60}>
                <ContactChannel
                  icon={<MessageSquare className="h-5 w-5" strokeWidth={1.5} />}
                  label="Text us"
                  href={SITE_CONFIG.phoneSmsHref}
                  subtext="Quick questions, fast replies"
                >
                  <span className="brc-display-num tabular-nums">{BUSINESS_INFO.phone}</span>
                </ContactChannel>
              </Reveal>
              <Reveal delay={120}>
                <ContactChannel
                  icon={<Mail className="h-5 w-5" strokeWidth={1.5} />}
                  label="Email us"
                  subtext="Response within one business day"
                >
                  <SiteEmailLink className="tap-target text-inherit hover:text-foreground/70 transition-colors text-left bg-transparent border-0 p-0 cursor-pointer font-inherit text-xl md:text-2xl" />
                </ContactChannel>
              </Reveal>
              <Reveal delay={180}>
                <ContactChannel
                  icon={<MapPin className="h-5 w-5" strokeWidth={1.5} />}
                  label="Where we work"
                  subtext="Treasure Valley · Ada and Canyon County"
                >
                  <address className="not-italic leading-relaxed">
                    {BUSINESS_INFO.address.city}, {BUSINESS_INFO.address.state}
                    <br />
                    We come to you - free in-home consultations by appointment.
                    No public showroom.
                  </address>
                </ContactChannel>
              </Reveal>
            </div>
          </div>
        </Section>

        {/* ─── What to expect split ─── */}
        <Section variant="canvas" spacing="none" divider className="p-0">
          <div className="grid md:grid-cols-2 overflow-hidden">
            <div className="relative min-h-[260px] md:min-h-[520px] overflow-hidden bg-inverse order-2 md:order-1">
              <Image
                src={SITE_IMAGES.processContact}
                alt="Boise Cabinet Co designer measuring a kitchen and reviewing cabinet door samples during an in-home consultation"
                title="Design consultation | Boise Cabinet Co"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover img-brand-grade"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: GRAIN_URL, backgroundRepeat: 'repeat', opacity: 0.028 }}
              />
              <div className="absolute bottom-0 left-0 p-8 md:p-12">
                <div className="ed-eyebrow">Your free visit includes</div>
                <p className="font-sans font-light text-xl md:text-2xl text-inverse-foreground">
                  No pressure.
                  <br />
                  No pitch. Just answers.
                </p>
              </div>
            </div>

            <div className="section-y-sm px-8 md:px-14 lg:px-16 bg-card border-l border-border order-1 md:order-2">
              <Reveal>
                <SectionHeader
                  eyebrow="What to expect"
                  title={
                    <>
                      No pressure. No pitch.{' '}
                      <em className="brc-accent text-accent">Just answers.</em>
                    </>
                  }
                  description="Your free 60 to 90 minute in-home visit is focused on planning guidance and an honest project range, not a commission-driven pitch."
                  className="mb-8 max-w-none"
                />
                <ul className="flex flex-col gap-0 mb-8">
                  {CONSULT_BULLETS.map((bullet, i) => (
                    <li key={bullet}>
                      <div className="flex items-start gap-3 py-4">
                        <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-base text-foreground">{bullet}</span>
                      </div>
                      {i < CONSULT_BULLETS.length - 1 && (
                        <Hairline spaced={false} className="my-0" />
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        <StatementBandSection />

        {/* ─── Closing CTA ─── */}
        <Section surface="gradient" spacing="xl" edge>
          <div className="ed-shell">
            <Reveal>
              <div className="ed-split ed-split-center">
                <h2 className="ed-h2-sm ed-statement-wide">
                  Prefer to talk first?
                </h2>
              <div>
                <p className="ed-body">
                  Call us directly, no phone tree, no sales scripts.
                </p>
                <a
                  href={SITE_CONFIG.phoneHref}
                  className="tap-target inline-block brc-display-num tabular-nums text-2xl text-inverse-foreground hover:text-inverse-foreground/75 transition-colors mb-8"
                >
                  {BUSINESS_INFO.phone}
                </a>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                  <CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
                </div>
              
              </div></div>
            </Reveal>
          </div>
        </Section>
      </div>
    </>
  );
}
