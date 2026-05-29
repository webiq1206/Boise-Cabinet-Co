import type { Metadata } from "next";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { FAQSection } from "@/components/FAQSection";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Reveal } from "@/components/Reveal";
import { HeroSection } from "@/components/sections/HeroSection";
import { ClientPriorities } from "@/components/sections/ClientPriorities";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { InclusionsSection } from "@/components/sections/InclusionsSection";
import { BudgetGuidance } from "@/components/sections/BudgetGuidance";
import { LeadershipSection } from "@/components/sections/LeadershipSection";
import { ProjectGallerySection } from "@/components/sections/ProjectGallerySection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { Section } from "@/components/marketing/Section";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Check } from "lucide-react";
import { PRINCIPLES, FINANCING_BULLETS, CONSULT_BULLETS, SITE_TAGLINE } from "@/shared/siteContent";
import { HomePageSchema } from "@/components/seo/HomePageSchema";
import { buildCanonical } from "@/lib/page-metadata";

export const metadata: Metadata = {
  title: "Boise Remodeling Co | Treasure Valley Design-Build",
  description:
    "Design-build remodeling serving Boise, Meridian, Eagle, Nampa, Kuna, Star and Middleton, Idaho. Clear expectations, budget guidance, and proactive communication from first call to final walkthrough. Schedule a free in-home consultation.",
  alternates: {
    canonical: buildCanonical("/"),
  },
  openGraph: {
    title: "Boise Remodeling Co | Treasure Valley Design-Build",
    description:
      `${SITE_TAGLINE}. Kitchen, bathroom, whole-home, and addition remodeling across the Treasure Valley.`,
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0 bg-background">
      <HomePageSchema />
      <HeroSection />
      <ClientPriorities />
      <WhyChooseUsSection />
      <ServicesGrid />
      <ProcessSection />
      <ProjectGallerySection limit={3} />
      <EstimateCalculator />
      <InclusionsSection />
      <BudgetGuidance />

      <Section divider>
        <div className="container px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            <Reveal>
              <SectionHeader
                eyebrow="Flexible financing"
                title="Financing that works for you"
                description={
                  <>
                    We partner with GreenSky and Mosaic to offer{" "}
                    <strong className="text-foreground font-medium">flexible financing options</strong> on qualifying
                    projects. Five-minute application, same-day decision.
                  </>
                }
                reveal={false}
                className="mb-0 max-w-none"
              />
            </Reveal>
            <MarketingCard>
              <ul className="space-y-4">
                {FINANCING_BULLETS.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <Check className="h-4 w-4 flex-shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href="#consult"
                  className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
                >
                  Discuss financing options <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </MarketingCard>
          </div>
        </div>
      </Section>

      <LeadershipSection />
      <TestimonialsSection limit={4} showViewAll={true} />

      <Section id="principles" variant="inverse" divider>
        <div className="container px-4">
          <SectionHeader
            eyebrow="How we work"
            title="Six principles we never compromise on"
            inverse
            className="mb-10"
          />
          <div className="grid md:grid-cols-2 border-t border-inverse-foreground/10">
            {PRINCIPLES.map(({ title, desc }, i) => (
              <Reveal
                key={title}
                delay={Math.floor(i / 2) * 60}
                className={`py-8 border-b border-inverse-foreground/10 pr-0 ${
                  i % 2 === 0 ? "md:pr-12 md:border-r" : "md:pl-12"
                }`}
              >
                <div className="w-5 h-px mb-5 bg-inverse-foreground/25" />
                <h3 className="font-sans font-medium text-sm mb-2 text-inverse-foreground">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-inverse-muted">{desc}</p>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 pt-12 border-t border-inverse-foreground/10">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-8">
              <ShieldCheck className="h-9 w-9 flex-shrink-0 text-accent" />
              <div className="flex-1">
                <h3 className="font-sans font-medium text-sm mb-1.5 text-inverse-foreground">
                  2-Year Workmanship Guarantee
                </h3>
                <p className="text-sm leading-relaxed text-inverse-muted">
                  Industry standard is one year. Ours is two, because we build things meant
                  to outlast the guarantee. If we built it and it fails, we fix it. Free.
                </p>
              </div>
              <Button variant="brandInverseOutline" asChild>
                <a href="#consult">Schedule your consultation</a>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <FAQSection />

      <Section id="consult" divider className="pb-36 md:pb-28">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <Reveal>
                <div className="brc-label mb-5">Begin a conversation</div>
                <h2 className="font-serif font-light text-section-title md:text-section-title-lg mb-4 text-foreground">
                  Tell us about your home.
                </h2>
                <p className="text-sm leading-relaxed mb-8 text-muted-foreground">
                  We will reach out within one business day to schedule your free
                  60 to 90 minute in-home visit. You will leave with planning guidance,
                  design direction, and no obligation.
                </p>
                <div className="space-y-3">
                  {CONSULT_BULLETS.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 flex-shrink-0 text-accent" />
                      {item}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <MarketingCard className="md:col-span-3" padding="lg">
              <ConsultationForm />
            </MarketingCard>
          </div>
        </div>
      </Section>
    </div>
  );
}
