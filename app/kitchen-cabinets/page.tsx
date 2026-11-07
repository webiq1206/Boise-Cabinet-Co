import { LandingMobileActions } from "@/components/marketing/LandingMobileActions";
import { PreferToTextLine } from "@/components/contact/PreferToTextLine";
import { LandingContactActions } from "@/components/marketing/LandingContactActions";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import { QuoteFormAnchor } from "@/components/quote/QuoteFormAnchor";
import { JsonLd } from "@/components/seo/JsonLd";
import { withBrandPageMetadata } from "@/lib/brand-page-metadata";
import { generateFAQSchema, generateWebPageSchema } from "@/lib/schema";
import { REGISTERED_BONDED_INSURED } from "@/shared/claims";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { Clock, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

const TITLE = "Boise Cabinets for Kitchens, Baths & Built-Ins | Boise Cabinet Co";
const DESCRIPTION =
  "Kitchen cabinets, bathroom vanities and built-ins in Boise. Idaho Registered Contractor #8381215. Call or text (208) 477-1169.";
const TEL_HREF = "tel:+12084771169";
const SMS_HREF = "sms:+12084771169";
const HOURS = "Call or text Mon\u2013Fri 9 AM\u20136 PM, Sat 9 AM\u20134 PM (Mountain).";

const HERO_IMAGE = "/images/service-scenes/kitchen.webp";
const TILES = [
  {
    src: "/images/approved/kitchen.webp",
    label: "Kitchen cabinets",
    alt: "Kitchen with cream cabinetry, a wood island, and a stone counter",
  },
  {
    src: "/images/approved/bathroom.webp",
    label: "Bathroom vanities",
    alt: "Bathroom vanity with light wood cabinets and a stone counter",
  },
  {
    src: "/images/catalog/rooms/built-ins.webp",
    label: "Built-ins",
    alt: "Built-in cabinets and open shelves along a living room wall",
  },
] as const;

const FAQS = [
  {
    question: "How long does it take?",
    answer:
      "Your written quote confirms the timeline.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "Homeowners across Ada and Canyon counties, including Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell and Garden City.",
  },
  {
    question: "What do you install?",
    answer:
      "Kitchen cabinets, bathroom vanities and built-ins. We don't refinish or reface existing cabinets.",
  },
  {
    question: "How much do new cabinets cost?",
    answer:
      "It depends on the size of the space and the cabinet line you choose. The estimate is free, so call, text or send the form and we'll give you a real number.",
  },
  {
    question: "Are you a registered contractor and insured?",
    answer: `Yes. ${REGISTERED_BONDED_INSURED}.`,
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "Registered & insured" },
  { icon: Clock, label: "Project review" },
  { icon: Sparkles, label: "Free estimate" },
] as const;

export const metadata: Metadata = withBrandPageMetadata(
  {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/kitchen-cabinets" },
    robots: {
      index: false,
      follow: false,
      googleBot: { index: false, follow: false, noimageindex: true },
    },
    openGraph: { url: "/kitchen-cabinets", title: TITLE, description: DESCRIPTION },
  },
  "/kitchen-cabinets",
);

function CallTextButtons({ onDark = false }: { onDark?: boolean }) {
  const linkClass =
    "inline-flex min-h-14 w-full items-center justify-center rounded-md px-5 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto sm:min-w-[220px]";
  return (
    <div className="grid grid-cols-2 gap-3">
      <a
        href={TEL_HREF}
        className={
          onDark
            ? `${linkClass} bg-[#fbfaf6] text-[var(--color-charcoal)] focus-visible:ring-[#fbfaf6]`
            : `${linkClass} bg-primary text-primary-foreground focus-visible:ring-ring`
        }
      >
        Call (208) 477-1169
      </a>
      <a
        href={SMS_HREF}
        className={
          onDark
            ? `${linkClass} border border-[#fbfaf6] text-[#fbfaf6] focus-visible:ring-[#fbfaf6]`
            : `${linkClass} border border-foreground/80 text-foreground focus-visible:ring-ring`
        }
      >
        Text (208) 477-1169
      </a>
    </div>
  );
}

export default function KitchenCabinetsPage() {
  return (
    <div className="kc-landing bg-background text-foreground">
      <style>{`
        /* Keep the standard AppFrame/primary nav; only theme the landing hero. */
        .approved-shell .kc-hero,
        .approved-shell .kc-hero h1,
        .approved-shell .kc-hero p { color: #fbfaf6; }
        .approved-shell .kc-hero h1 { font-size: clamp(30px, 7.6vw, 60px); line-height: 1.05; }
        @media (max-width: 767px) {
          .approved-shell .kc-hero { min-height: 0; padding-block: var(--section-y); }
          .approved-shell .kc-hero-copy { padding-block: 0; }
          .approved-shell .kc-hero h1 { font-size: var(--fs-page-title, var(--fs-h1)); }
        }
      `}</style>
      <JsonLd
        data={[
          generateWebPageSchema({ title: TITLE, description: DESCRIPTION, url: "/kitchen-cabinets" }),
          generateFAQSchema(FAQS),
        ]}
      />

      <section data-p5-hero className="kc-hero pt-0 relative flex min-h-[32rem] items-end overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Ivory kitchen cabinetry with an oak island, stone backsplash and pendant lighting"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--color-forest) 92%, transparent), color-mix(in srgb, var(--color-forest) 72%, transparent) 55%, color-mix(in srgb, var(--color-forest) 60%, transparent))" }} aria-hidden="true" />
        <div className="kc-hero-copy relative z-10 mx-auto w-full max-w-5xl px-5 pb-4 pt-6 sm:px-8 sm:pb-16 sm:pt-16">
          <h1 className="max-w-[16ch] font-serif">
            Boise cabinets for kitchens, baths &amp; built-ins
          </h1>
          <p className="mt-4 max-w-[36rem] text-base leading-snug sm:text-lg sm:leading-relaxed">
            Kitchen cabinets, bathroom vanities and built-ins. Your written quote confirms the timeline.
          </p>
          <div className="mt-6">
            <LandingContactActions onDark formId="quick-quote" formLabel="Request a Cabinet Estimate" showContactNote={false} />
          </div>
        </div>
      </section>

      <div className="bg-[var(--color-charcoal)] px-5 py-4 text-[#fbfaf6] sm:px-8" aria-label="Cabinet service details">
        <div className="mx-auto w-full max-w-5xl">
          <p className="mb-4 text-sm">{SITE_CONFIG.phone} · Prefer another option? Use the form below.</p>
          <ul className="flex flex-wrap gap-2">
            {TRUST.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#fbfaf6]/35 bg-[color-mix(in_srgb,var(--color-forest)_55%,transparent)] px-3 py-1.5 text-[13px] leading-tight text-[#fbfaf6]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

        {/* "#quick-quote" lands on the form: heading and first field first. */}
        <section id="quick-quote" data-quote-anchor="" data-suppress-sticky-cta="" className="fr-request cabinet-approved" aria-label="Request a quote">
          <div className="section wrap">
            <div className="fr-request-grid">
              <div className="order-1 lg:order-2 lg:col-start-2 lg:row-start-1">
                <div className="fr-request-card">
                  <KitchenCabinetsQuoteForm idPrefix="kitchen-quote" projectPrompt="Your kitchen: a full set, a refresh, an island, or not sure yet" />
                </div>
                <QuoteFormAnchor id="quick-quote" />
              </div>
              <div className="fr-request-copy order-2 lg:order-1 lg:col-start-1 lg:row-start-1">
                <p className="eyebrow">FREE DESIGN CONSULTATION</p>
                <h2>Tell us about<br /><em style={{ color: 'var(--f-accent)' }}>your kitchen.</em></h2>
                <p>A full set, a refresh, an island, or not sure yet. Send a few details and we reply within one business day to schedule a free in-home design consultation.</p>
                <p><PreferToTextLine className="[&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_a]:!underline" /></p>
                <p>You will leave with a layout direction, door and finish guidance, and a written proposal with drawings before anything is ordered.</p>
              </div>
            </div>
          </div>
        </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-5 py-8 sm:grid-cols-3 sm:px-8" aria-label="Cabinet types">
        {TILES.map((tile) => (
          <figure key={tile.label} className="overflow-hidden">
            <div className="relative aspect-[4/3]">
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="pt-2 text-sm font-medium text-foreground">{tile.label}</figcaption>
          </figure>
        ))}
      </section>

      <article className="mx-auto max-w-3xl px-6 pb-28 md:pb-16">


        <section className="mt-14 space-y-4">
          <h2 className="font-serif text-3xl text-foreground">Why Boise Cabinet Co</h2>
          <ul className="space-y-4 text-base leading-relaxed">
            <li>
              <strong>Kitchens, baths and built-ins.</strong> Kitchen cabinets, bathroom vanities and built-ins for Ada and Canyon County homes.
            </li>
            <li>
              <strong>Registered and insured.</strong> {REGISTERED_BONDED_INSURED}.
            </li>
            <li>
              <strong>Your written quote confirms the timeline.</strong> We&apos;ll give you a timeline with your estimate.
            </li>
          </ul>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="font-serif text-3xl text-foreground">How it works</h2>
          <ol className="list-decimal space-y-4 pl-5 text-base leading-relaxed">
            <li>
              <strong>Reach out.</strong> Call, text or send the quick form with a few details about your project.
            </li>
            <li>
              <strong>Get your free estimate.</strong> We go over layout, door styles like shaker and slab, and finishes with you, and give you a clear quote.
            </li>
            <li>
              <strong>We install.</strong> We install your new cabinets. Your written quote confirms the timeline.
            </li>
          </ol>
        </section>

        <section className="mt-14 space-y-6">
          <h2 className="font-serif text-3xl text-foreground">FAQ</h2>
          {FAQS.map((faq) => (
            <div key={faq.question} className="space-y-2">
              <h3 className="text-xl font-medium text-foreground">{faq.question}</h3>
              <p className="leading-relaxed text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </section>

        <section className="mt-14 space-y-5" data-suppress-sticky-cta="">
          <h2 className="font-serif text-3xl text-foreground">Ready for new cabinets?</h2>
          <p className="leading-relaxed text-muted-foreground">
            Call or text for a free estimate, Mon{"\u2013"}Fri 9 AM{"\u2013"}6 PM, Sat 9 AM{"\u2013"}4 PM (Mountain).
          </p>
          <CallTextButtons />
          <p>
            <a href="#quick-quote" className="underline underline-offset-2">
              Get a free estimate
            </a>
          </p>
        </section>
      </article>

      <LandingMobileActions />
    </div>
  );
}
