import type { Metadata } from "next";
import { FAQSection } from "@/components/FAQSection";
import { LazyEstimateCalculator } from "@/components/estimate/LazyEstimateCalculator";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Reveal } from "@/components/Reveal";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { RoomCategoriesGrid } from "@/components/sections/RoomCategoriesGrid";
import { StatementBandSection } from "@/components/sections/StatementBandSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FeaturedProjectSection } from "@/components/sections/FeaturedProjectSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { Section } from "@/components/marketing/Section";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Check } from "lucide-react";
import { CONSULT_BULLETS, SITE_TAGLINE } from "@/shared/siteContent";
import { CTA_PRIMARY } from "@/shared/ctaCopy";
import { HomePageSchema } from "@/components/seo/HomePageSchema";
import { buildCanonical } from "@/lib/page-metadata";

export const metadata: Metadata = {
  title: "Boise Cabinet Co | Custom Cabinets Idaho",
  description:
    "Custom kitchen, bathroom, and storage cabinets serving Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell, Idaho. Design online or schedule a free consultation.",
  alternates: {
    canonical: buildCanonical("/"),
  },
  openGraph: {
    title: "Boise Cabinet Co | Custom Cabinets Idaho",
    description: `${SITE_TAGLINE}. Premium custom cabinetry across the Treasure Valley.`,
    type: "website",
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0 bg-background">
      <HomePageSchema />
      <h2 data-speakable="summary" className="sr-only">
        Boise Cabinet Co is a custom cabinet company serving Boise, Meridian, Eagle,
        Nampa, Kuna, Star, Middleton, and Caldwell across Idaho&apos;s Treasure Valley.
        We design, build, and install frameless custom kitchen cabinets, bathroom
        vanities, and built-in storage, with 299 finishes, six door styles, a free
        design consultation, and a lifetime workmanship warranty.
      </h2>
      <HeroSection />
      <RoomCategoriesGrid />
      <StatementBandSection />
      <ProcessSection />
      <FeaturedProjectSection />
      <TestimonialsSection limit={3} showViewAll={true} />
      <WhyChooseUsSection limit={5} />
      <FAQSection />
      <LazyEstimateCalculator />
      <Section id="consult" divider className="pb-28 md:pb-28">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <Reveal>
                <div className="brc-label mb-5">Begin a conversation</div>
                <h2 className="font-sans font-light text-[2rem] md:text-[2.75rem] lg:text-[3.25rem] leading-[1.08] tracking-tight mb-4 text-foreground">
                  Tell us about your{" "}
                  <em className="brc-accent text-accent">project</em>.
                </h2>
                <p className="text-base leading-relaxed mb-8 text-muted-foreground">
                  We will reach out within one business day to schedule your free
                  design consultation. You will leave with planning guidance and no obligation.
                </p>
                <div className="space-y-3">
                  {CONSULT_BULLETS.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 flex-shrink-0 text-foreground/60" />
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
