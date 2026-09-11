import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Hammer, Sparkles } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Reveal } from "@/components/Reveal";
import { ConsultationForm } from "@/components/ConsultationForm";
import { CtaButton } from "@/components/modals/CtaButton";
import { Section } from "@/components/marketing";
import { MarketingCard } from "@/components/marketing/MarketingCard";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { SITE_IMAGES } from "@/shared/siteImages";
import { SITE_CONFIG } from "@/shared/siteConfig";
import { buildPageMetadata } from "@/lib/page-metadata";
import { generateBreadcrumbSchema, generateServiceSchema, generateWebPageSchema } from "@/lib/schema";

export const metadata = buildPageMetadata({
  kind: "service",
  serviceName: "Cabinet Installation",
  serviceSlug: "cabinet-installation",
  path: "/services/cabinet-installation",
  titleOverride: "Cabinet Installation in Boise, ID",
  descriptionOverride:
    "Professional cabinet installation in Boise, Meridian, Eagle, Nampa, and nearby Treasure Valley communities. Bring your own cabinets or work with Boise Cabinet Co for custom cabinetry and installation.",
});

const areas = ["Boise", "Meridian", "Eagle", "Nampa", "Kuna", "Star", "Middleton", "Caldwell", "Garden City"];

const installationBenefits = [
  "A careful plan for your room, cabinet layout, and finish work",
  "Installation for cabinets sourced from another supplier",
  "Level, square cabinet placement with thoughtful attention to the details",
  "A clear conversation about what is ready before work begins",
];

const cabinetBenefits = [
  "Custom cabinets designed around how your household uses the room",
  "Built-ins and storage that make use of the space you already have",
  "Cabinet sales, planning, and installation with one local team",
  "A practical path from first conversation to a finished room",
];

