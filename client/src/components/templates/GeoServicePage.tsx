import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Phone, MapPin, ArrowRight, Leaf, Sprout, Heart, Shield, Target, Zap } from "lucide-react";
import { QuoteWizard } from "@/components/QuoteWizard";
import { FactsSection } from "@/components/FactsSection";
import type { ServiceData, CityData } from "@shared/contentData";

interface GeoServicePageProps {
  service: ServiceData;
  city: CityData;
}

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

export function GeoServicePage({ service, city }: GeoServicePageProps) {
  const metaTitle = `${service.name} in ${city.name}, Idaho | Lawn Care Kuna`;
  const metaDescription = `Professional ${service.name.toLowerCase()} in ${city.name}, ID. ${service.shortDescription}. Serving ${city.name} since 2017. Free quotes. Call (208) 352-2011 today!`;

  return (
    <div className="pb-20">
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-muted py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight" data-testid="heading-hero">
                  {service.name} in {city.name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Professional {service.name.toLowerCase()} services in {city.name}, Idaho. Serving the Treasure Valley since 2017.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild data-testid="button-hero-schedule">
                    <Link href="/get-quote">
                      Get Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-hero-pricing">
                    <Link href="/pricing">
                      View Pricing
                    </Link>
                  </Button>
                </div>
              </div>
              
              {/* Right: Decorative Elements */}
              <div className="relative h-64 lg:h-full hidden lg:block">
                <div className="absolute top-0 right-0 w-32 h-32 text-primary/20">
                  <Leaf className="w-full h-full" strokeWidth={1} />
                </div>
                <div className="absolute bottom-10 right-20 w-24 h-24 text-primary/10">
                  <Leaf className="w-full h-full" strokeWidth={1} />
                </div>
                <div className="absolute top-20 right-32 w-20 h-20 text-primary/15">
                  <Sprout className="w-full h-full" strokeWidth={1} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Green Service Description Card */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Card className="bg-primary text-primary-foreground border-primary">
              <CardContent className="p-8 md:p-12 space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {service.name} services
                </h2>
                <p className="text-primary-foreground/90 text-lg leading-relaxed">
                  {service.longDescription}
                </p>
                <p className="text-primary-foreground/90 text-lg leading-relaxed">
                  We understand the unique challenges of maintaining {service.category.includes('lawn') ? 'lawns' : 'landscapes'} in {city.name}, 
                  including {city.localFactors.soil.toLowerCase()} and {city.localFactors.climate.toLowerCase()}. 
                  Our professional team delivers exceptional results tailored to {city.name}'s specific needs.
                </p>
                <Button size="lg" variant="secondary" asChild data-testid="button-service-cta">
                  <Link href="/get-quote">
                    Request Service
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Details Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {service.name} in {city.name}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                At Lawn Care Kuna, we've been providing expert {service.name.toLowerCase()} services to {city.name} residents since 2017. 
                Our professional approach ensures your lawn looks its best year-round.
              </p>
            </div>

            {/* Facts Section */}
            {(city.facts || service.facts) && (
              <FactsSection
                title={`${city.name} ${service.category.includes('lawn') ? 'lawn care' : service.name.toLowerCase()} facts`}
                facts={city.facts || service.facts || []}
              />
            )}

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                We specialize in {service.name.toLowerCase()} solutions tailored for {city.name}'s specific conditions. 
                Our experienced team knows exactly what your lawn needs to thrive in Idaho's climate.
              </p>
            </div>

            <div className="text-center">
              <Button size="lg" asChild data-testid="button-service-details">
                <Link href="/get-quote">
                  Schedule Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Local Expertise Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {city.name} {service.name.toLowerCase()}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                We understand {city.name}'s unique needs and deliver customized solutions for your property.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Local Expertise for {city.name}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We specialize in {service.name.toLowerCase()} solutions tailored for {city.name}'s specific conditions:
                </p>
                <ul className="space-y-3">
                  {city.localFactors.commonNeeds.map((need, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{need}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Why Choose Us</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Since 2017</div>
                      <div className="text-sm text-muted-foreground">7+ years serving {city.name}</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Fully Licensed & Insured</div>
                      <div className="text-sm text-muted-foreground">Professional & reliable service</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold">Local Experts</div>
                      <div className="text-sm text-muted-foreground">{city.name} specialists</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild data-testid="button-local-expertise">
                <Link href="/about">
                  Learn More About Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Our {service.name.toLowerCase()} {city.name} services
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Comprehensive {service.name.toLowerCase()} services designed to keep your {city.name} property looking its best.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold">What We Do</h3>
                <div className="space-y-4">
                  {service.process.slice(0, 3).map((step) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold">Benefits</h3>
                <ul className="space-y-3">
                  {service.benefits.slice(0, 6).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild data-testid="button-our-services">
                <Link href={`/services/${service.slug}`}>
                  View All {service.name} Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Lawn care feels in {city.name} ID
              </h2>
              <p className="text-lg text-muted-foreground">
                {service.pricingGuidance || `Transparent pricing for ${service.name.toLowerCase()} services in ${city.name}`}
              </p>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {service.process.map((step, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-4 hover-elevate"
                      data-testid={`pricing-item-${index}`}
                    >
                      <span className="font-medium">{step.title}</span>
                      <span className="text-muted-foreground text-sm">{step.description.substring(0, 50)}...</span>
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
              <Button size="lg" asChild data-testid="button-pricing-quote">
                <Link href="/get-quote">
                  Get Your Custom Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left: Content */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  You've got a lot on your plate. Save your future {city.name} {service.name.toLowerCase()} to us
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Let us handle your {service.name.toLowerCase()} so you can focus on what matters most. 
                  Fill out the form to get started with a free consultation and quote.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Free Consultation</h3>
                      <p className="text-muted-foreground">No obligation property assessment in {city.name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Instant Quote</h3>
                      <p className="text-muted-foreground">Get pricing immediately online</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Quick Response</h3>
                      <p className="text-muted-foreground">We respond within 24 hours</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Quote Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Get Your Free Quote</CardTitle>
                  <CardDescription>Fill out the form below for instant pricing in {city.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <QuoteWizard preselectedService={service.slug} preselectedCity={city.name} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Looking for additional lawn care services in {city.name}?
            </h2>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              We offer a full range of lawn care and landscaping services to keep your {city.name} property beautiful year-round.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-additional-services">
                <Link href="/services/lawn-care">
                  View All Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" 
                asChild 
                data-testid="button-additional-call"
              >
                <a href="tel:2083522011">
                  <Phone className="mr-2 h-5 w-5" />
                  (208) 352-2011
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Lawn Care {city.name} Values
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do in {city.name}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {coreValues.map((value, index) => (
                <Card key={index} className="hover-elevate" data-testid={`card-value-${index}`}>
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

      {/* FAQs */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Common questions about {service.name.toLowerCase()} in {city.name}
              </p>
            </div>

            <div className="space-y-6">
              {service.faqs.slice(0, 5).map((faq, index) => (
                <Card key={index} data-testid={`faq-${index}`}>
                  <CardContent className="p-8">
                    <h3 className="font-semibold mb-3 text-lg">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {service.faqs.length > 5 && (
              <div className="text-center">
                <Button variant="outline" asChild data-testid="link-view-all-faqs">
                  <Link href={`/services/${service.slug}`}>
                    View All {service.name} FAQs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Nearby Cities */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                We Also Serve Nearby Cities
              </h2>
              <p className="text-lg text-muted-foreground">
                Professional {service.name.toLowerCase()} services across the Treasure Valley
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['Kuna', 'Boise', 'Meridian', 'Nampa', 'Caldwell', 'Eagle']
                .filter(c => c !== city.name)
                .map(nearbyCity => (
                  <Link key={nearbyCity} href={`/services/${service.slug}/${nearbyCity.toLowerCase()}`} data-testid={`link-nearby-city-${nearbyCity.toLowerCase()}`}>
                    <Card className="hover-elevate cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
                        <span className="font-medium">
                          {service.name} in {nearbyCity}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t shadow-lg">
        <div className="container px-4 py-3">
          <Button size="lg" className="w-full" asChild data-testid="button-mobile-sticky-quote">
            <Link href="/get-quote">
              Get Free Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
