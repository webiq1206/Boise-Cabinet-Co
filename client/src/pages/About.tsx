import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Heart, Award, Users, Wrench } from "lucide-react";

export default function About() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">About Lawn Care Kuna</h1>
            <p className="text-lg text-primary-foreground/90">
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
                Since 2017, Lawn Care Kuna has been providing professional lawn care and landscaping services to homeowners and businesses throughout the Treasure Valley. What started as a local lawn mowing service has grown into a comprehensive landscaping company offering everything from basic lawn maintenance to complex hardscaping projects.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                We understand Idaho's unique climate challenges - from scorching summer heat to freezing winter temperatures. Our team has the local expertise to ensure your lawn and landscape thrives year-round in our high-desert climate.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, we proudly serve residential and commercial properties across Kuna, Boise, Meridian, Nampa, Caldwell, and Eagle, maintaining our commitment to honest service, quality workmanship, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Honesty & Integrity</h3>
                      <p className="text-muted-foreground">
                        We value ourselves in staying honest and fair towards our customers. No hidden charges or gotchas - just transparent, straightforward service.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Quality Service</h3>
                      <p className="text-muted-foreground">
                        We provide the highest level of customer service and expertise with relentlessly consistent lawn care and landscaping services.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Customer First</h3>
                      <p className="text-muted-foreground">
                        Your satisfaction is our priority. We listen to your needs and work diligently to exceed your expectations on every project.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Professional Standards</h3>
                      <p className="text-muted-foreground">
                        Our professional crews use commercial-grade equipment and follow industry best practices to deliver superior results.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* What Sets Us Apart */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">What Sets Us Apart</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Local Idaho Expertise</h3>
                  <p className="text-muted-foreground">
                    We understand the Treasure Valley's unique climate, from USDA hardiness zones to seasonal timing for services. Our team knows exactly what works in Idaho's high-desert environment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Comprehensive Services</h3>
                  <p className="text-muted-foreground">
                    From basic lawn mowing to complex landscaping projects, we handle it all. One trusted partner for all your outdoor needs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Fully Insured & Reliable</h3>
                  <p className="text-muted-foreground">
                    We carry general liability insurance and workers compensation coverage. Your property and our team are protected.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Residential & Commercial</h3>
                  <p className="text-muted-foreground">
                    We serve both homeowners and commercial clients including HOAs, property management companies, and municipal contracts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Professional Crew</h3>
                  <p className="text-muted-foreground">
                    Our uniformed, professional crews use commercial-grade equipment to deliver consistent, high-quality results on every job.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Flexible Contracts</h3>
                  <p className="text-muted-foreground">
                    We offer monthly, seasonal, and annual contracts to fit your needs. No long-term commitment required.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Standards */}
      <section className="py-16 md:py-24 bg-accent">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Service Standards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Quality Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  100% satisfaction guaranteed on all services. We don't consider the job done until you're happy.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Consistent Service</h3>
                <p className="text-sm text-muted-foreground">
                  Relentlessly consistent lawn care services. You can count on us week after week, season after season.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Professional Approach</h3>
                <p className="text-sm text-muted-foreground">
                  Professional crews, commercial equipment, and attention to detail on every property we service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Experience the Lawn Care Kuna Difference
            </h2>
            <p className="text-lg text-muted-foreground">
              Join hundreds of satisfied customers across the Treasure Valley. Get your free quote today.
            </p>
            <Link href="/contact">
              <Button size="lg" className="text-base" data-testid="button-get-quote">
                Get Your Free Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
