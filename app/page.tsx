import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Leaf,
  Lightbulb,
  CheckCircle2,
  Shield,
  Award,
  Clock,
  DollarSign,
  Sprout,
  ArrowRight,
  Heart,
  Target,
  Zap,
} from "lucide-react";
import { HeroQuoteSection } from "@/components/HeroQuoteSection";
import { Testimonials } from "@/components/Testimonials";
import { NearMeFAQ } from "@/components/NearMeFAQ";
import { ServiceAreasSection } from "@/components/ServiceAreasSection";
import { generateLocalBusinessSchema, generateOrganizationSchema, generateFAQSchema, generateSpeakableSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Lawn Care & Landscaping in Idaho",
  description: "Top-rated lawn care in Kuna, Boise & Treasure Valley, Idaho. Mowing, landscaping, irrigation & cleanup. Licensed & insured. Call (208) 352-2011!",
  alternates: {
    canonical: "https://lawncarekuna.com/",
  },
  openGraph: {
    title: "Lawn Care Kuna Idaho | Mowing, Landscaping & Free Quotes",
    description: "Professional lawn mowing, landscaping, and yard maintenance in Kuna and the Treasure Valley, Idaho. Licensed, insured, top-rated. Get a free quote today!",
    url: "https://lawncarekuna.com/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawn Care Kuna Idaho | Mowing & Landscaping",
    description: "Top-rated lawn care and landscaping in Kuna, Boise & Treasure Valley. Licensed pros. Free quotes. Call (208) 352-2011!",
  },
};

// Schema markup for SEO
const localBusinessSchema = generateLocalBusinessSchema();
const organizationSchema = generateOrganizationSchema();
const faqSchema = generateFAQSchema([
  {
    question: "What areas do you serve?",
    answer: "We provide lawn care and landscaping services throughout the Treasure Valley including Kuna, Boise, Meridian, Eagle, Star, and Middleton, Idaho.",
  },
  {
    question: "How much does lawn care cost?",
    answer: "Our lawn mowing services start at $35. Pricing varies based on property size and specific requirements. Contact us for a free, detailed quote.",
  },
  {
    question: "Are you licensed and insured?",
    answer: "Yes, Lawn Care Kuna is fully licensed and insured with $2M liability coverage for your protection and peace of mind.",
  },
  {
    question: "Do you offer free estimates?",
    answer: "Yes! We provide free consultations and estimates for all our lawn care and landscaping services.",
  },
]);

const services = [
  {
    icon: Leaf,
    title: "Lawn Care",
    description: "Professional lawn maintenance services designed to keep your property looking its best year-round.",
    features: ["Weekly Mowing", "Fertilization", "Weed Control", "Seasonal Cleanup"],
    href: "/services/lawn-care",
  },
  {
    icon: Sprout,
    title: "Landscaping",
    description: "Transform your outdoor space with custom landscape design and installation services.",
    features: ["Patio Installation", "Retaining Walls", "Water Features", "Outdoor Lighting"],
    href: "/services/landscaping",
  },
  {
    icon: Lightbulb,
    title: "Christmas Lights",
    description: "Professional holiday lighting installation to make your property shine during the festive season.",
    features: ["Custom Design", "Professional Installation", "Maintenance", "Removal Service"],
    href: "/services/christmas-lights",
  },
];

const trustIndicators = [
  {
    icon: Award,
    title: "Established 2017",
    description: "Seven years of excellence serving the Treasure Valley",
  },
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "Fully licensed and insured for your protection",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Free consultations with honest, upfront pricing",
  },
  {
    icon: Clock,
    title: "Reliable Service",
    description: "Consistent, professional care you can count on",
  },
];

const coreValues = [
  {
    icon: Heart,
    title: "Quality First",
    description: "We never compromise on quality. Every job is done right the first time with attention to detail.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Honest pricing, transparent communication, and ethical business practices you can trust.",
  },
  {
    icon: Target,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We listen, deliver, and exceed expectations.",
  },
  {
    icon: Zap,
    title: "Excellence",
    description: "Continuous improvement and dedication to being the best in lawn care services.",
  },
];

