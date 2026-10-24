import { ConsultationForm } from "@/components/ConsultationForm";
import { Reveal } from "@/components/Reveal";
import { ApprovedHome } from "@/components/approved/ApprovedHome";
import { HomeTestimonials } from "@/components/sections/HomeTestimonials";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { Section } from "@/components/marketing/Section";
import { HomePageSchema } from "@/components/seo/HomePageSchema";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from "@/lib/page-metadata";
import { publicText } from "@/shared/claims";
import { CONSULT_BULLETS } from "@/shared/siteContent";
import { MARKETING_IMAGES } from "@/shared/siteImages";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ArrowUpRight, Check } from "lucide-react";
import Image from "next/image";

export const metadata = withBrandPageMetadata((buildPageMetadata({ kind: "home", path: "/" })), "/");

export default function HomePage() {
  return (
    <div className="flex flex-col bg-background">
      <HomePageSchema />
      <ApprovedHome reviews={<HomeTestimonials />} />
      <h2 data-speakable="summary" className="sr-only">
        {publicText("Boise Cabinet Co is a custom cabinet company serving Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell across Idaho's Treasure Valley. We design, source, and install frameless custom kitchen cabinets, bathroom vanities, and built-in storage, with 299 finishes, six door styles, a free design consultation, and a written workmanship guarantee.")}
      </h2>
      <div id="contact" className="scroll-mt-24" aria-hidden="true" />
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
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover img-brand-grade"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        </div>
        {/* The ask. Full measure, heading at h2 scale, the form kept in its
            card because a form needs a defined field to sit in - this is one of
            the places a card is actually the right answer. */}
        <div className="ed-shell relative z-10">
          <div className="grid gap-[var(--ed-gutter)] lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="lg:sticky lg:top-28">
              <Reveal>
                <p className="ed-eyebrow">Begin a conversation</p>
                <h2 className="ed-h2 ed-statement">
                  Tell us about your{" "}
                  <em className="not-italic" style={{ color: "var(--ed-accent)" }}>
                    project
                  </em>
                  .
                </h2>
                <p className="ed-lede mt-8 max-w-[40ch]">
                  We will reach out within one business day to schedule your free
                  design consultation.
                </p>
                <p className="ed-body mt-4">
                  You will leave with planning guidance and no obligation.
                </p>
                {/* Reassurance bullets are desktop-only; the form repeats the key
                    reassurance under its submit button, so on mobile we drop them
                    to keep the fields above the fold. */}
                <ul
                  className="mt-8 hidden list-none gap-3 border-t p-0 pt-6 md:grid"
                  style={{ borderColor: "var(--ed-line)" }}
                >
                  {CONSULT_BULLETS.map((item) => (
                    <li key={item} className="ed-body flex items-center gap-3 text-[0.875rem]">
                      <Check
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "var(--ed-accent)" }}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 grid border-t" style={{ borderColor: "var(--ed-line)" }}>
                  <a href={SITE_CONFIG.phoneHref} className="flex min-h-12 items-center justify-between gap-4 border-b text-[0.9375rem] font-medium transition-colors hover:[color:var(--ed-accent)]" style={{ borderColor: "var(--ed-line)" }}>
                    Call {SITE_CONFIG.phone}
                    <ArrowUpRight className="h-4 w-4 shrink-0" style={{ color: "var(--ed-accent)" }} aria-hidden="true" />
                  </a>
                  <a href={SITE_CONFIG.phoneSmsHref} className="flex min-h-12 items-center justify-between gap-4 border-b text-[0.9375rem] font-medium transition-colors hover:[color:var(--ed-accent)]" style={{ borderColor: "var(--ed-line)" }}>
                    Send a text
                    <ArrowUpRight className="h-4 w-4 shrink-0" style={{ color: "var(--ed-accent)" }} aria-hidden="true" />
                  </a>
                </div>
              </Reveal>
            </div>
            <MarketingCard padding="lg">
              <ConsultationForm />
            </MarketingCard>
          </div>
        </div>
      </Section>
    </div>
  );
}
