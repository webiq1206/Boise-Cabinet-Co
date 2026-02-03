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
import { generateLocalBusinessSchema, generateOrganizationSchema, generateFAQSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Lawn Care Kuna | Professional Landscaping | Free Quotes",
  description: "Professional lawn care & landscaping in Kuna, Boise, Meridian & Treasure Valley. Licensed, insured, top-rated. Call (208) 352-2011 for your free quote today!",
  keywords: ["lawn care kuna", "lawn care services", "landscaping kuna idaho", "lawn mowing", "irrigation", "christmas lights", "lawn care near me", "landscaping near me"],
  openGraph: {
    title: "Lawn Care Kuna | Professional Landscaping | Free Quotes",
    description: "Professional lawn care and landscaping services in the Treasure Valley, Idaho. Get a free quote today!",
    url: "/",
    type: "website",
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
      
      <div className="flex flex-col pb-20">
      {/* Hero Section with Quote Wizard */}
      <HeroQuoteSection
        label="KUNA'S TRUSTED LAWN CARE"
        heading="Professional Lawn Care in Kuna"
        subheading="Top-Rated Local Lawn & Landscaping Services Since 2017"
        defaultCity="Kuna"
      />

      {/* Trust Indicators */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center space-y-3 md:space-y-4">
              <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Why Kuna trusts us with their lawns
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional lawn care backed by experience, licensing, and a commitment to your satisfaction
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {trustIndicators.map((indicator, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-5 pb-5 md:pt-6 md:pb-6 space-y-2 md:space-y-3 px-4 md:px-6">
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
                      <indicator.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base">{indicator.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-snug">{indicator.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3 md:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                The best local lawn care in Kuna
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                At Lawn Care Kuna, we're dedicated to providing exceptional lawn care and landscaping services 
                that transform your outdoor space into something beautiful. Our experienced team understands 
                Idaho's unique climate and soil conditions, ensuring your lawn thrives year-round.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover-elevate">
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
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={service.href}>
                        Learn More
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
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to transform your lawn?
            </h2>
            <p className="text-lg text-primary-foreground leading-relaxed">
              Get a free consultation and quote today. We'll assess your property and provide 
              a transparent estimate with no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/services">
                  View All Services
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
                Lawn care services in Kuna
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
                <h3 className="text-2xl font-bold text-primary">Lawn Care Services</h3>
                <ul className="space-y-4">
                  {[
                    "Professional mowing and edging",
                    "Fertilization programs",
                    "Weed control",
                    "Aeration and overseeding",
                    "Seasonal cleanup",
                    "Commercial-grade equipment"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Landscaping Services */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary">Landscaping Services</h3>
                <ul className="space-y-4">
                  {[
                    "Patio installation",
                    "Retaining walls",
                    "Water features",
                    "Outdoor lighting",
                    "Custom design services",
                    "Property value enhancement"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-base text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/services">
                  View All Services
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
                    Full service lawn care in Kuna
                  </h3>
                  <p className="text-primary-foreground leading-relaxed">
                    We handle everything your lawn needs to thrive. Our comprehensive approach includes:
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Weekly or bi-weekly mowing service",
                      "Professional fertilization programs",
                      "Effective weed and pest control",
                      "Spring and fall cleanup services",
                      "Aeration and overseeding",
                      "Irrigation system maintenance",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
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
                  Why choose us for your lawn care needs
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
                <Button variant="outline" asChild>
                  <Link href="/about">
                    Learn More About Us
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
                Our approach to lawn care in Kuna
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
                What lawn care feels like
              </h2>
              <p className="text-lg text-muted-foreground">
                Transparent pricing for our most popular services
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {popularServices.map((service, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 hover-elevate"
                    >
                      <Link 
                        href={`/services/${service.slug}`}
                        className="font-medium hover:text-primary hover:underline transition-colors"
                      >
                        {service.name}
                      </Link>
                      <span className="text-muted-foreground">{service.price}</span>
                    </div>
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
                <Card key={index} className="hover-elevate">
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

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                What Our Customers Say
              </h2>
              <p className="text-lg text-muted-foreground">
                Trusted by homeowners across Kuna and the Treasure Valley
              </p>
            </div>
            <Testimonials limit={3} />
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
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-xl text-primary-foreground leading-relaxed">
              Schedule your free consultation today and discover why we're Kuna's most trusted lawn care company.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
                asChild
              >
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
