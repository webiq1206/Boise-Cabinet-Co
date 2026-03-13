import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Phone } from "lucide-react";
import { HeroQuoteSection } from "@/components/HeroQuoteSection";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Get a Free Quote | Lawn Care Kuna",
  description: "Request a free lawn care quote from Lawn Care Kuna. Professional lawn care and landscaping services in Kuna, Boise, Meridian, and the Treasure Valley.",
  alternates: {
    canonical: "https://lawncarekuna.com/get-quote",
  },
  openGraph: {
    title: "Get a Free Quote | Lawn Care Kuna",
    description: "Request a free lawn care quote today. No obligation, transparent pricing.",
    url: "/get-quote",
    type: "website",
  },
};

const benefits = [
  "Free, no-obligation estimate",
  "Transparent, competitive pricing",
  "Fast response within 24 hours",
  "Customized service recommendations",
  "No hidden fees or surprises",
  "Satisfaction guaranteed",
];

export default function GetQuotePage() {
  return (
    <div className="flex flex-col">
      {/* Hero with Quote Wizard */}
      <HeroQuoteSection
        label="FREE INSTANT ESTIMATE"
        heading="Get Your Lawn Care Quote"
        subheading="Enter your address for an accurate estimate in seconds"
        defaultCity="Kuna"
      />

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Benefits List */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">What You'll Get</h2>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call Section */}
              <div className="flex flex-col justify-center">
                <div className="p-8 rounded-lg bg-background border shadow-sm">
                  <h3 className="text-xl font-semibold mb-3">Prefer to call?</h3>
                  <p className="text-muted-foreground mb-6">
                    Speak directly with our team for immediate assistance. We're available Monday through Saturday.
                  </p>
                  <Button size="lg" className="w-full" asChild>
                    <a href="tel:2083522011">
                      <Phone className="mr-2 h-5 w-5" />
                      (208) 352-2011
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-reviews-heading">
                What Our Customers Say
              </h2>
              <p className="text-lg text-muted-foreground">
                Real reviews from homeowners across the Treasure Valley
              </p>
            </div>
            <Testimonials limit={20} />
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Why Choose Lawn Care Kuna?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Since 2017, we've been providing professional lawn care services to homeowners and businesses throughout the Treasure Valley. Our commitment to quality and customer satisfaction has made us one of the most trusted names in lawn care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                <Link href="/about">Learn About Us</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-gradient-to-br from-primary/10 to-white border-primary/20 text-primary" asChild>
                <Link href="/services">View Our Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
