import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EstimateCalculator } from "@/components/EstimateCalculator";
import { FAQSection } from "@/components/FAQSection";
import { ConsultationForm } from "@/components/ConsultationForm";
import { FOUNDING_SPOTS_REMAINING } from "@/shared/contentData";
import {
  ArrowRight, ShieldCheck, FileText, Clock,
  CreditCard, Star, Users, Lock, Zap, Check, ChevronRight, BadgeCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Boise Remodeling Co — A More Honest Way to Remodel",
  description:
    "Design-build remodeling serving Boise, Meridian, Eagle, Nampa, Kuna, Star & Middleton, Idaho. Transparent pricing, 3D renders, and a dedicated project manager from first call to final walkthrough. Book a free consultation.",
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
    icon: Lock,
    title: "No hidden markups",
    desc: "You see our cost of materials and labor, plus our fixed management fee. No mystery.",
  },
  {
    icon: FileText,
    title: "Written change orders only",
    desc: "If scope changes mid-project, you get a written change order before any work begins. Always.",
  },
  {
    icon: Clock,
    title: "We respect your time",
    desc: "Noisy work during reasonable hours. Dust barriers every day. Your home stays livable.",
  },
  {
    icon: Users,
    title: "One PM, start to finish",
    desc: "Your project manager is the same person from design day to final walkthrough. You always know who to call.",
  },
  {
    icon: Zap,
    title: "Speed without shortcuts",
    desc: "We run parallel workflows where possible. Faster timelines, same quality — because you shouldn't have to wait.",
  },
  {
    icon: ShieldCheck,
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
  { label: "Materials & fixtures", pct: 40, color: "bg-primary" },
  { label: "Skilled labor", pct: 35, color: "bg-primary/60" },
  { label: "Permits & inspections", pct: 8, color: "bg-primary/40" },
  { label: "Project management", pct: 12, color: "bg-primary/25" },
  { label: "Design & renders", pct: 5, color: "bg-primary/15" },
];

