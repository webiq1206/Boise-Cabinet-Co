import { LandingMobileActions } from "@/components/marketing/LandingMobileActions";
import { LandingContactActions } from "@/components/marketing/LandingContactActions";
import { ApprovedBrand } from "@/components/approved/ApprovedBrand";
import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { withBrandPageMetadata } from "@/lib/brand-page-metadata";
import { generateFAQSchema, generateWebPageSchema } from "@/lib/schema";
import { Clock, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

const TITLE = "Boise Cabinets for Kitchens, Baths & Built-Ins | Boise Cabinet Co";
const DESCRIPTION =
  "Kitchen cabinets, bathroom vanities and built-ins. Bonded and insured. Call or text (208) 477-1169 for a free estimate.";
const TEL_HREF = "tel:+12084771169";
const SMS_HREF = "sms:+12084771169";
const HOURS = "Call or text Mon\u2013Fri 9 AM\u20136 PM, Sat 9 AM\u20134 PM (Mountain).";

const HERO_IMAGE = "/images/approved/hero-p5-v2.webp";
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
      "As fast as 3 weeks from order to install on many projects. We'll give you a timeline with your estimate.",
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
    question: "Are you bonded and insured?",
    answer: "Yes. We're bonded and insured.",
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "Bonded & insured" },
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
            ? `${linkClass} bg-[#fbfaf6] text-[#2c302f] focus-visible:ring-[#fbfaf6]`
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
        .approved-shell:has(.kc-landing) > .flex > header { display: none !important; }
        .approved-shell .kc-hero,
        .approved-shell .kc-hero h1,
        .approved-shell .kc-hero p { color: #fbfaf6; }
        .approved-shell .kc-hero h1 { font-size: clamp(30px, 7.6vw, 60px); line-height: 1.05; }
        @media (max-width: 767px) {
          .approved-shell .kc-hero { min-height: 0; }
          .approved-shell .kc-hero h1 { font-size: 30px; }
        }
      `}</style>
      <JsonLd
        data={[
          generateWebPageSchema({ title: TITLE, description: DESCRIPTION, url: "/kitchen-cabinets" }),
          generateFAQSchema(FAQS),
        ]}
      />

      <header data-approved-navigation className="z-[100] w-full">
        <nav className="flex items-center">
          <ApprovedBrand />
        </nav>
      </header>

      <section data-p5-hero className="kc-hero relative flex min-h-[32rem] items-end overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Kitchen with natural white oak cabinetry, cream shaker cabinets, ivory stone, and bronze details"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(28,31,30,0.92), rgba(28,31,30,0.72) 55%, rgba(28,31,30,0.60))" }} aria-hidden="true" />
        <div className="relative z-10 mx-auto w-full max-w-5xl px-5 pb-4 pt-6 sm:px-8 sm:pb-16 sm:pt-16">
          <h1 className="max-w-[16ch] font-serif">
            Boise Cabinets for Kitchens, Baths &amp; Built-Ins
          </h1>
          <p className="mt-4 max-w-[36rem] text-base leading-snug sm:text-lg sm:leading-relaxed">
            Kitchen cabinets, bathroom vanities and built-ins, installed as fast as 3 weeks.
          </p>
          <div className="mt-5">
            <LandingContactActions onDark formId="quick-quote" formLabel="Request a Cabinet Estimate" />
          </div>
          
          <ul className="mt-5 flex flex-wrap gap-2">
            {TRUST.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#fbfaf6]/35 bg-[#1c1f1e]/55 px-3 py-1.5 text-[13px] leading-tight text-[#fbfaf6]"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

        <section tabIndex={-1} id="quick-quote" className="mx-auto w-full max-w-3xl px-6 py-8 scroll-mt-28 space-y-5">
          <h2 className="font-serif text-3xl text-foreground">Get a free estimate</h2>
          <p>Share a few details about your kitchen. Your request will be reviewed by our team.</p>
          <KitchenCabinetsQuoteForm />
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
              <strong>Bonded and insured.</strong> We&apos;re bonded and insured for every install.
            </li>
            <li>
              <strong>As fast as 3 weeks.</strong> Many projects install as fast as 3 weeks. We&apos;ll give you a timeline with your estimate.
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
              <strong>We install.</strong> We install your new cabinets, as fast as 3 weeks.
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
