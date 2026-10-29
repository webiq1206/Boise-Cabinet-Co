import { InteriorHero,InteriorPage } from '@/components/approved/InteriorLayout';
import { Section } from '@/components/marketing';
import { SectionHeader } from '@/components/marketing/SectionHeader';
import { CtaButton } from '@/components/modals/CtaButton';
import { JsonLd } from '@/components/seo/JsonLd';
import { SaveContactLink } from '@/components/SaveContactLink';
import {
Accordion,
AccordionContent,
AccordionItem,
AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
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
import { ArrowRight,Check,ChevronRight } from 'lucide-react';
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
        <InteriorHero uncropped layout="editorial" imageSrc="/images/about/perkins-family-meridian-idaho.webp" imageAlt="Nick Perkins with his wife and five children at a pumpkin patch in Meridian, Idaho">
            <HeroBreadcrumbs />
            <p data-speakable="summary" className="sr-only">
              {SPEAKABLE_SUMMARY}
            </p>
            <div className="ed-eyebrow">About us</div>
            <h1 className="ed-display ed-statement-display text-inverse-foreground mb-8">
              About Boise Cabinet{' '}
              <em className="brc-accent text-accent">Co</em>
            </h1>
            <p className="text-base md:text-lg text-inverse-foreground/85 max-w-2xl leading-relaxed mb-4">
              Boise Cabinet Co is a custom cabinet company in Meridian, Idaho, and one of the four companies of P5 Home Co. It is run by Nick Perkins, a construction project manager with a bachelor&apos;s degree in Construction with an emphasis in Project Management and more than a decade of work from small renovations to multimillion-dollar custom homes. He founded P5 in Colorado in 2020 and moved to the Treasure Valley in 2025. Read the full story on{' '}
              <a href="https://p5homeco.com/about" className="underline underline-offset-2">p5homeco.com/about</a>.
            </p>
            <p className="text-base md:text-lg text-inverse-foreground/75 max-w-2xl leading-relaxed mb-8">
              {IDAHO_REGISTERED_CONTRACTOR}. Insured; certificate on request. {CABINET_WORKMANSHIP_WARRANTY}.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap [&>*]:w-full sm:[&>*]:w-auto mb-8">
              <CtaButton variant="brand">
                {CTA_ESTIMATE} <ArrowRight className="h-4 w-4" />
              </CtaButton>
              <Button asChild variant="heroOutline">
                <Link href="/catalog">{CTA_EXPLORE_COLLECTIONS}</Link>
              </Button>
            </div>
          </InteriorHero>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="Who you meet"
              title={<>Nick Perkins, <em className="brc-accent text-accent">founder</em></>}
              description="Husband, father of five, Meridian. Construction project manager with a bachelor's degree in Construction with an emphasis in Project Management and more than a decade leading custom homes, remodels and developments."
              className="mb-6"
            />
            <figure className="people-safe-photo mb-6">
              <Image
                src="/images/about/perkins-family-meridian-idaho.webp"
                alt="Nick Perkins with his wife and five children at a pumpkin patch in Meridian, Idaho"
                width={2560}
                height={1920}
                className="people-safe-photo w-full h-auto rounded-sm"
                sizes="(max-width: 768px) 100vw, 720px"
                priority
              />
              <figcaption className="mt-3 text-sm text-muted-foreground">
                The Perkins family in Meridian.
              </figcaption>
            </figure>
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              &ldquo;Work hard. Keep your word. Treat people right.&rdquo;
            </p>
            <SaveContactLink showIcon className="text-sm underline underline-offset-2 text-foreground" />
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container px-4 max-w-5xl">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <SectionHeader
                  eyebrow="What we do"
                  title={<>Custom cabinets, <em className="brc-accent text-accent">built to order</em></>}
                  description={IDENTITY}
                  className="mb-6"
                />
                <p className="text-base md:text-lg leading-relaxed text-muted-foreground mb-4">
                  We design kitchens, baths, laundry, mudroom, pantry, closet, garage and built-in packages for Treasure Valley homes. We do not remodel rooms, pull whole-home permits as a general contractor on this brand, or run a public showroom. Countertops, plumbing, electrical and appliance work are scoped with you and, when needed, scheduled with licensed trade partners we stand behind.
                </p>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Payment terms: 50% to reserve production, 50% after installation. Nothing is due until the written scope is signed.
                </p>
              </div>
              <figure className="m-0 overflow-hidden rounded-sm">
                <Image
                  src="/images/marketing/kitchen-wood-island.webp"
                  alt="Custom wood kitchen island and cabinetry in warm natural light"
                  width={1280}
                  height={960}
                  className="h-auto w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  Kitchen cabinetry planned around how you cook and store.
                </figcaption>
              </figure>
            </div>
          </div>
        </Section>

        <Section divider spacing="none" reveal={false}>
          <div className="relative min-h-[42vh] overflow-hidden md:min-h-[52vh]">
            <Image
              src="/images/approved/kitchen.webp"
              alt="Bright kitchen with cream shaker cabinets and coordinated island"
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1f1e]/55 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 right-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#fbfaf6] md:left-12">
              Treasure Valley kitchens, designed to your measurements
            </p>
          </div>
        </Section>

        <Section divider>
          <div className="container px-4 max-w-3xl">
            <SectionHeader
              eyebrow="What you can count on"
              title={<>Five promises on <em className="brc-accent text-accent">every cabinet job</em></>}
              className="mb-8"
            />
            <ul className="space-y-4">
              {differentiators.map(([title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-base text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
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
