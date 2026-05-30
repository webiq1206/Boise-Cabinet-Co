import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
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

function HeroBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-inverse-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-inverse-foreground transition-colors"
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

/**
 * Splits a benefit string into a bold lead phrase and a muted supporting caption.
 * Priority: split on first comma; fallback: split after first 4 words if string > 6 words.
 */
function splitBenefit(text: string): { lead: string; body: string } {
  const commaIdx = text.indexOf(',');
  if (commaIdx > 0 && commaIdx < text.length - 1) {
    return {
      lead: text.slice(0, commaIdx).trim(),
      body: text.slice(commaIdx + 1).trim(),
    };
  }
  const words = text.split(' ');
  if (words.length > 6) {
    return {
      lead: words.slice(0, 4).join(' '),
      body: words.slice(4).join(' '),
    };
  }
  return { lead: text, body: '' };
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

      {/* ─── Cinematic hero ─── */}
      <div className="relative min-h-[420px] md:min-h-[60vh] flex items-end overflow-hidden bg-inverse">
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt=""
            fill
            className="object-cover img-brand-grade"
            sizes="100vw"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-inverse via-inverse/65 to-inverse/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-inverse/30 via-transparent to-transparent" />

        <div className="relative z-10 w-full container px-4 pb-12 md:pb-16 pt-8">
          <HeroBreadcrumbs items={breadcrumbs} />
          <p data-speakable="summary" className="sr-only">
            {speakableSummary}
          </p>
          <h1 className="font-sans font-light text-display tracking-tight text-inverse-foreground max-w-4xl mt-5 mb-5">
            {h1}
          </h1>
          <p className="text-base md:text-lg text-inverse-muted max-w-2xl leading-relaxed mb-8">
            {overview}
          </p>
          <div className="flex flex-wrap gap-3">
            <ConsultCTA variant="brand">
              {CTA_PRIMARY} <ArrowRight className="h-4 w-4" />
            </ConsultCTA>
            <EstimateCTA
              variant="outline"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white"
            >
              {CTA_SECONDARY}
            </EstimateCTA>
          </div>
        </div>
      </div>

      {/* ─── Benefits ─── */}
      {benefits && benefits.length > 0 && (
        <Section variant="greige" divider>
          <div className="container px-4 max-w-5xl">
            <div className="brc-label mb-4">Why choose us</div>
            <h2 className="font-sans font-light text-section-title md:text-section-title-lg tracking-tight text-foreground mb-10">
              Why homeowners <em className="brc-accent text-accent">choose us</em>
            </h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {benefits.map((item) => {
                const { lead, body } = splitBenefit(item);
                return (
                  <li key={item} className="marketing-card p-5 flex items-start gap-3">
                    <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">
                      <strong className="font-medium text-foreground">{lead}</strong>
                      {body && (
                        <span className="text-muted-foreground">{', '}{body}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Section>
      )}

      {/* ─── Inclusions ─── */}
      {inclusions && inclusions.length > 0 && (
        <Section divider>
          <div className="container px-4 max-w-5xl">
            <div className="brc-label mb-4">Scope of work</div>
            <h2 className="font-sans font-light text-section-title tracking-tight text-foreground mb-10">
              What&apos;s <em className="brc-accent text-accent">included</em>
            </h2>
            <MarketingCard>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                {inclusions.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </MarketingCard>
          </div>
        </Section>
      )}

      {/* ─── Process ─── */}
      {processSteps && processSteps.length > 0 && (
        <Section variant="greige" divider>
          <div className="container px-4 max-w-3xl">
            <div className="brc-label mb-4">How it works</div>
            <h2 className="font-sans font-light text-section-title tracking-tight text-foreground mb-10">
              Our <em className="brc-accent text-accent">process</em>
            </h2>
            <div>
              {processSteps.map((step, i) => (
                <div key={step.title} className="flex gap-6 py-10">
                  <DisplayNum className="text-3xl w-10 flex-shrink-0 leading-none mt-0.5 text-foreground/20">
                    {formatStepNumber(i)}
                  </DisplayNum>
                  <div>
                    <h3 className="font-medium text-base text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      )}

      {/* ─── Timeline & local notes ─── */}
      {(timeline || localNote) && (
        <Section divider>
          <div className="container px-4 max-w-5xl">
            <div
              className={`grid gap-6 ${timeline && localNote ? 'md:grid-cols-2' : 'max-w-2xl'}`}
            >
              {timeline && (
                <MarketingCard className="p-6 md:p-8">
                  <div className="flex gap-4">
                    <div className="w-0.5 bg-accent/50 flex-shrink-0 rounded-full" />
                    <div>
                      <div className="brc-label mb-3">Planning details</div>
                      <h3 className="font-sans font-medium text-base text-foreground mt-3 mb-3">
                        Typical timeline
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{timeline}</p>
                    </div>
                  </div>
                </MarketingCard>
              )}
              {localNote && (
                <MarketingCard className="p-6 md:p-8">
                  <div className="flex gap-4">
                    <div className="w-0.5 bg-accent/50 flex-shrink-0 rounded-full" />
                    <div>
                      <div className="brc-label mb-3">Local details</div>
                      <h3 className="font-sans font-medium text-base text-foreground mt-3 mb-3">
                        Local notes
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{localNote}</p>
                    </div>
                  </div>
                </MarketingCard>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* ─── FAQ ─── */}
      <Section divider>
        <div className="container px-4 max-w-3xl">
          <div className="brc-label mb-4">Common questions</div>
          <h2 className="font-sans font-light text-section-title tracking-tight text-foreground mb-10">
            Frequently asked <em className="brc-accent text-accent">questions</em>
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border-0 border-t border-border"
              >
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

      {/* ─── Related links & posts ─── */}
      <Section divider>
        <div className="container px-4 max-w-5xl space-y-12">
          <RelatedLinks {...related} />
          {manifestPath && <RelatedPostCards path={manifestPath} />}
        </div>
      </Section>

      {/* ─── Bottom CTA strip ─── */}
      <Section variant="inverse" divider>
        <div className="container px-4 max-w-2xl mx-auto text-center">
          <div className="brc-label text-inverse-muted justify-center mb-6">
            Start your project
          </div>
          <h2 className="font-serif font-light text-[2rem] md:text-[2.5rem] leading-tight tracking-tight text-inverse-foreground mb-4">
            Ready to <em className="brc-accent">begin</em>?
          </h2>
          <p className="text-inverse-muted mb-8 text-base leading-relaxed">
            Free 60 to 90 minute in-home visit. Planning guidance, design direction, no
            obligation.
          </p>
          <ConsultCTA variant="brand">{CTA_PRIMARY}</ConsultCTA>
        </div>
      </Section>
    </div>
  );
}
