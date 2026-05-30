import Image from 'next/image';
import { ArrowRight, Check } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DisplayNum, formatStepNumber, Section } from '@/components/marketing';
import { MarketingCard } from '@/components/marketing/MarketingCard';
import { RelatedLinks } from './RelatedLinks';
import { RelatedPostCards } from '@/components/marketing/RelatedPostCards';
import type { FAQItem } from '@/shared/seoContent';
import { CTA_PRIMARY, CTA_SECONDARY } from '@/shared/ctaCopy';
import { ConsultCTA } from '@/components/modals/ConsultCTA';
import { EstimateCTA } from '@/components/modals/EstimateCTA';
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
            className="object-cover opacity-70 img-brand-grade"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-inverse/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
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
            <ConsultCTA variant="brand">
              {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
            </ConsultCTA>
            <EstimateCTA variant="brandOutline">
              {CTA_SECONDARY}
            </EstimateCTA>
          </div>
        </div>
      </Section>

      {benefits && benefits.length > 0 && (
        <Section variant="greige" divider>
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
        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <h2 className="font-sans font-light text-section-title mb-8 text-foreground">
              Our process
            </h2>
            <div className="space-y-0">
              {processSteps.map((step, i) => (
                <div
                  key={step.title}
                  className={`flex gap-5 py-6 ${i < processSteps.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <DisplayNum className="text-2xl w-8 flex-shrink-0 leading-none mt-0.5 text-foreground/20">
                    {formatStepNumber(i)}
                  </DisplayNum>
                  <div>
                    <h3 className="font-medium text-sm text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
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
          {manifestPath && <RelatedPostCards path={manifestPath} />}
        </div>
      </Section>

      <Section divider spacing="sm">
        <div className="container px-4 max-w-2xl mx-auto">
          <div className="marketing-card p-10 md:p-12 text-center">
            <h2 className="font-sans font-light text-2xl text-foreground mb-4">
              Ready to discuss your project?
            </h2>
            <p className="text-muted-foreground text-base mb-6">
              Free 60 to 90 minute in-home visit. Planning guidance, design direction, no obligation.
            </p>
            <ConsultCTA variant="brand">
              {CTA_PRIMARY}
            </ConsultCTA>
          </div>
        </div>
      </Section>
    </div>
  );
}
