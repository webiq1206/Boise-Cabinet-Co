import type { Metadata } from "next";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { FAQSection } from "@/components/FAQSection";
import { ConsultationForm } from "@/components/ConsultationForm";
import { Reveal } from "@/components/Reveal";
import { FOUNDING_SPOTS_REMAINING } from "@/shared/contentData";
import { ArrowRight, ShieldCheck, Star, Check, CalendarDays, PenLine, HardHat } from "lucide-react";

export const metadata: Metadata = {
  title: "Boise Remodeling Co — A More Honest Way to Remodel",
  description:
    "Design-build remodeling serving Boise, Meridian, Eagle, Nampa, Kuna, Star & Middleton, Idaho. Transparent pricing, 3D renders, and a dedicated project manager from first call to final walkthrough. Book a free in-home consultation.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://boiseremodeling.co",
  },
  openGraph: {
    title: "Boise Remodeling Co — A More Honest Way to Remodel",
    description:
      "Design-build remodeling with transparent pricing, 3D renders, and a dedicated project manager — serving the full Treasure Valley.",
    type: "website",
  },
};

const GRAIN_URL = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C%2Fsvg%3E")`;

const GALLERY_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80",
    alt: "Modern kitchen remodel with warm wood tones",
    caption: "A kitchen you actually want to cook in",
  },
  {
    src: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80",
    alt: "Spa-quality bathroom with freestanding tub",
    caption: "Where mornings become rituals",
  },
  {
    src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    alt: "Open-concept living room and kitchen",
    caption: "Light, space, intention",
  },
  {
    src: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80",
    alt: "Designer kitchen with island and pendant lighting",
    caption: "The island everyone gathers around",
  },
  {
    src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
    alt: "Serene bedroom with warm finishes",
    caption: "Rest, finally",
  },
  {
    src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
    alt: "Luxury bathroom with custom tile",
    caption: "Custom tile, custom life",
  },
  {
    src: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=800&q=80",
    alt: "Kitchen detail with handcrafted cabinetry",
    caption: "In the details",
  },
  {
    src: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=800&q=80",
    alt: "Bright open kitchen with natural light",
    caption: "Built for the way you actually live",
  },
];

const TRUST_ITEMS = [
  "Licensed · Bonded · Insured",
  "$2M Liability · Fully Insured",
  "Permits Handled · In-House",
  "Financing · From 0% APR",
  "2-Year Workmanship Guarantee",
];

const PROMISE_ITEMS = [
  {
    num: "01",
    title: "The transparent model",
    body: "You see cost of materials, labor, and our fixed management fee. No hidden markups, ever.",
  },
  {
    num: "02",
    title: "3D renders before demolition",
    body: "You'll see exactly what your home will look like before we pull a single permit.",
  },
  {
    num: "03",
    title: "Weekly written updates",
    body: "Every Friday: what was completed, what's next, any decisions needed from you.",
  },
  {
    num: "04",
    title: "The 2-year guarantee",
    body: "Industry standard is 12 months. We stand behind our work for 24.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    icon: CalendarDays,
    title: "Book your free visit",
    body: "60–90 minutes. We walk your space, hear your goals, and give you a rough range on the spot. No pitch.",
    foot: "Same-week availability",
  },
  {
    icon: PenLine,
    title: "3D design & detailed scope",
    body: "You'll see exactly what your space will look like, with every line item visible before a single permit is pulled.",
    foot: "Detailed line-item pricing",
  },
  {
    icon: HardHat,
    title: "Permits handled. Build begins.",
    body: "We know the Ada and Canyon County offices. We handle the paperwork while you stay in your home.",
    foot: "Permits included in scope",
  },
];

const HOW_WE_BUILD_STEPS = [
  {
    number: "01",
    title: "Free in-home visit",
    desc: "We walk your space, hear your goals, and give you a rough range on the spot — no obligation.",
  },
  {
    number: "02",
    title: "3D design + detailed scope",
    desc: "You see exactly what your space will look like before we pull a single permit. Every line item is visible.",
  },
  {
    number: "03",
    title: "Permits handled for you",
    desc: "We know the Ada and Canyon County offices. Permits are built into your schedule from day one.",
  },
  {
    number: "04",
    title: "Weekly progress updates",
    desc: "Every Friday you get a written update: what was done, what's next, any decisions needed from you.",
  },
  {
    number: "05",
    title: "Final walkthrough & 2-year guarantee",
    desc: "We walk every inch with you. If we built it and it fails, we fix it — free, for two years.",
  },
];

