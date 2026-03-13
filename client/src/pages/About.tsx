import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Shield, Heart, Award, Users, Wrench, FileCheck, GraduationCap, TrendingUp, MapPin, Leaf, Handshake, BarChart3 } from "lucide-react";
import { generateSEOMetadata, generateLogoAltTag } from "@/lib/seo";
import { generateOrganizationSchema, generateLocalBusinessSchema } from "@/lib/schema";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function About() {
  const seoParams = {
    serviceName: "About Us",
    serviceSlug: "about",
    isHomePage: false,
  };
  const seoData = generateSEOMetadata(seoParams);
  const logoAlt = generateLogoAltTag(seoParams);

  const organizationSchema = generateOrganizationSchema();
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <link rel="canonical" href={seoData.canonical} />
        
        <meta property="og:title" content={seoData.ogTitle} />
        <meta property="og:description" content={seoData.ogDescription} />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:image:alt" content={logoAlt} />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content={seoData.twitterCard} />
        <meta name="twitter:title" content={seoData.ogTitle} />
        <meta name="twitter:description" content={seoData.ogDescription} />
        <meta name="twitter:image" content={seoData.ogImage} />
        <meta name="twitter:image:alt" content={logoAlt} />
        
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="About Lawn Care Kuna - Professional lawn care company serving Idaho since 2017"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-4 relative z-10">
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
                Since 2017, Lawn Care Kuna has been providing professional lawn care and landscaping services to homeowners and businesses throughout the Treasure Valley. What started as a local lawn mowing service has grown into a comprehensive landscaping company offering everything from basic lawn maintenance to complex hardscaping projects.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                We understand Idaho's unique climate challenges - from scorching summer heat to freezing winter temperatures. Our team has the local expertise to ensure your lawn and landscape thrives year-round in our high-desert climate.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, we proudly serve residential and commercial properties across Kuna, Boise, Meridian, Eagle, Star, and Middleton, maintaining our commitment to honest service, quality workmanship, and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials & Certifications */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Credentials & Certifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">7+ Years Experience</h3>
                      <p className="text-muted-foreground">
                        Serving the Treasure Valley since 2017, we've completed thousands of successful lawn care and landscaping projects across residential and commercial properties.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Fully Licensed & Insured</h3>
                      <p className="text-muted-foreground">
                        We carry comprehensive general liability insurance and workers' compensation coverage to protect your property and our team on every job.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Professional Training</h3>
                      <p className="text-muted-foreground">
                        Our team undergoes continuous safety training and professional development. We stay current with industry best practices and Idaho-specific landscaping techniques.
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
                      <h3 className="font-semibold text-lg mb-2">Commercial-Grade Equipment</h3>
                      <p className="text-muted-foreground">
                        We invest in professional-grade mowers, aerators, and landscaping equipment to deliver efficient, high-quality results that exceed residential-grade tools.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileCheck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Industry Affiliations</h3>
                      <p className="text-muted-foreground">
                        Members of professional landscaping associations. We follow industry standards and maintain relationships with local nurseries and suppliers.
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
                      <h3 className="font-semibold text-lg mb-2">Safety Certified</h3>
                      <p className="text-muted-foreground">
                        Our crews are trained in proper safety protocols for equipment operation, chemical application, and job site safety to ensure a secure work environment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
              <Card className="hover-elevate transition-all duration-200 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background">
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

              <Card className="hover-elevate transition-all duration-200 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background">
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

              <Card className="hover-elevate transition-all duration-200 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background">
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

              <Card className="hover-elevate transition-all duration-200 bg-gradient-to-br from-primary/5 to-white dark:from-primary/10 dark:to-background">
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

      {/* Service Guarantee */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Service Guarantee</h2>
            <div className="space-y-6 mb-12">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">100% Satisfaction Guarantee</h3>
                  <p className="text-muted-foreground">
                    We stand behind our work with a complete satisfaction guarantee. If you're not happy with our service, we'll make it right at no additional charge. We don't consider the job done until you're thrilled with the results.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Hardscaping Project Warranty</h3>
                  <p className="text-muted-foreground">
                    All hardscaping installations including patios, retaining walls, and fire pits come with a workmanship warranty. We use quality materials and professional installation techniques to ensure long-lasting results.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Free Service Calls</h3>
                  <p className="text-muted-foreground">
                    If you're not satisfied with a completed service, we'll return to address your concerns at no extra cost. Your complete satisfaction is our priority, and we'll work until we get it right.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">No-Obligation Free Consultations</h3>
                  <p className="text-muted-foreground">
                    Every project starts with a free, no-pressure consultation and quote. We'll assess your property, discuss your needs, and provide a detailed estimate with no obligation to proceed.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-1">Transparent Pricing - No Hidden Fees</h3>
                  <p className="text-muted-foreground">
                    Our quotes are clear and comprehensive. You'll know exactly what you're paying for before we start, with no surprise charges or hidden fees. What we quote is what you pay.
                  </p>
                </div>
              </div>
            </div>

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

      {/* Community Involvement */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Community Involvement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Serving Treasure Valley Since 2017</h3>
                      <p className="text-muted-foreground">
                        Proud to serve our local community for over 7 years. We've built lasting relationships with homeowners and businesses across Kuna, Boise, Meridian, Eagle, Star, and Middleton.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Local Family-Owned Business</h3>
                      <p className="text-muted-foreground">
                        As a locally owned and operated company, we're invested in our community's success. Your neighbors are our neighbors, and we take pride in beautifying our shared community.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Handshake className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Supporting Local Suppliers</h3>
                      <p className="text-muted-foreground">
                        We partner with local nurseries, suppliers, and contractors whenever possible, keeping dollars in our local economy and supporting Idaho businesses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-elevate transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Leaf className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Environmental Responsibility</h3>
                      <p className="text-muted-foreground">
                        We practice responsible lawn care with proper fertilization timing, water-efficient irrigation, and sustainable landscaping practices that protect Idaho's environment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* By The Numbers */}
      <section className="py-16 md:py-24 bg-accent">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">By The Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">7+</div>
                <p className="text-sm text-muted-foreground font-medium">Years Serving Idaho</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground font-medium">Satisfied Customers</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">6</div>
                <p className="text-sm text-muted-foreground font-medium">Locations in Service Area</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">20+</div>
                <p className="text-sm text-muted-foreground font-medium">Services Offered</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground font-medium">Licensed & Insured</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">A+</div>
                <p className="text-sm text-muted-foreground font-medium">Rating Commitment</p>
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
            <Button size="lg" asChild data-testid="button-get-quote">
              <Link href="/contact">
                Get Your Free Quote
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
