import { InteriorHero,InteriorPage } from '@/components/approved/InteriorLayout';
import { Section } from '@/components/marketing/Section';
import { AboveFoldActions } from '@/components/marketing/AboveFoldActions';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { CtaButton } from '@/components/modals/CtaButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { Reveal } from '@/components/Reveal';
import { SaveContactLink } from '@/components/SaveContactLink';
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from '@/components/ui/accordion';
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from '@/lib/page-metadata';
import {
generateBreadcrumbSchema,
generateFAQSchema,
generateOrganizationSchema,
generateWebPageSchema,
} from '@/lib/schema';
import { CTA_ESTIMATE,CTA_EXPLORE_COLLECTIONS } from '@/shared/ctaCopy';
import { SITE_CONFIG } from '@/shared/siteConfig';
import { CABINET_WORKMANSHIP_WARRANTY, IDAHO_REGISTERED_CONTRACTOR, REGISTERED_BONDED_INSURED } from '@/shared/claims';
import { differentiators } from '@/components/approved/cabinet-content';
import { ArrowRight,ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const IDENTITY =
  'Boise Cabinet Co designs custom cabinets to your measurements, builds each order to your layout, finishes and hardware, and installs it with our own Treasure Valley crew.';

const SPEAKABLE_SUMMARY =
  'Boise Cabinet Co is a custom cabinet company in Meridian, Idaho, and one of the four companies of P5 Home Co. Nick Perkins designs cabinets to your measurements, builds each order to order, and installs with a Treasure Valley crew.';

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

export const metadata = withBrandPageMetadata((buildPageMetadata({
  kind: 'about',
  path: '/about',
  titleOverride: 'About Boise Cabinet Co | Nick Perkins | Meridian, Idaho',
  descriptionOverride:
    'About Boise Cabinet Co: founder Nick Perkins, custom cabinets designed to your measurements, built to order and installed by our Treasure Valley crew.',
})), "/about");

export default function AboutPage() {
  const ABOUT_FAQS = [
    {
      question: `Who is ${SITE_CONFIG.name}?`,
      answer: `${SITE_CONFIG.name} is a custom cabinet company in Meridian, Idaho, and one of the four companies of P5 Home Co. ${IDENTITY}`,
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
      question: `Is ${SITE_CONFIG.name} a registered contractor and insured?`,
      answer: `Yes. ${REGISTERED_BONDED_INSURED}. ${CABINET_WORKMANSHIP_WARRANTY}.`,
    },
    {
      question: `How does a cabinet project work?`,
      answer: `Every project starts with a free design consultation, then a written proposal with drawings, field measurement, build-to-order production, and installation by our crew, with weekly written updates so nothing drifts.`,
    },
  ];

  const schemas = [
    generateOrganizationSchema(),
    generateWebPageSchema({
      title: `About ${SITE_CONFIG.name}`,
      description:
        'Custom cabinet company in Meridian, Idaho. Designed to your measurements, built to order, installed by our Treasure Valley crew.',
      url: '/about',
    }),
    generateBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'About', url: '/about' },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Nick Perkins',
      jobTitle: 'Founder',
      description:
        'Founder of Boise Cabinet Co and P5 Home Co. Construction project manager with a bachelor\'s degree in Construction with an emphasis in Project Management and more than a decade of custom homes, remodels and developments.',
      worksFor: { '@type': 'Organization', name: SITE_CONFIG.name },
      image: `${SITE_CONFIG.siteUrl}/images/about/perkins-family-meridian-idaho.webp`,
    },
    generateFAQSchema(ABOUT_FAQS),
  ];

  return (
    <InteriorPage kind="about"><>
      <JsonLd data={schemas} />
      <div className="flex flex-col ">
        <InteriorHero layout="editorial">
            <HeroBreadcrumbs />
            <p data-speakable="summary" className="sr-only">
              {SPEAKABLE_SUMMARY}
            </p>
            <div className="ed-eyebrow">About us</div>
            <h1 className="ed-display ed-statement-display text-inverse-foreground mb-8">
              About Boise Cabinet{' '}
              <em className="brc-accent text-accent">Co</em>
            </h1>
            {/* One support line. The rest of this paragraph, the registration line
                and the collections link follow directly below the photograph. */}
            <p className="text-base md:text-lg text-inverse-foreground/85 max-w-2xl leading-relaxed">
              Boise Cabinet Co is a custom cabinet company in Meridian, Idaho, and one of the four companies of P5 Home Co.
            </p>
            <div className="interior-hero-cta">
              <CtaButton variant="brand">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
              <AboveFoldActions />
            </div>
          </InteriorHero>

        {/* Who runs it: the lede beside the one family photograph (full, never cropped),
            capped to the copy's height instead of a 2560px frame across the shell. */}
        <Section divider className="pt-0">
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow ed-split-center">
              <Reveal>
                <p className="ed-eyebrow">Who you meet</p>
                <h2 className="ed-h2 ed-statement">Nick Perkins, <em className="brc-accent text-accent">founder</em></h2>
                <p className="ed-lede mt-6">
                  It is run by Nick Perkins, a construction project manager with a bachelor&apos;s degree in Construction with an emphasis in Project Management and more than a decade of work from small renovations to multimillion-dollar custom homes. He founded P5 in Colorado in 2020 and moved to the Treasure Valley in 2025. Read the full story on{' '}
                  <a href="https://p5homeco.com/about" className="underline underline-offset-2">p5homeco.com/about</a>.
                </p>
                <blockquote className="mt-8 border-l-2 pl-6 ed-h3" style={{ borderColor: 'var(--ed-accent)' }}>
                  &ldquo;Work hard. Keep your word. Treat people right.&rdquo;
                </blockquote>
                <p className="ed-small mt-6">
                  {IDAHO_REGISTERED_CONTRACTOR}. Insured; certificate on request. {CABINET_WORKMANSHIP_WARRANTY}.
                </p>
                <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
                  <SaveContactLink showIcon className="text-sm underline underline-offset-2 text-foreground" />
                  <Link href="/catalog" className="text-sm underline underline-offset-2">{CTA_EXPLORE_COLLECTIONS}</Link>
                </div>
              </Reveal>
              <figure className="people-safe-photo m-0">
                <Image
                  src="/images/about/perkins-family-meridian-idaho.webp"
                  alt="Nick Perkins with his wife and five children at a pumpkin patch in Meridian, Idaho"
                  width={2560}
                  height={1920}
                  className="people-safe-photo w-full h-auto rounded-sm"
                  sizes="(max-width: 1024px) 100vw, 640px"
                  priority
                />
                <figcaption className="mt-3 text-sm text-muted-foreground">The Perkins family in Meridian.</figcaption>
              </figure>
            </div>
          </div>
        </Section>
        <Section variant="greige" divider>
          <div className="ed-shell">
            <div className="ed-split ed-split-narrow">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="ed-eyebrow">What we do</p>
                <h2 className="ed-h2 ed-statement">Custom cabinets, <em className="brc-accent text-accent">built to order</em></h2>
              </div>
              <div>
                <p className="ed-lede">{IDENTITY}</p>
                <p className="ed-body mt-6">
                  We design kitchens, baths, laundry, mudroom, pantry, closet, garage and built-in packages for Treasure Valley homes. We do not remodel rooms, pull whole-home permits as a general contractor on this brand, or run a public showroom. Countertops, plumbing, electrical and appliance work are scoped with you and, when needed, scheduled with licensed trade partners we stand behind.
                </p>
                <p className="ed-body mt-4">
                  Payment terms: 50% to reserve production, 50% after installation. Nothing is due until the written scope is signed.
                </p>
              </div>
            </div>
          </div>
        </Section>
        <Section divider>
          <div className="ed-shell">
            <p className="ed-eyebrow">What you can count on</p>
            <h2 className="ed-h2 ed-statement">Five promises on <em className="brc-accent text-accent">every cabinet job</em></h2>
            <ul className="ed-matrix mt-10 list-none p-0" style={{ '--ed-cell-h': '220px' } as React.CSSProperties}>
              {differentiators.map(([title, desc], i) => (
                <li key={title} className="flex flex-col gap-4">
                  <span className="ed-step-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <span className="ed-h4">{title}</span>
                  <span className="ed-body text-[0.9375rem]">{desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>
        <Section variant="inverse" divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Credentials"
              inverse
              title={<>Registered, insured, <em className="brc-accent text-accent">accountable</em></>}
              description={`${IDAHO_REGISTERED_CONTRACTOR}. Look it up at the Idaho DOPL. Boise Cabinet Co is a DBA of P5 Home Co LLC. ${CABINET_WORKMANSHIP_WARRANTY}.`}
              className="mb-0"
            />
            <p className="mt-6 text-inverse-muted text-base leading-relaxed">
              Prefer to talk first? Call or text {SITE_CONFIG.phone}. You will reach a person who does this work, not a call centre.
            </p>
          </div>
        </Section>

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
              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <CtaButton variant="brand">{CTA_ESTIMATE}</CtaButton>
                <SaveContactLink showIcon className="text-sm underline underline-offset-2" />
              </div>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </></InteriorPage>
  );
}