const PRINCIPLES = [
  {
    title: "No hidden markups",
    desc: "You see our cost of materials and labor, plus our fixed management fee. No mystery.",
  },
  {
    title: "Written change orders only",
    desc: "If scope changes mid-project, you get a written change order before any work begins. Always.",
  },
  {
    title: "We respect your time",
    desc: "Noisy work during reasonable hours. Dust barriers every day. Your home stays livable.",
  },
  {
    title: "One PM, start to finish",
    desc: "Your project manager is the same person from design day to final walkthrough. You always know who to call.",
  },
  {
    title: "Speed without shortcuts",
    desc: "We run parallel workflows where possible. Faster timelines, same quality — because you shouldn't have to wait.",
  },
  {
    title: "2-year workmanship guarantee",
    desc: "Industry standard is one year. Ours is two. Because we build things meant to last longer than that.",
  },
];

const ALWAYS_INCLUDED = [
  "3D renders before demo begins",
  "All permits pulled in-house",
  "Dedicated project manager",
  "Weekly written progress updates",
  "Dust barriers & floor protection daily",
  "2-year workmanship guarantee",
  "Manufacturer warranties passed through",
];

const WHERE_IT_GOES = [
  { label: "Materials & fixtures", pct: 40 },
  { label: "Skilled labor", pct: 35 },
  { label: "Permits & inspections", pct: 8 },
  { label: "Project management", pct: 12 },
  { label: "Design & renders", pct: 5 },
];