const FOUNDING_BENEFITS = [
  { text: "Priority scheduling over general-market leads" },
  { text: "Locked-in founding pricing before public launch" },
  { text: "Complimentary design consultation (normally $250)" },
  { text: "First-look access to our portfolio and references" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col pb-20 md:pb-0">

      {/* ── 1. HERO ── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1920&q=80"
          alt="Beautiful warm kitchen interior"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/60" />

        <div className="relative z-10 container px-4 md:px-8 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold tracking-widest uppercase text-white/70 mb-6">
              Boise Remodeling Co — Treasure Valley Design-Build
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-semibold text-white leading-tight mb-6">
              A more <em className="italic text-amber-200/90">honest</em> way to remodel.
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed">
              Get your starting-point range in 60 seconds — then book a free in-home visit with no pressure and no pitch.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary text-white border-0" asChild>
                <a href="#calculator">
                  See your starting-point range
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/40 text-white"
                asChild
              >
                <a href="#consult">Book a free visit</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST STRIP ── */}
      <section className="bg-foreground py-5">
        <div className="container px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-14">
            {[
              { icon: BadgeCheck, text: "Idaho License [Pending]" },
              { icon: ShieldCheck, text: "$2M Liability Coverage" },
              { icon: FileText, text: "Permits In-House" },
              { icon: CreditCard, text: "From 0% APR Financing" },
              { icon: ShieldCheck, text: "2-Year Workmanship Guarantee" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-background/75 text-sm font-medium">
                <Icon className="h-4 w-4 text-primary/80 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FOUNDER NOTE ── */}
      <section id="founder" className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            {/* Placeholder photo */}
            <div className="aspect-[4/5] rounded-md overflow-hidden order-2 md:order-1">
              <div
                className="w-full h-full flex flex-col items-center justify-end p-8"
                style={{
                  background: "linear-gradient(135deg, hsl(36 30% 88%) 0%, hsl(18 30% 80%) 100%)",
                }}
              >
                <p className="text-xs text-muted-foreground italic text-center">
                  Founder photo coming soon
                </p>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2">
              <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-4">
                A word from our founder
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
                Why we started Boise Remodeling Co
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I&apos;ve lived in Boise most of my life. And for years, I watched homeowners — friends, neighbors, family — go through remodels that left them frustrated, broke, or both. Contractors who disappeared. Budgets that doubled. Kitchens that looked nothing like the promise.
                </p>
                <p>
                  I started this company because I believe remodeling doesn&apos;t have to be like that. The work is hard. The timelines are real. But the communication, the pricing, the respect for your home — those are choices.
                </p>
                <p>
                  We choose differently. Every cost is visible. Every change is written down before it happens. Every Friday, you hear from us. And when the job is done, we mean it when we say we stand behind it.
                </p>
                <p className="font-medium text-foreground">
                  That&apos;s not a marketing promise. It&apos;s just how we run the company.
                </p>
              </div>
              <div className="mt-8">
                <p className="font-serif text-lg font-semibold text-foreground italic">
                  — The Founder, Boise Remodeling Co
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. INSPIRATION GALLERY ── */}
      <section id="portfolio" className="py-20 md:py-28 bg-muted/40">
        <div className="container px-4">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">
              Design Inspiration
            </p>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground">
              The feeling we&apos;re building toward
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Your space. Your vision. These are just starting points.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-6xl mx-auto">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-md group ${
                  i === 0 || i === 5
                    ? "md:col-span-2 md:row-span-2 aspect-square"
                    : "aspect-[4/3]"
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={i < 4 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-medium italic">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6 italic">
            Design inspirations — not photos of completed Boise Remodeling Co projects.
          </p>
        </div>
      </section>

      {/* ── 5. ESTIMATE CALCULATOR (client component) ── */}
      <EstimateCalculator />

      {/* ── 6. BELOW-CALCULATOR CARDS ── */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-5">
                  Always included — regardless of scope
                </h3>
                <ul className="space-y-3">
                  {ALWAYS_INCLUDED.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 md:p-8">
                <h3 className="text-xl font-serif font-semibold text-foreground mb-5">
                  Where the money goes
                </h3>
                <div className="space-y-4">
                  {WHERE_IT_GOES.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium text-foreground">{item.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-5 italic">
                  Approximate averages across all project types and finish levels.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── 7. HOW WE BUILD ── */}
      <section id="how-we-build" className="py-20 md:py-28 bg-foreground overflow-hidden">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/3] rounded-md overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1503174971373-b1f69850bded?auto=format&fit=crop&w=1200&q=80"
                alt="Project manager reviewing blueprints"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            <div>
              <p className="text-sm font-semibold tracking-widest uppercase text-primary/80 mb-4">
                Our process
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-background mb-8">
                From first call to final walkthrough
              </h2>
              <ol className="space-y-6">
                {HOW_WE_BUILD_STEPS.map((step) => (
                  <li key={step.number} className="flex gap-5">
                    <span className="text-2xl font-serif font-bold text-primary/60 leading-none mt-0.5 w-8 flex-shrink-0">
                      {step.number}
                    </span>
                    <div>
                      <p className="font-semibold text-background mb-1">{step.title}</p>
                      <p className="text-sm text-background/60 leading-relaxed">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. PRINCIPLES ── */}
      <section id="principles" className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">
                How we work
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground">
                Six principles we don&apos;t compromise on
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {PRINCIPLES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6 bg-muted/50 rounded-md border border-border">
                  <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-base font-sans">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 9. FINANCING + GUARANTEE ── */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-6 md:p-8">
                <CreditCard className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">
                  Flexible financing
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We partner with GreenSky and Mosaic to offer financing starting from{" "}
                  <strong className="text-foreground">0% APR</strong> on qualifying projects. Five-minute application, same-day decision.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {[
                    "Terms from 12 to 144 months",
                    "Soft credit check to view offers",
                    "No prepayment penalties",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 md:p-8">
                <ShieldCheck className="h-8 w-8 text-primary mb-4" />
                <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">
                  You stay in control of every dollar
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Our cost-plus model means you see exactly what materials and labor cost, plus our fixed management fee. No markup mysteries. Change orders in writing before any work begins.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-md p-4 text-sm">
                  <p className="font-semibold text-foreground mb-1">2-year workmanship guarantee</p>
                  <p className="text-muted-foreground">
                    Industry standard is one year. Ours is two — because we build things meant to outlast the guarantee.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── 10. FOUNDING CLIENTS ── */}
      <section id="founding-clients" className="py-20 md:py-28 bg-foreground">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-6">
              <Star className="h-4 w-4 text-primary/80" />
              <span className="text-sm font-semibold text-primary/90 tracking-wide">
                Founding Client Offer — {FOUNDING_SPOTS_REMAINING} of 10 spots remaining
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold text-background mb-5">
              Be one of our first ten projects
            </h2>
            <p className="text-background/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              We&apos;re offering our first ten clients a founding-member package: our best pricing, priority scheduling, and a complimentary design consultation. In exchange, we ask only that you let us photograph the finished work.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left max-w-2xl mx-auto">
              {FOUNDING_BENEFITS.map(({ text }) => (
                <div key={text} className="flex items-start gap-3">
                  <ChevronRight className="h-5 w-5 text-primary/70 flex-shrink-0 mt-0.5" />
                  <span className="text-background/80 text-sm">{text}</span>
                </div>
              ))}
            </div>
            <Button size="lg" asChild>
              <a href="#consult">
                Claim a founding spot
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ── 11. FAQ (client component) ── */}
      <FAQSection />

      {/* ── 12. CONSULTATION FORM ── */}
      <section id="consult" className="py-20 md:py-28">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12 items-start">
            <div className="md:col-span-2">
              <p className="text-sm font-semibold tracking-widest uppercase text-primary mb-3">
                Free visit
              </p>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">
                Tell us about your home.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We&apos;ll reach out within one business day to schedule your free 60–90 minute in-home visit. You&apos;ll leave with a rough range, design ideas, and no obligation.
              </p>
              <div className="space-y-3 text-sm text-muted-foreground">
                {[
                  "No commission-driven salespeople",
                  "No pressure to decide on the spot",
                  "Honest range estimates, in writing",
                  "Response within one business day",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-3 bg-card border border-border rounded-md p-6 md:p-8">
              <ConsultationForm />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