export default function CabinetInstallationPage() {
  const schemas = [
    generateWebPageSchema({
      title: "Cabinet Installation in the Treasure Valley",
      description: metadata.description as string,
      url: "/services/cabinet-installation",
    }),
    generateServiceSchema(
      "Cabinet installation",
      "Cabinet installation for Treasure Valley homeowners, including cabinets sourced elsewhere and custom cabinets from Boise Cabinet Co.",
    ),
    generateBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Cabinets", url: "/cabinets" },
      { name: "Cabinet installation", url: "/services/cabinet-installation" },
    ]),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <main className="pb-20 md:pb-0">
        <section className="relative isolate overflow-hidden bg-inverse">
          <div className="absolute inset-0">
            <Image
              src={SITE_IMAGES.contactHero}
              alt="Finished custom cabinetry in a Treasure Valley home"
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-60 img-brand-grade"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-inverse via-inverse/80 to-inverse/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-inverse via-transparent to-inverse/20" />
          </div>
          <div className="relative z-10 container mx-auto px-6 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
            <nav aria-label="Breadcrumb" className="mb-16 text-sm text-inverse-muted">
              <Link href="/" className="tap-target hover:text-inverse-foreground">Home</Link>
              <span className="mx-2 opacity-50">/</span>
              <Link href="/cabinets" className="tap-target hover:text-inverse-foreground">Cabinets</Link>
              <span className="mx-2 opacity-50">/</span>
              <span className="text-inverse-foreground">Cabinet installation</span>
            </nav>
            <div className="max-w-3xl fade-up">
              <p className="brc-label text-inverse-muted">Cabinet installation in the Treasure Valley</p>
              <h1 className="ed-display mt-5 max-w-3xl text-inverse-foreground">
                Cabinets installed with a <em className="brc-accent text-accent">steady hand.</em>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-inverse-foreground/80 md:text-xl">
                Bring us cabinets you already chose, or let Boise Cabinet Co design, sell, and install the right cabinets for your home.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <CtaButton variant="brand">Talk through your project <ArrowRight className="h-4 w-4" /></CtaButton>
                <Link href="#options" className="tap-target inline-flex items-center justify-center border border-inverse-foreground/30 px-5 py-3 text-sm text-inverse-foreground transition-colors hover:border-inverse-foreground/70">
                  Compare your options
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Section variant="greige" spacing="lg">
          <div className="container mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[1fr_1.2fr] md:px-10">
            <Reveal>
              <p className="ed-eyebrow">A straightforward starting point</p>
              <h2 className="ed-h2 mt-4">The cabinet installer you need, or the cabinet team you want.</h2>
            </Reveal>
            <Reveal delay={80}>
              <p className="text-lg leading-relaxed text-foreground/80">
                Some homeowners have already purchased cabinets and need an installer to take the project from boxes to a finished room. Others want help with the whole cabinet decision. Both are good places to start.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-foreground/80">
                We will talk through the scope, the room, and what you already have before recommending the next step.
              </p>
            </Reveal>
          </div>
        </Section>

        <Section id="options" surface="deep" spacing="xl">
          <div className="container mx-auto max-w-6xl px-6 md:px-10">
            <SectionHeader
              eyebrow="Two ways to work with us"
              title={<>Choose the path that fits your <em className="brc-accent text-accent">project.</em></>}
              description="The same practical attention to layout, fit, and finish applies either way."
              className="max-w-3xl"
            />
            <div className="mt-14 grid gap-5 lg:grid-cols-2">
              <Reveal>
                <article className="h-full border border-border bg-card p-7 md:p-10">
                  <div className="mb-9 flex h-11 w-11 items-center justify-center bg-accent/10 text-accent">
                    <Hammer className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <p className="ed-eyebrow">Option one</p>
                  <h3 className="ed-h3 mt-3">Install cabinets you already sourced</h3>
                  <p className="mt-5 leading-relaxed text-foreground/75">
                    Found cabinets you like somewhere else? We can discuss installation for your kitchen, bath, laundry, mudroom, or other room. We focus on the work that makes the finished result feel right.
                  </p>
                  <ul className="mt-8 space-y-4 border-t border-border pt-6">
                    {installationBenefits.map((benefit) => (
                      <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-foreground/80">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{benefit}
                      </li>
                    ))}
                  </ul>
                  <Link href="#consult" className="ed-link ed-link-accent mt-9 inline-flex">Ask about installation <ArrowRight className="h-4 w-4" /></Link>
                </article>
              </Reveal>
              <Reveal delay={100}>
                <article className="relative h-full overflow-hidden border border-accent/50 bg-inverse p-7 text-inverse-foreground md:p-10">
                  <div className="absolute right-0 top-0 h-28 w-28 translate-x-10 -translate-y-10 rounded-full border border-accent/30" />
                  <div className="relative">
                    <div className="mb-9 flex h-11 w-11 items-center justify-center bg-accent text-accent-foreground">
                      <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <p className="ed-eyebrow text-inverse-muted">Our complete cabinet service</p>
                    <h3 className="ed-h3 mt-3 text-inverse-foreground">Buy custom cabinets and have us install them</h3>
                    <p className="mt-5 leading-relaxed text-inverse-foreground/75">
                      Start with the room and how you want it to work. Boise Cabinet Co can help with cabinet sales, custom cabinets, built-ins, and the installation that brings the plan together.
                    </p>
                    <ul className="mt-8 space-y-4 border-t border-inverse-foreground/15 pt-6">
                      {cabinetBenefits.map((benefit) => (
                        <li key={benefit} className="flex gap-3 text-sm leading-relaxed text-inverse-foreground/80">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{benefit}
                        </li>
                      ))}
                    </ul>
                    <CtaButton variant="brand" className="mt-9">Plan custom cabinets <ArrowRight className="h-4 w-4" /></CtaButton>
                  </div>
                </article>
              </Reveal>
            </div>
          </div>
        </Section>

        <Section variant="canvas" spacing="none" className="p-0">
          <div className="grid md:grid-cols-2">
            <div className="relative min-h-[320px] overflow-hidden md:min-h-[540px]">
              <Image src={SITE_IMAGES.processHome} alt="cabinet planning consultation with a Boise Cabinet Co designer and homeowners" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover img-brand-grade" />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse/70 to-transparent" />
              <div className="absolute bottom-0 p-7 md:p-12">
                <p className="ed-eyebrow text-inverse-muted">Good installation is visible in the details</p>
                <p className="mt-3 max-w-sm text-2xl text-inverse-foreground">Clean lines. Thoughtful fit. A room that works.</p>
              </div>
            </div>
            <div className="section-y-sm border-l border-border bg-card px-7 md:px-14 lg:px-16">
              <Reveal>
                <p className="ed-eyebrow">What we look at first</p>
                <h2 className="ed-h2 mt-4">A practical plan before the tools come out.</h2>
                <div className="mt-8 space-y-0">
                  {[
                    ["01", "The room", "Walls, floors, openings, and the details that shape the installation."],
                    ["02", "The cabinets", "What you have selected, what you need, and how everything needs to meet."],
                    ["03", "The finish", "Trim, panels, hardware, and the small decisions that complete the room."],
                  ].map(([number, title, copy]) => (
                    <div key={number} className="flex gap-5 border-t border-border py-5">
                      <span className="brc-display-num text-accent">{number}</span>
                      <div><h3 className="text-xl">{title}</h3><p className="mt-1 text-sm leading-relaxed text-foreground/70">{copy}</p></div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Section>

        <Section variant="greige" divider>
          <div className="container mx-auto max-w-6xl px-6 md:px-10">
            <Reveal>
              <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
                <div>
                  <p className="ed-eyebrow">Where we work</p>
                  <h2 className="ed-h2 mt-4">Serving homeowners across the Treasure Valley.</h2>
                </div>
                <div>
                  <p className="leading-relaxed text-foreground/75">We serve Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, Caldwell, and Garden City.</p>
                  <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm text-accent">
                    {areas.map((area) => <span key={area}>{area}</span>)}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section id="consult" divider>
          <div className="container mx-auto grid max-w-5xl gap-12 px-6 md:grid-cols-5 md:px-10">
            <div className="md:col-span-2">
              <SectionHeader
                eyebrow="Start with a conversation"
                title={<>Tell us what your cabinets <em className="brc-accent text-accent">need.</em></>}
                description="Share a few details before requesting an estimate. We will use them to understand whether you need installation, custom cabinets, or both."
              />
            </div>
            <MarketingCard className="md:col-span-3" padding="lg">
              <ConsultationForm />
            </MarketingCard>
          </div>
        </Section>

        <Section surface="gradient" spacing="lg" edge>
          <div className="container mx-auto flex max-w-6xl flex-col gap-7 px-6 md:flex-row md:items-center md:justify-between md:px-10">
            <div>
              <p className="ed-eyebrow">Cabinet installation and custom cabinetry</p>
              <h2 className="ed-h2-sm mt-3">Let&apos;s find the right way forward.</h2>
            </div>
            <CtaButton variant="brand">Get started <ArrowRight className="h-4 w-4" /></CtaButton>
          </div>
        </Section>
      </main>
    </>
  );
}