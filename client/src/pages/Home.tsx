import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Leaf,
  Lightbulb,
  Phone,
  CheckCircle2,
  Shield,
  Award,
  Clock,
  DollarSign,
  Sprout,
  ArrowRight,
  Heart,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { ServiceAreaMap } from "@/components/ServiceAreaMap";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { Testimonials } from "@/components/Testimonials";
import { QuoteForm } from "@/components/QuoteForm";

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
  { name: "Lawn Mowing", price: "Starting at $50" },
  { name: "Lawn Aeration", price: "Starting at $85" },
  { name: "Fertilization", price: "Starting at $75" },
  { name: "Weed Control", price: "Starting at $65" },
  { name: "Spring Cleanup", price: "Starting at $120" },
  { name: "Fall Cleanup", price: "Starting at $120" },
  { name: "Patio Installation", price: "Custom Quote" },
  { name: "Retaining Walls", price: "Custom Quote" },
];

export default function Home() {
  return (
    <div className="flex flex-col pb-20">
      {/* Hero Section - Clean & Minimal */}
      <section className="relative bg-muted py-20 md:py-32 overflow-hidden">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Heading */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Most trusted lawn care services in Kuna
                </h1>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild data-testid="button-hero-schedule">
                    <Link href="/get-quote">
                      Get Free Quote
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-hero-call">
                    <a href="tel:2083522011">
                      <Phone className="mr-2 h-5 w-5" />
                      (208) 352-2011
                    </a>
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

      {/* Trust Indicators */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Why Kuna trusts us with their lawns
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional lawn care backed by experience, licensing, and a commitment to your satisfaction
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {trustIndicators.map((indicator, index) => (
                <Card key={index} className="text-center" data-testid={`card-trust-${index}`}>
                  <CardContent className="pt-6 pb-6 space-y-3">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                      <indicator.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base">{indicator.title}</h3>
                    <p className="text-sm text-muted-foreground">{indicator.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Best Local Lawn Care Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                The best local lawn care in Kuna
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At Lawn Care Kuna, we're dedicated to providing exceptional lawn care and landscaping services 
                that transform your outdoor space into something beautiful. Our experienced team understands 
                Idaho's unique climate and soil conditions, ensuring your lawn thrives year-round.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="hover-elevate" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
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
                    <Button variant="outline" className="w-full" asChild data-testid={`button-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
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

      {/* Full-Width Dark CTA */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Ready to transform your lawn?
            </h2>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">
              Get a free consultation and quote today. We'll assess your property and provide 
              a transparent estimate with no obligation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-cta-quote">
                <Link href="/get-quote">
                  Get Free Quote
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild data-testid="button-cta-call">
                <a href="tel:2083522011">
                  <Phone className="mr-2 h-5 w-5" />
                  (208) 352-2011
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lawn Care Services in Kuna */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto space-y-8">
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

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p>
                Our lawn care services include professional mowing, edging, fertilization, weed control, 
                aeration, and seasonal cleanup. We use commercial-grade equipment and proven techniques 
                to ensure your lawn stays healthy, green, and beautiful throughout the growing season.
              </p>
              <p>
                Beyond basic lawn maintenance, we specialize in landscaping projects including patio 
                installation, retaining walls, water features, and outdoor lighting. Our design team 
                works closely with you to create outdoor spaces that enhance your property's value 
                and provide years of enjoyment.
              </p>
            </div>

            <div className="text-center">
              <Button size="lg" asChild data-testid="button-all-services">
                <Link href="/services/lawn-care">
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
                  <p className="text-primary-foreground/90 leading-relaxed">
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
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto" asChild data-testid="button-feature-quote">
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
                <Button variant="outline" asChild data-testid="button-feature-about">
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
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Initial Consultation</h3>
                    <p className="text-muted-foreground">
                      We visit your property to assess your needs and provide a detailed, transparent quote.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Custom Plan</h3>
                    <p className="text-muted-foreground">
                      We create a tailored service plan that fits your lawn's specific needs and your budget.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Professional Service</h3>
                    <p className="text-muted-foreground">
                      Our trained team executes the plan with precision using commercial-grade equipment.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Quality Control</h3>
                    <p className="text-muted-foreground">
                      We inspect every job to ensure it meets our high standards before we leave.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Ongoing Care</h3>
                    <p className="text-muted-foreground">
                      We provide consistent, reliable service on your schedule, adjusting as seasons change.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    6
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Customer Satisfaction</h3>
                    <p className="text-muted-foreground">
                      Your happiness is our priority. We're not satisfied until you love your lawn.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Button size="lg" asChild data-testid="button-approach-contact">
                <Link href="/contact">
                  Schedule Your Consultation
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
                      data-testid={`pricing-item-${index}`}
                    >
                      <span className="font-medium">{service.name}</span>
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
              <div className="space-y-6 lg:sticky lg:top-24">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  You've got a lot on your plate. Save your future Kuna time
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Let us handle your lawn care so you can focus on what matters most. 
                  Fill out the form to get started with a free consultation and quote.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Free Consultation</h3>
                      <p className="text-muted-foreground">No obligation property assessment</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Instant Quote</h3>
                      <p className="text-muted-foreground">Get pricing immediately online</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
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
                  <CardDescription>Fill out the form below for instant pricing</CardDescription>
                </CardHeader>
                <CardContent>
                  <QuoteForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Before/After Gallery */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Recent Projects
              </h2>
              <p className="text-lg text-muted-foreground">
                See the transformation we've delivered for homeowners across the Treasure Valley
              </p>
            </div>
            <BeforeAfterGallery limit={4} />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
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

      {/* Testimonials */}
      <section className="py-16 md:py-24">
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

      {/* Service Area Map */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                We Serve the Entire Treasure Valley
              </h2>
              <p className="text-lg text-muted-foreground">
                Professional lawn care services across Southwest Idaho
              </p>
            </div>
            <ServiceAreaMap />
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
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Schedule your free consultation today and discover why we're Kuna's most trusted lawn care company.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" variant="secondary" asChild data-testid="button-final-cta-quote">
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
                data-testid="button-final-cta-call"
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
    </div>
  );
}
