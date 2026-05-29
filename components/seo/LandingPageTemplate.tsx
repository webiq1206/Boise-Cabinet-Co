import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Section } from '@/components/marketing/Section';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { Button } from '@/components/ui/button';
import { RelatedLinks } from './RelatedLinks';
import { ManifestRelatedLinks } from './ManifestRelatedLinks';
import type { FAQItem } from '@/shared/seoContent';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/shared/ctaCopy';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface LandingPageTemplateProps {
  h1: string;
  speakableSummary: string;
  overview: string;
  breadcrumbs: BreadcrumbItem[];
  heroImageUrl?: string;
  manifestPath?: string;
  benefits?: string[];
  inclusions?: string[];
  timeline?: string;
  processSteps?: { title: string; description: string }[];
  localNote?: string;
  faqs: FAQItem[];
  related: {
    variant: 'service' | 'area' | 'city-service';
    serviceSlug?: string;
    citySlug?: string;
  };
}

export function LandingPageTemplate({
  h1,
  speakableSummary,
  overview,
  breadcrumbs,
  heroImageUrl,
  manifestPath,
  benefits,
  inclusions,
  timeline,
  processSteps,
  localNote,
  faqs,
  related,
}: LandingPageTemplateProps) {
  return (
    <div className="flex flex-col pb-20 md:pb-0">
      {heroImageUrl && (
        <div className="relative h-48 md:h-64 overflow-hidden bg-inverse">
          <Image
            src={heroImageUrl}
            alt=""
            fill
            className="object-cover opacity-60"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <Section spacing="sm" className={heroImageUrl ? 'pt-8 md:pt-10' : 'pt-8 md:pt-12'}>
        <div className="container px-4">
          <Breadcrumbs items={breadcrumbs} />
          <p data-speakable="summary" className="sr-only">
            {speakableSummary}
          </p>
          <h1 className="font-sans font-light text-display md:text-[2.75rem] tracking-tight text-foreground max-w-4xl mt-6 mb-6">
            {h1}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed mb-8">
            {overview}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="brand" asChild>
              <Link href="/#consult">
                {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="brandOutline" asChild>
              <Link href="/#calculator">{CTA_SECONDARY}</Link>
            </Button>
          </div>
        </div>
      </Section>

      {benefits && benefits.length > 0 && (
        <Section divider>
          <div className="container px-4 max-w-5xl">
            <h2 className="font-sans font-light text-section-title md:text-section-title-lg mb-8 text-foreground">
              Why homeowners choose us
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {benefits.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-foreground/60 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {inclusions && inclusions.length > 0 && (
        <Section divider>
          <div className="container px-4 max-w-5xl">
            <h2 className="font-sans font-light text-section-title mb-8 text-foreground">
              What&apos;s included
            </h2>
            <MarketingCard>
              <ul className="space-y-3">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-foreground/60 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </MarketingCard>
          </div>
        </Section>
      )}

      {processSteps && processSteps.length > 0 && (
        <Section divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-section-title mb-8 text-foreground">
              Our process
            </h2>
            <div className="space-y-0">
              {processSteps.map((step, i) => (
                <div
                  key={step.title}
                  className={`py-6 ${i < processSteps.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <h3 className="font-medium text-sm text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {timeline && (
        <Section divider spacing="sm">
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-xl text-foreground mb-3">Typical timeline</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{timeline}</p>
          </div>
        </Section>
      )}

      {localNote && (
        <Section divider spacing="sm">
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-xl text-foreground mb-3">Local notes</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{localNote}</p>
          </div>
        </Section>
      )}

      <Section divider>
        <div className="container px-4 max-w-3xl">
          <h2 className="font-sans font-light text-section-title mb-8 text-foreground">
            Frequently asked questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-0 border-t border-border">
                <AccordionTrigger className="text-left py-5 hover:no-underline font-sans font-medium text-sm text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed pb-6 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      <Section divider>
        <div className="container px-4 max-w-5xl space-y-12">
          <RelatedLinks {...related} />
          {manifestPath && <ManifestRelatedLinks path={manifestPath} />}
        </div>
      </Section>

      <Section variant="inverse" spacing="sm">
        <div className="container px-4 text-center max-w-2xl mx-auto">
          <h2 className="font-sans font-light text-2xl text-inverse-foreground mb-4">
            Ready to discuss your project?
          </h2>
          <p className="text-inverse-muted text-sm mb-6">
            Free 60 to 90 minute in-home visit. Planning guidance, design direction, no obligation.
          </p>
          <Button variant="brandAccent" asChild>
            <Link href="/#consult">{CTA_PRIMARY}</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
}
