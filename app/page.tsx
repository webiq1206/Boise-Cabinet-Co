import { FAQSection } from "@/components/FAQSection";
import { LazyEstimateCalculator } from "@/components/estimate/LazyEstimateCalculator";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Reveal } from "@/components/Reveal";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhyChooseUsSection } from "@/components/sections/WhyChooseUsSection";
import { RoomCategoriesGrid } from "@/components/sections/RoomCategoriesGrid";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { FeaturedProjectSection } from "@/components/sections/FeaturedProjectSection";
import { CraftStatementBand } from "@/components/sections/CraftStatementBand";
import { ValueOverheadSection } from "@/components/sections/ValueOverheadSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import Image from "next/image";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { Section } from "@/components/marketing/Section";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Check } from "lucide-react";
import { CONSULT_BULLETS } from "@/shared/siteContent";
import { HomePageSchema } from "@/components/seo/HomePageSchema";
import { buildPageMetadata } from "@/lib/page-metadata";

export const metadata = buildPageMetadata({ kind: "home", path: "/" });

export default function HomePage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0 bg-background">
      <HomePageSchema />
      <HeroSection />
      {/* This sr-only summary must stay after HeroSection so its <h2> follows
          the page's one <h1> in DOM order, keeping the heading hierarchy
          valid for assistive tech and voice-answer "speakable" crawlers. */}
      <h2 data-speakable="summary" className="sr-only">
        Boise Cabinet Co is a custom cabinet company serving Boise, Meridian, Eagle,
        Nampa, Kuna, Star, Middleton, and Caldwell across Idaho&apos;s Treasure Valley.
        We design, build, and install frameless custom kitchen cabinets, bathroom
        vanities, and built-in storage, with 299 finishes, six door styles, a free
        design consultation, and a lifetime workmanship warranty.
      </h2>
      <RoomCategoriesGrid />
      <ProcessSection />
      <FeaturedProjectSection />
      <TestimonialsSection limit={3} showViewAll={true} />
      <CraftStatementBand />
      <WhyChooseUsSection limit={5} />
      <ValueOverheadSection />
      <FAQSection />
      <LazyEstimateCalculator />
      <Section
        id="consult"
        divider
        data-suppress-sticky-cta=""
        className="relative overflow-hidden pb-28 md:pb-28"
      >
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <Image
            src={MARKETING_IMAGES.heroHome}
            alt=""
            fill
            sizes="100vw"
            className="object-cover img-brand-grade"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-6 md:gap-12 items-start">
            <div className="md:col-span-2">
              <Reveal>
                <div className="brc-label mb-3 md:mb-5">Begin a conversation</div>
                {/* Base size matches the canonical display scale used by
                    SectionHeader size="display" and every other display h2.
                    It was 1.6rem, which made this the only section title that
                    shrank on mobile - 25.6px against 32px everywhere else. The
                    md and lg steps were already correct, so this is a
                    mobile-only correction. */}
                <h2 className="font-serif text-h2-fluid tracking-tight mb-3 md:mb-4 text-foreground">
                  Tell us about your{" "}
                  <em className="brc-accent text-accent">project</em>.
                </h2>
                <p className="text-base leading-relaxed mb-0 md:mb-8 text-muted-foreground">
                  We will reach out within one business day to schedule your free
                  design consultation. You will leave with planning guidance and no obligation.
                </p>
                {/* Reassurance bullets are desktop-only; the form repeats the key
                    reassurance under its submit button, so on mobile we drop them
                    to keep the fields above the fold. */}
                <div className="hidden md:block space-y-3 mt-8">
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