const popularServices = [
  { name: "Lawn Mowing", price: "Starting at $35", slug: "lawn-mowing" },
  { name: "Lawn Aeration", price: "Starting at $75", slug: "aeration" },
  { name: "Fertilization", price: "Starting at $50", slug: "fertilization" },
  { name: "Weed Control", price: "Starting at $50", slug: "weed-control" },
  { name: "Spring Cleanup", price: "Starting at $150", slug: "spring-cleanup" },
  { name: "Fall Cleanup", price: "Starting at $175", slug: "fall-cleanup" },
  { name: "Patio Installation", price: "Custom Quote", slug: "patio-installation" },
  { name: "Retaining Walls", price: "Custom Quote", slug: "retaining-walls" },
];

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateSpeakableSchema({
          name: "Lawn Care Kuna",
          url: "/",
        })) }}
      />

      <div className="flex flex-col pb-20">
      {/* Hero Section with Quote Wizard - Background extends to trust indicators */}
      <HeroQuoteSection
        label="KUNA'S TRUSTED LAWN CARE"
        heading="Lawn Care Kuna, Idaho"
        subheading="Top-Rated Local Lawn & Landscaping Services Since 2017"
        defaultCity="Kuna"
        backgroundImage="/images/hero-background.webp"
        backgroundAlt="Professional lawn care hero background with decorative leaves and trees"
      >
        {/* Trust Indicators - Inside hero background */}
        <section className="py-12 md:py-16 lg:py-20" data-testid="section-trust-indicators">
          <div className="container px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
              <div className="text-center space-y-3 md:space-y-4">
                <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight" data-testid="text-trust-heading">
                  Why Kuna homeowners trust our lawn care
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-trust-subtitle">
                  Professional lawn care backed by experience, licensing, and a commitment to your satisfaction
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {trustIndicators.map((indicator, index) => (
                  <Card key={index} className="text-center bg-card/95 backdrop-blur-sm" data-testid={`card-trust-indicator-${index}`}>
                    <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6 space-y-2 md:space-y-3 px-4 md:px-6">
                      <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
                        <indicator.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base" data-testid={`text-trust-title-${index}`}>{indicator.title}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground leading-snug">{indicator.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </HeroQuoteSection>

      {/* AI-Friendly Summary */}
      <section className="py-8 bg-muted/20">
        <div className="container px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <p className="text-base text-muted-foreground leading-relaxed text-center" data-speakable="summary" data-testid="text-ai-summary">
              Lawn Care Kuna is a licensed and insured lawn care and landscaping company based in Kuna, Idaho, serving the Treasure Valley since 2017. We provide residential and commercial services including lawn mowing, fertilization, aeration, weed control, landscaping, irrigation maintenance, Christmas light installation, and snow removal in Kuna, Boise, Meridian, Eagle, Star, and Middleton. Call (208) 352-2011 for a free quote.
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3 md:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Affordable lawn care and landscaping in Kuna, Idaho
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                At Lawn Care Kuna, we're dedicated to providing exceptional lawn care and landscaping services 
                that transform your outdoor space into something beautiful. Our experienced team understands 
                Idaho's unique climate and soil conditions, ensuring your lawn thrives year-round.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover-elevate bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background">
                  <CardHeader className="space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <service.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="leading-relaxed">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                      <Link href={service.href}>
                        Explore {service.title} Services
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Get a free lawn care estimate in Kuna today
            </h2>
            <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
              Get a free consultation and quote today. We'll assess your property and provide 
              a transparent estimate with no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 border-0" asChild>
                <Link href="/get-quote">
                  Get Your Free Lawn Care Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm" asChild>
                <Link href="/services">
                  Explore Our Lawn &amp; Landscaping Services
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lawn Care Services in Kuna */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Professional lawn mowing and yard maintenance in Kuna
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We offer comprehensive lawn care and landscaping services designed to meet all your 
                outdoor needs. From regular maintenance to complete landscape transformations, 
                our team has the expertise and equipment to deliver exceptional results.
              </p>
            </div>

            {/* Two-Column Service Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Lawn Care Services */}
              <div className="space-y-6">
                <Link href="/services/lawn-care" className="block">
                  <h3 className="text-2xl font-bold text-primary hover:underline">Lawn Care Services in Kuna & Boise</h3>
                </Link>
                <ul className="space-y-4">
                  {[
                    { label: "Professional lawn mowing and edging in Kuna", href: "/services/lawn-mowing" },
                    { label: "Lawn fertilization programs for Idaho lawns", href: "/services/fertilization" },
                    { label: "Weed control and prevention services", href: "/services/weed-control" },
                    { label: "Core aeration and overseeding for healthier turf", href: "/services/aeration" },
                    { label: "Spring and fall yard cleanup", href: "/services/spring-cleanup" },
                    { label: "Commercial lawn care services", href: "/commercial" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <Link href={item.href} className="text-base text-muted-foreground hover:text-primary transition-colors" data-testid={`link-lawn-service-${i}`}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Landscaping Services */}
              <div className="space-y-6">
                <Link href="/services/landscaping" className="block">
                  <h3 className="text-2xl font-bold text-primary hover:underline">Landscaping Services in Treasure Valley</h3>
                </Link>
                <ul className="space-y-4">
                  {[
                    { label: "Patio design and installation in Idaho", href: "/services/patio-installation" },
                    { label: "Retaining wall construction and repair", href: "/services/retaining-walls" },
                    { label: "Backyard water features and pond installation", href: "/services/pond-installation" },
                    { label: "Outdoor landscape lighting design", href: "/services/landscape-lighting" },
                    { label: "Custom landscape design services", href: "/services/landscaping" },
                    { label: "Sod installation for new lawns", href: "/services/sod-installation" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <Link href={item.href} className="text-base text-muted-foreground hover:text-primary transition-colors" data-testid={`link-landscaping-service-${i}`}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/services">
                  Browse All Lawn Care &amp; Landscaping Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Two-Column Feature Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left: Dark Green Card */}
              <Card className="bg-primary text-primary-foreground border-primary">
                <CardContent className="p-8 md:p-12 space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Complete lawn maintenance for Kuna and Treasure Valley
                  </h3>
                  <p className="text-primary-foreground leading-relaxed">
                    We handle everything your lawn needs to thrive. Our comprehensive approach includes:
                  </p>
                  <ul className="space-y-3">
                    {[
                      { label: "Weekly or bi-weekly lawn mowing in Kuna", href: "/services/lawn-mowing" },
                      { label: "Seasonal fertilization for Idaho lawns", href: "/services/fertilization" },
                      { label: "Targeted weed and pest control treatments", href: "/services/weed-control" },
                      { label: "Spring cleanup and fall leaf removal", href: "/services/spring-cleanup" },
                      { label: "Core aeration and overseeding services", href: "/services/aeration" },
                      { label: "Sprinkler and irrigation system maintenance", href: "/services/irrigation-maintenance" },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <Link href={item.href} className="hover:underline transition-colors" data-testid={`link-fullservice-${i}`}>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild>
                    <Link href="/get-quote">
                      Get Started Today
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Right: Content */}
              <div className="space-y-6">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Why choose Lawn Care Kuna for yard services near you
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <p className="leading-relaxed">
                    With over seven years of experience serving Kuna and the surrounding Treasure Valley, 
                    we've built a reputation for reliability, quality, and outstanding customer service.
                  </p>
                  <p className="leading-relaxed">
                    Our team is fully licensed and insured, giving you peace of mind that your property 
                    is in professional hands. We use only the best equipment and materials to ensure 
                    lasting results.
                  </p>
                  <p className="leading-relaxed">
                    We're not just lawn care providers – we're your partners in creating and maintaining 
                    beautiful outdoor spaces that you can be proud of.
                  </p>
                </div>
                <Button variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                  <Link href="/about">
                    Meet Our Kuna Lawn Care Team
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                How our Kuna lawn care service works
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We believe in doing things right. Our systematic approach ensures consistent, 
                high-quality results that exceed your expectations.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[
                  { step: 1, title: "Initial Consultation", desc: "We visit your property to assess your needs and provide a detailed, transparent quote." },
                  { step: 2, title: "Custom Plan", desc: "We create a tailored service plan that fits your lawn's specific needs and your budget." },
                  { step: 3, title: "Professional Service", desc: "Our trained team executes the plan with precision using commercial-grade equipment." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { step: 4, title: "Quality Control", desc: "We inspect every job to ensure it meets our high standards before we leave." },
                  { step: 5, title: "Ongoing Care", desc: "We provide consistent, reliable service on your schedule, adjusting as seasons change." },
                  { step: 6, title: "Customer Satisfaction", desc: "Your happiness is our priority. We're not satisfied until you love your lawn." },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild>
                <Link href="/contact">
                  Get Free Estimate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services & Pricing */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Lawn care pricing in Kuna, Idaho
              </h2>
              <p className="text-lg text-muted-foreground">
                Transparent pricing for our most popular services
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {popularServices.map((service, index) => (
                    <Link
                      key={index}
                      href={`/services/${service.slug}`}
                      className="flex items-center flex-wrap justify-between gap-4 p-4 hover-elevate transition-colors group"
                      data-testid={`link-pricing-${service.slug}`}
                    >
                      <span className="font-medium group-hover:underline">
                        {service.name}
                      </span>
                      <span className="text-muted-foreground">{service.price}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-muted-foreground">
              Prices vary based on property size and specific requirements. 
              Contact us for a free, detailed quote.
            </p>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/get-quote">
                  Get Your Custom Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Lawn Care Kuna's Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {coreValues.map((value, index) => (
                <Card key={index} className="hover-elevate bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background">
                  <CardContent className="p-8 space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground">
                      <value.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Section */}
      <ServiceAreasSection />

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Kuna lawn care reviews from local homeowners
              </h2>
              <p className="text-lg text-muted-foreground">
                See why families across the Treasure Valley trust us with their lawns
              </p>
            </div>
            <Testimonials limit={30} />
          </div>
        </div>
      </section>

      {/* Near Me FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <NearMeFAQ city="Kuna" serviceName="lawn care" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Schedule lawn care in Kuna, Idaho today
            </h2>
            <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
              Schedule your free consultation today and discover why we're Kuna's most trusted lawn care company.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 border-0" asChild>
                <Link href="/get-quote">
                  Request Your Free Lawn Care Estimate
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm" asChild>
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
