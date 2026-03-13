import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Heart, Award, Users, Wrench, FileCheck, GraduationCap, TrendingUp, MapPin, Leaf, Handshake, ArrowRight } from "lucide-react";
import { Testimonials } from "@/components/Testimonials";
import { generateWebPageSchema, generateBreadcrumbSchema, generateOrganizationSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Us | Lawn Care Kuna",
  description: "Learn about Lawn Care Kuna - your trusted lawn care and landscaping company serving Kuna, Boise, Meridian, Eagle, Star, and Middleton since 2017.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Lawn Care Kuna | Professional Lawn Care Services",
    description: "Professional lawn care and landscaping services serving the Treasure Valley since 2017.",
    url: "/about",
    type: "website",
  },
};

// Schema markup
const webPageSchema = generateWebPageSchema({
  title: "About Lawn Care Kuna",
  description: "Learn about Lawn Care Kuna - your trusted lawn care and landscaping company serving the Treasure Valley since 2017.",
  url: "/about",
});

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "About Us", url: "/about" },
]);

const organizationSchema = generateOrganizationSchema();

const credentials = [
  {
    icon: TrendingUp,
    title: "Established Business",
    description: "Proudly serving the Treasure Valley since 2017 with consistent, reliable service.",
  },
  {
    icon: Shield,
    title: "Fully Licensed & Insured",
    description: "Complete liability insurance for your protection and peace of mind.",
  },
  {
    icon: Wrench,
    title: "Professional Equipment",
    description: "Commercial-grade equipment maintained to ensure quality results.",
  },
  {
    icon: GraduationCap,
    title: "Trained Team",
    description: "Expert staff trained in Idaho-specific lawn care techniques.",
  },
];

const values = [
  {
    icon: Heart,
    title: "Quality First",
    description: "We never compromise on quality. Every job is done right the first time.",
  },
  {
    icon: Shield,
    title: "Integrity",
    description: "Honest pricing, transparent communication, and ethical business practices.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description: "Your satisfaction is our priority. We listen, deliver, and exceed expectations.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Continuous improvement and dedication to being the best in lawn care.",
  },
];

const serviceAreas = [
  { name: "Kuna", slug: "kuna" },
  { name: "Boise", slug: "boise" },
  { name: "Meridian", slug: "meridian" },
  { name: "Eagle", slug: "eagle" },
  { name: "Star", slug: "star" },
  { name: "Middleton", slug: "middleton" },
];

export default function AboutPage() {
  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">About Lawn Care Kuna</h1>
            <p className="text-lg text-muted-foreground">
              Professional lawn care and landscaping services serving the Treasure Valley since 2017
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Since 2017, Lawn Care Kuna has been providing professional lawn care and landscaping services to homeowners and businesses throughout the Treasure Valley. What started as a local <Link href="/services/lawn-mowing" className="text-primary hover:underline">lawn mowing service</Link> has grown into a comprehensive <Link href="/services" className="text-primary hover:underline">landscaping company</Link> offering everything from basic lawn maintenance to complex <Link href="/services/patio-installation" className="text-primary hover:underline">hardscaping projects</Link>.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                We understand Idaho's unique climate challenges - from scorching summer heat to freezing winter temperatures. Our team has the local expertise to ensure your lawn and landscape thrives year-round in our high-desert climate, with services like <Link href="/services/fertilization" className="text-primary hover:underline">fertilization</Link>, <Link href="/services/aeration" className="text-primary hover:underline">aeration</Link>, and <Link href="/services/irrigation-maintenance" className="text-primary hover:underline">irrigation maintenance</Link>.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, we proudly serve residential and <Link href="/commercial" className="text-primary hover:underline">commercial properties</Link> across <Link href="/areas/kuna" className="text-primary hover:underline">Kuna</Link>, <Link href="/areas/boise" className="text-primary hover:underline">Boise</Link>, <Link href="/areas/meridian" className="text-primary hover:underline">Meridian</Link>, <Link href="/areas/eagle" className="text-primary hover:underline">Eagle</Link>, <Link href="/areas/star" className="text-primary hover:underline">Star</Link>, and <Link href="/areas/middleton" className="text-primary hover:underline">Middleton</Link>, maintaining our commitment to honest service, quality workmanship, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Credentials & Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {credentials.map((credential, index) => (
                <Card key={index} className="hover-elevate transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <credential.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{credential.title}</h3>
                        <p className="text-muted-foreground text-sm">{credential.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Our Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
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

      {/* Service Areas */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Service Areas</h2>
            <p className="text-lg text-muted-foreground">
              Proudly serving communities across the Treasure Valley
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {serviceAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/areas/${area.slug}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-background border hover:border-primary hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  {area.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-about-reviews-heading">
                What Kuna Customers Say
              </h2>
              <p className="text-lg text-muted-foreground">
                Real reviews from homeowners and businesses in Kuna and the Treasure Valley
              </p>
            </div>
            <Testimonials limit={20} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
              Contact us today for a free consultation and quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" className="bg-white text-green-900 hover:bg-white/90 border-0" asChild>
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 backdrop-blur-sm" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
