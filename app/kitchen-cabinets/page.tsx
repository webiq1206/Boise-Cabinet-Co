import { KitchenCabinetsQuoteForm } from "@/components/marketing/KitchenCabinetsQuoteForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { withBrandPageMetadata } from "@/lib/brand-page-metadata";
import { generateFAQSchema, generateWebPageSchema } from "@/lib/schema";
import type { Metadata } from "next";

const TITLE = "Boise Kitchen Cabinets, Installed Fast | Boise Cabinet Co";
const DESCRIPTION =
  "Kitchen cabinets sourced and installed by our own crew. Bonded and insured, Idaho Registered Contractor #8381215. Call or text (208) 477-1169 for a free estimate.";
const TEL_HREF = "tel:+12084771169";
const SMS_HREF = "sms:+12084771169";
const HOURS = "Call or text Mon\u2013Fri 9 AM\u20136 PM, Sat 9 AM\u20134 PM (Mountain).";
const WEEKS = "4\u20138 weeks";

const FAQS = [
  {
    question: "How long does it take?",
    answer: `Typically ${WEEKS} from order to install, and often faster for ready-to-assemble lines. We'll give you a timeline with your estimate.`,
  },
  {
    question: "What areas do you serve?",
    answer:
      "Homeowners across Ada and Canyon counties, including Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell and Garden City.",
  },
  {
    question: "How much do kitchen cabinets cost?",
    answer:
      "It depends on the size of your kitchen and the cabinet line you choose. The estimate is free, so call, text or send the form and we'll give you a real number.",
  },
  {
    question: "Are you registered and insured?",
    answer: "Yes. We're an Idaho Registered Contractor #8381215, and we're bonded and insured.",
  },
];

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

function CallTextButtons() {
  const linkClass =
    "inline-flex min-h-14 items-center justify-center rounded-md px-6 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <a href={TEL_HREF} className={`${linkClass} bg-primary text-primary-foreground`}>
        Call (208) 477-1169
      </a>
      <a href={SMS_HREF} className={`${linkClass} border border-foreground/80 text-foreground`}>
        Text (208) 477-1169
      </a>
    </div>
  );
}

export default function KitchenCabinetsPage() {
  return (
    <div className="bg-background text-foreground">
      <JsonLd
        data={[
          generateWebPageSchema({ title: TITLE, description: DESCRIPTION, url: "/kitchen-cabinets" }),
          generateFAQSchema(FAQS),
        ]}
      />
      <article className="mx-auto max-w-3xl px-6 py-10 pb-28 md:pb-16">
        <header className="space-y-5">
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Boise Kitchen Cabinets, Installed Fast
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Kitchen cabinets sourced and installed by our own crew, typically in {WEEKS} and often faster for ready-to-assemble lines.
          </p>
          <CallTextButtons />
          <p className="text-sm text-muted-foreground">{HOURS}</p>
        </header>

        <section id="quick-quote" className="mt-12 scroll-mt-24 space-y-5">
          <h2 className="font-serif text-3xl text-foreground">Get a free estimate</h2>
          <KitchenCabinetsQuoteForm />
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="font-serif text-3xl text-foreground">Why Boise Cabinet Co</h2>
          <ul className="space-y-4 text-base leading-relaxed">
            <li>
              <strong>Our own install crew.</strong> Your cabinets are sourced and installed by our own crew, with trade partners where needed.
            </li>
            <li>
              <strong>Bonded, insured and registered.</strong> Idaho Registered Contractor #8381215.
            </li>
            <li>
              <strong>Typically {WEEKS}.</strong> That&apos;s our usual lead time, and it&apos;s often faster for ready-to-assemble lines.
            </li>
          </ul>
        </section>

        <section className="mt-14 space-y-4">
          <h2 className="font-serif text-3xl text-foreground">How it works</h2>
          <ol className="list-decimal space-y-4 pl-5 text-base leading-relaxed">
            <li>
              <strong>Reach out.</strong> Call, text or send the quick form with a few details about your kitchen.
            </li>
            <li>
              <strong>Get your free estimate.</strong> We go over layout, styles and finishes with you and give you a clear quote.
            </li>
            <li>
              <strong>We install.</strong> Our crew installs your new cabinets, typically within {WEEKS} and often faster for ready-to-assemble lines.
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
          <h2 className="font-serif text-3xl text-foreground">Ready for new kitchen cabinets?</h2>
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

      <nav
        aria-label="Call or text"
        className="fixed inset-x-0 bottom-0 z-[100] grid grid-cols-2 border-t border-border bg-background pb-safe md:hidden"
      >
        <a
          href={TEL_HREF}
          className="flex min-h-14 items-center justify-center border-r border-border font-medium"
        >
          Call
        </a>
        <a href={SMS_HREF} className="flex min-h-14 items-center justify-center font-medium">
          Text
        </a>
      </nav>
    </div>
  );
}
