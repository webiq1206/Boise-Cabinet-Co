import { LazyConsultationForm as ConsultationForm } from "@/components/LazyConsultationForm";
import { PreferToTextLine } from "@/components/contact/PreferToTextLine";
import { Reveal } from "@/components/Reveal";
import { ApprovedHome } from "@/components/approved/ApprovedHome";
import { HomeTestimonials } from "@/components/sections/HomeTestimonials";
import { HomePageSchema } from "@/components/seo/HomePageSchema";
import { QuoteFormAnchor } from "@/components/quote/QuoteFormAnchor";
import { withBrandPageMetadata } from '@/lib/brand-page-metadata';
import { buildPageMetadata } from "@/lib/page-metadata";
import { publicText } from "@/shared/claims";
import { CONSULT_BULLETS } from "@/shared/siteContent";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { ArrowUpRight, Check } from "lucide-react";

export const metadata = withBrandPageMetadata((buildPageMetadata({ kind: "home", path: "/" })), "/");

export default function HomePage() {
  return (
    <div className="flex flex-col bg-background">
      <HomePageSchema />
      <ApprovedHome reviews={<HomeTestimonials />} />
      {/* Answer block for screen readers and answer engines. A paragraph, not a
          heading: it is a 60-word summary, not the title of a section. */}
      <p data-speakable="summary" className="sr-only">
        {publicText("Boise Cabinet Co designs custom cabinets to your measurements, builds each order to your layout, finishes and hardware, and installs it with our own Treasure Valley crew. Kitchen cabinets, bathroom vanities, and built-in storage across Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell, with 299 finishes, six door styles, a free design consultation, and a 2-year workmanship warranty on installation.")}
      </p>
      <div id="contact" className="scroll-mt-24" aria-hidden="true" />
      {/* The ask. A bone band with the form as the one bright object on the screen:
          white card, accent top rule, deep shadow. "#consult" lands on the form card
          itself (owner, 1 November): on phones the form comes first and the
          introduction follows it; on wide screens it sits beside the form. */}
      <section className="fr-request cabinet-approved" data-suppress-sticky-cta="" aria-label="Request a quote">
        <div className="section wrap">
          <div className="fr-request-grid">
            <div className="order-1 lg:order-2 lg:col-start-2 lg:row-start-1">
              <div className="fr-request-card" id="consult" data-quote-anchor="">
                <ConsultationForm idPrefix="home-quote" />
              </div>
              <QuoteFormAnchor id="consult" />
            </div>
            <div className="fr-request-copy order-2 lg:order-1 lg:col-start-1 lg:row-start-1">
              <Reveal>
                <p className="eyebrow">BEGIN A CONVERSATION</p>
                <h2>Tell us about<br /><em style={{ color: "var(--f-accent)" }}>your project.</em></h2>
                <p>We will reach out within one business day to schedule your free design consultation.</p>
                <p><PreferToTextLine /></p>
                <p>You will leave with planning guidance and no obligation.</p>
                <ul className="fr-request-list">
                  {CONSULT_BULLETS.map((item) => (
                    <li key={item}>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ul className="fr-request-list" style={{ borderTop: 0, paddingTop: 0 }}>
                  <li><a href={SITE_CONFIG.phoneHref} className="text-link">Call {SITE_CONFIG.phone} <ArrowUpRight size={16} aria-hidden="true" /></a></li>
                  <li><a href={SITE_CONFIG.phoneSmsHref} className="text-link">Send a text <ArrowUpRight size={16} aria-hidden="true" /></a></li>
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