const FOUNDING_BENEFITS = [
  { text: "Priority scheduling over general-market leads" },
  { text: "Locked-in founding pricing before public launch" },
  { text: "Complimentary design consultation (normally $250)" },
  { text: "First-look access to our portfolio and references" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0" style={{ background: "#F5F1E8" }}>

      {/* ── 1. HERO ── */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: "radial-gradient(120% 80% at 78% 12%, #E5C9A4 0%, #B7916D 28%, #6B4F36 60%, #2D1F15 100%)",
        }}
      >
        {/* Grain texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: GRAIN_URL, backgroundRepeat: "repeat", opacity: 0.035 }}
        />
        {/* Left dark wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(115deg, rgba(20,16,12,.68) 0%, rgba(20,16,12,.22) 48%, rgba(20,16,12,0) 72%)" }}
        />

        <div className="relative z-10 container px-4 md:px-8 py-28 md:py-36">
          <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 md:gap-16 items-center">
            {/* Left */}
            <Reveal>
              <div className="brc-label mb-6" style={{ color: "rgba(255,255,255,0.42)" }}>
                Boise Remodeling Co — Treasure Valley Design-Build
              </div>
              <h1
                className="font-serif font-light text-white leading-[1.04] tracking-tight mb-6"
                style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
              >
                A more{" "}
                <em className="italic" style={{ color: "#E5C9A4" }}>
                  honest
                </em>{" "}
                way to remodel.
              </h1>
              <p
                className="text-lg md:text-xl leading-relaxed mb-10 max-w-xl"
                style={{ color: "rgba(255,255,255,0.68)" }}
              >
                Transparent pricing, 3D renders, permits handled — all under one roof.
                Book a free in-home visit.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm"
                  style={{ background: "#2D5F47", color: "#FBF8F1" }}
                >
                  Get my starting range
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#consult"
                  className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm"
                  style={{
                    background: "rgba(251,248,241,0.10)",
                    color: "#FBF8F1",
                    border: "1px solid rgba(251,248,241,0.22)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  Book a free visit
                </a>
              </div>
              <div className="mt-10 pt-8 border-t border-white/10">
                <p
                  className="text-[11px] tracking-[0.12em] uppercase"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  Serving Boise · Meridian · Eagle · Nampa · Kuna · Star · Middleton
                </p>
              </div>
            </Reveal>

            {/* Right: hero stats */}
            <div className="hidden md:flex flex-col gap-3">
              {[
                { num: "60 sec", label: "Instant estimate" },
                { num: "0% APR", label: "Financing available" },
                { num: "2 yr", label: "Workmanship guarantee" },
              ].map((stat, i) => (
                <Reveal key={stat.num} delay={i * 90}>
                  <div
                    className="px-6 py-5 rounded-sm"
                    style={{
                      background: "rgba(251,248,241,0.07)",
                      border: "1px solid rgba(251,248,241,0.12)",
                    }}
                  >
                    <div
                      className="font-serif font-light text-white text-3xl leading-none"
                    >
                      {stat.num}
                    </div>
                    <div
                      className="mt-1.5 text-[11px] tracking-[0.1em] uppercase"
                      style={{ color: "rgba(255,255,255,0.42)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP ── */}
      <section style={{ background: "#1C1A17" }} className="py-4">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-x-8 md:gap-x-12 gap-y-2">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-[11px] tracking-[0.10em] uppercase font-medium"
                style={{ color: "rgba(245,241,232,0.42)" }}
              >
                <span
                  className="w-1 h-1 rounded-full flex-shrink-0"
                  style={{ background: "#2D5F47" }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PROMISE BAR ── */}
      <section id="services" style={{ background: "#FBF8F1" }} className="py-20 md:py-28">
        <div className="container px-4">
          <Reveal className="mb-14">
            <div className="brc-label mb-3">What we stand for</div>
            <h2
              className="font-serif font-light text-3xl md:text-4xl tracking-tight"
              style={{ color: "#1C1A17" }}
            >
              Four things we never compromise on
            </h2>
          </Reveal>
          <div
            className="grid sm:grid-cols-2 lg:grid-cols-4 border-t"
            style={{ borderColor: "rgba(28,26,23,0.12)" }}
          >
            {PROMISE_ITEMS.map((item, i) => (
              <Reveal
                key={item.num}
                delay={i * 60}
                className="pt-8 pb-8 pr-0 lg:pr-10 border-b sm:border-b-0 last:border-0"
                style={{ borderColor: "rgba(28,26,23,0.12)" }}
              >
                <div
                  className="w-6 h-px mb-6"
                  style={{ background: "#2D5F47" }}
                />
                <h3
                  className="font-sans font-medium text-sm mb-2"
                  style={{ color: "#1C1A17" }}
                >
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#8F8B82" }}>
                  {item.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW WE BUILD — featured 2-panel ── */}
      <section id="how-we-build" className="grid md:grid-cols-2 overflow-hidden">
        {/* Left: image panel */}
        <div className="relative min-h-[380px] md:min-h-[560px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=1200&q=80"
            alt="Project manager reviewing blueprints"
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(28,26,23,0.08) 0%, rgba(28,26,23,0.62) 100%)",
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: GRAIN_URL,
              backgroundRepeat: "repeat",
              opacity: 0.028,
            }}
          />
          <div className="absolute bottom-0 left-0 p-8 md:p-12">
            <div
              className="brc-label mb-3"
              style={{ color: "rgba(245,241,232,0.45)" }}
            >
              How We Build
            </div>
            <p
              className="font-serif font-light text-xl md:text-2xl"
              style={{ color: "#FBF8F1" }}
            >
              Free in-home visit
              <br />
              to final walkthrough
            </p>
          </div>
        </div>

        {/* Right: content */}
        <div
          className="py-16 md:py-20 px-8 md:px-14 lg:px-16"
          style={{ background: "#FBF8F1" }}
        >
          <Reveal>
            <div className="brc-label mb-5">Our process</div>
            <h2
              className="font-serif font-light text-3xl md:text-4xl leading-tight mb-10"
              style={{ color: "#1C1A17" }}
            >
              From first visit to{" "}
              <em className="italic" style={{ color: "#2D5F47" }}>
                final walkthrough
              </em>
            </h2>
            <div className="space-y-0">
              {HOW_WE_BUILD_STEPS.map((step, i) => (
                <div
                  key={step.number}
                  className={`flex gap-5 py-6 ${i < HOW_WE_BUILD_STEPS.length - 1 ? "border-b" : ""}`}
                  style={{ borderColor: "rgba(28,26,23,0.10)" }}
                >
                  <span
                    className="font-serif font-light text-2xl w-8 flex-shrink-0 leading-none mt-0.5"
                    style={{ color: "rgba(28,26,23,0.18)" }}
                  >
                    {step.number}
                  </span>
                  <div>
                    <p
                      className="font-medium text-sm mb-1"
                      style={{ color: "#1C1A17" }}
                    >
                      {step.title}
                    </p>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "#8F8B82" }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS — 3 steps ── */}
      <section style={{ background: "#F5F1E8" }} className="py-20 md:py-28">
        <div className="container px-4">
          <Reveal className="mb-12">
            <div className="brc-label mb-3">Our simple process</div>
            <h2
              className="font-serif font-light text-3xl md:text-4xl"
              style={{ color: "#1C1A17" }}
            >
              Three steps to a finished home
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-4">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 80}>
                <div
                  className="p-8 rounded-sm h-full flex flex-col"
                  style={{
                    background: "#FBF8F1",
                    border: "1px solid rgba(28,26,23,0.08)",
                  }}
                >
                  <step.icon
                    className="h-6 w-6 mb-6 flex-shrink-0"
                    style={{ color: "#2D5F47" }}
                  />
                  <h3
                    className="font-sans font-medium text-sm mb-3"
                    style={{ color: "#1C1A17" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed flex-1"
                    style={{ color: "#8F8B82" }}
                  >
                    {step.body}
                  </p>
                  <div
                    className="mt-6 pt-5 border-t text-[11px] tracking-[0.10em] uppercase font-medium"
                    style={{
                      borderColor: "rgba(28,26,23,0.10)",
                      color: "#2D5F47",
                    }}
                  >
                    {step.foot}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. ESTIMATE CALCULATOR ── */}
      <EstimateCalculator />

      {/* ── 7. VALUE CARDS ── */}
      <section style={{ background: "#FBF8F1" }} className="py-16 md:py-20">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-4">
            {/* Always included */}
            <div
              className="p-8 rounded-sm"
              style={{
                background: "#F5F1E8",
                border: "1px solid rgba(28,26,23,0.08)",
              }}
            >
              <h3
                className="font-sans font-medium text-sm mb-6"
                style={{ color: "#1C1A17" }}
              >
                Always included — regardless of scope
              </h3>
              <ul className="space-y-3">
                {ALWAYS_INCLUDED.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: "#4D4944" }}
                  >
                    <Check
                      className="h-4 w-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#2D5F47" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Where the money goes */}
            <div
              className="p-8 rounded-sm"
              style={{
                background: "#F5F1E8",
                border: "1px solid rgba(28,26,23,0.08)",
              }}
            >
              <h3
                className="font-sans font-medium text-sm mb-6"
                style={{ color: "#1C1A17" }}
              >
                Where the money goes
              </h3>
              <div className="space-y-4">
                {WHERE_IT_GOES.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: "#8F8B82" }}>{item.label}</span>
                      <span className="font-medium" style={{ color: "#1C1A17" }}>
                        {item.pct}%
                      </span>
                    </div>
                    <div
                      className="h-[2px] rounded-full overflow-hidden"
                      style={{ background: "#E8E2D3" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${item.pct}%`, background: "#2D5F47" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-5 italic" style={{ color: "#8F8B82" }}>
                Approximate averages across all project types and finish levels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. FINANCING ── */}
      <section style={{ background: "#E4ECDE" }} className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            <Reveal>
              <div className="brc-label mb-4" style={{ color: "#2D5F47" }}>
                Flexible financing
              </div>
              <h2
                className="font-serif font-light text-3xl md:text-4xl mb-4"
                style={{ color: "#1C1A17" }}
              >
                Financing that works for you
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: "#4D4944" }}>
                We partner with GreenSky and Mosaic to offer financing starting from{" "}
                <strong style={{ color: "#1C1A17" }}>0% APR</strong> on qualifying
                projects. Five-minute application, same-day decision.
              </p>
            </Reveal>
            <div
              className="rounded-sm p-8"
              style={{
                background: "#FBF8F1",
                border: "1px solid rgba(28,26,23,0.08)",
              }}
            >
              <ul className="space-y-4">
                {[
                  "Terms from 12 to 144 months",
                  "Soft credit check to view offers",
                  "No prepayment penalties",
                  "Same-day approval decisions",
                  "Works alongside cash, check, or wire",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "#4D4944" }}
                  >
                    <Check
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "#2D5F47" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <div
                className="mt-6 pt-6 border-t"
                style={{ borderColor: "rgba(28,26,23,0.10)" }}
              >
                <a
                  href="#consult"
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: "#2D5F47" }}
                >
                  Discuss financing options <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FOUNDER NOTE ── */}
      <section id="founder" style={{ background: "#F5F1E8" }} className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-[2fr_3fr] gap-12 md:gap-20 items-start">
            {/* Portrait placeholder */}
            <div
              className="aspect-[4/5] rounded-sm overflow-hidden order-2 md:order-1"
              style={{
                background: "linear-gradient(135deg, #D4C4A8 0%, #A8906A 100%)",
              }}
            >
              <div className="w-full h-full flex items-end p-6">
                <p
                  className="text-[11px] italic"
                  style={{ color: "rgba(28,26,23,0.4)" }}
                >
                  Founder photo coming soon
                </p>
              </div>
            </div>
            {/* Text */}
            <div className="order-1 md:order-2">
              <Reveal>
                <div className="brc-label mb-5">A word from our founder</div>
                <div
                  className="space-y-4 text-base leading-relaxed mb-8"
                  style={{ color: "#4D4944" }}
                >
                  <p>
                    I&apos;ve lived in Boise most of my life. And for years, I watched
                    homeowners — friends, neighbors, family — go through remodels that
                    left them frustrated, broke, or both. Contractors who disappeared.
                    Budgets that doubled. Kitchens that looked nothing like the promise.
                  </p>
                  <p>
                    I started this company because I believe remodeling doesn&apos;t have to
                    be like that. The work is hard. The timelines are real. But the
                    communication, the pricing, the respect for your home — those are
                    choices.
                  </p>
                  <p>
                    We choose differently. Every cost is visible. Every change is written
                    down before it happens. Every Friday, you hear from us.
                  </p>
                  <p className="font-medium" style={{ color: "#1C1A17" }}>
                    That&apos;s not a marketing promise. It&apos;s just how we run the company.
                  </p>
                </div>
                <p
                  className="font-serif font-light text-lg italic"
                  style={{ color: "#1C1A17" }}
                >
                  — The Founder, Boise Remodeling Co
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. PRINCIPLES ── */}
      <section id="principles" style={{ background: "#1C1A17" }} className="py-20 md:py-28">
        <div className="container px-4">
          <Reveal className="mb-14">
            <div
              className="brc-label mb-4"
              style={{ color: "rgba(245,241,232,0.32)" }}
            >
              How we work
            </div>
            <h2
              className="font-serif font-light text-3xl md:text-4xl"
              style={{ color: "#FBF8F1" }}
            >
              Six principles we never compromise on
            </h2>
          </Reveal>
          <div
            className="grid md:grid-cols-2 border-t"
            style={{ borderColor: "rgba(245,241,232,0.10)" }}
          >
            {PRINCIPLES.map(({ title, desc }, i) => (
              <Reveal
                key={title}
                delay={Math.floor(i / 2) * 60}
                className={`py-8 border-b pr-0 ${i % 2 === 0 ? "md:pr-12 md:border-r" : "md:pl-12"}`}
                style={{ borderColor: "rgba(245,241,232,0.10)" }}
              >
                <div
                  className="w-5 h-px mb-5"
                  style={{ background: "rgba(245,241,232,0.22)" }}
                />
                <h3
                  className="font-sans font-medium text-sm mb-2"
                  style={{ color: "#FBF8F1" }}
                >
                  {title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(245,241,232,0.42)" }}
                >
                  {desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. FOUNDING CLIENTS ── */}
      <section
        id="founding-clients"
        style={{ background: "#E4ECDE" }}
        className="py-20 md:py-28"
      >
        <div className="container px-4">
          <div className="max-w-3xl mx-auto">
            <Reveal>
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-4 w-4" style={{ color: "#2D5F47" }} />
                <span
                  className="text-[11px] tracking-[0.12em] uppercase font-medium"
                  style={{ color: "#2D5F47" }}
                >
                  Founding Client Offer — {FOUNDING_SPOTS_REMAINING} of 10 spots remaining
                </span>
              </div>
              <h2
                className="font-serif font-light text-3xl md:text-4xl mb-5"
                style={{ color: "#1C1A17" }}
              >
                Be one of our first ten projects
              </h2>
              <p
                className="text-base leading-relaxed mb-10 max-w-xl"
                style={{ color: "#4D4944" }}
              >
                We&apos;re offering our first ten clients a founding-member package: our best
                pricing, priority scheduling, and a complimentary design consultation. In
                exchange, we ask only that you let us photograph the finished work.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {FOUNDING_BENEFITS.map(({ text }) => (
                  <div
                    key={text}
                    className="flex items-start gap-3 text-sm"
                    style={{ color: "#4D4944" }}
                  >
                    <Check
                      className="h-4 w-4 flex-shrink-0 mt-0.5"
                      style={{ color: "#2D5F47" }}
                    />
                    {text}
                  </div>
                ))}
              </div>
              <a
                href="#consult"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-medium rounded-sm"
                style={{ background: "#1C1A17", color: "#FBF8F1" }}
              >
                Claim a founding spot
                <ArrowRight className="h-4 w-4" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── 12. GUARANTEE ── */}
      <section style={{ background: "#1C1A17" }} className="py-16 md:py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-8">
            <ShieldCheck
              className="h-9 w-9 flex-shrink-0"
              style={{ color: "#2D5F47" }}
            />
            <div className="flex-1">
              <h3
                className="font-sans font-medium text-sm mb-1.5"
                style={{ color: "#FBF8F1" }}
              >
                2-Year Workmanship Guarantee
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(245,241,232,0.45)" }}>
                Industry standard is one year. Ours is two — because we build things meant
                to outlast the guarantee. If we built it and it fails, we fix it. Free.
              </p>
            </div>
            <a
              href="#consult"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm whitespace-nowrap"
              style={{
                background: "rgba(245,241,232,0.08)",
                color: "#FBF8F1",
                border: "1px solid rgba(245,241,232,0.14)",
              }}
            >
              Book a free visit <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 13. GALLERY ── */}
      <section id="portfolio" style={{ background: "#F5F1E8" }} className="py-20 md:py-28">
        <div className="container px-4">
          <Reveal className="mb-12">
            <div className="brc-label mb-3">Design Inspiration</div>
            <h2
              className="font-serif font-light text-3xl md:text-4xl"
              style={{ color: "#1C1A17" }}
            >
              The feeling we&apos;re building toward
            </h2>
            <p className="text-sm mt-2" style={{ color: "#8F8B82" }}>
              Your space. Your vision. These are just starting points.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-6xl mx-auto">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-sm group ${
                  i === 0 || i === 5
                    ? "md:col-span-2 md:row-span-2 aspect-square"
                    : "aspect-[4/3]"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  loading={i < 4 ? "eager" : "lazy"}
                />
                <div
                  className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(28,26,23,0.62) 0%, transparent 60%)",
                  }}
                >
                  <p
                    className="font-serif font-light text-sm italic"
                    style={{ color: "#FBF8F1" }}
                  >
                    {img.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p
            className="text-center text-xs mt-6 italic"
            style={{ color: "#8F8B82" }}
          >
            Design inspirations — not photos of completed Boise Remodeling Co projects.
          </p>
        </div>
      </section>

      {/* ── 14. FAQ ── */}
      <FAQSection />

      {/* ── 15. CONSULTATION FORM ── */}
      <section
        id="consult"
        style={{ background: "#F5F1E8" }}
        className="py-20 md:py-28 pb-36 md:pb-28"
      >
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <Reveal>
                <div className="brc-label mb-5">Begin a conversation</div>
                <h2
                  className="font-serif font-light text-3xl md:text-4xl mb-4"
                  style={{ color: "#1C1A17" }}
                >
                  Tell us about your home.
                </h2>
                <p
                  className="text-sm leading-relaxed mb-8"
                  style={{ color: "#8F8B82" }}
                >
                  We&apos;ll reach out within one business day to schedule your free
                  60–90 minute in-home visit. You&apos;ll leave with a rough range, design
                  ideas, and no obligation.
                </p>
                <div className="space-y-3">
                  {[
                    "No commission-driven salespeople",
                    "No pressure to decide on the spot",
                    "Honest range estimates, in writing",
                    "Response within one business day",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 text-sm"
                      style={{ color: "#4D4944" }}
                    >
                      <Check
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "#2D5F47" }}
                      />
                      {item}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
            <div
              className="md:col-span-3 rounded-sm p-7 md:p-10"
              style={{
                background: "#FBF8F1",
                border: "1px solid rgba(28,26,23,0.08)",
              }}
            >
              <ConsultationForm />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
