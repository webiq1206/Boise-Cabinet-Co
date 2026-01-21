import { Helmet } from "react-helmet-async";
import { SimpleQuoteWizard } from "@/components/SimpleQuoteWizard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Clock, Star } from "lucide-react";
import { generateSEOMetadata, generateLogoAltTag } from "@/lib/seo";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function Contact() {
  const seoParams = {
    serviceName: "Contact Us",
    serviceSlug: "contact",
    isHomePage: false,
  };
  const seoData = generateSEOMetadata(seoParams);
  const logoAlt = generateLogoAltTag(seoParams);

  return (
    <div className="flex flex-col">
      <Helmet>
        <title>{seoData.title}</title>
        <meta name="description" content="Contact Lawn Care Kuna for free lawn care quotes in Kuna, Boise, Meridian, Eagle, Star & Middleton Idaho. Call (208) 352-2011 or request a quote online." />
        <link rel="canonical" href="https://lawncarekuna.com/contact" />
        
        <meta property="og:title" content={seoData.ogTitle} />
        <meta property="og:description" content="Contact Lawn Care Kuna for free lawn care quotes. Call (208) 352-2011 or request a quote online." />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:image:alt" content={logoAlt} />
        <meta property="og:url" content="https://lawncarekuna.com/contact" />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoData.ogTitle} />
        <meta name="twitter:description" content="Contact Lawn Care Kuna for free lawn care quotes. Call (208) 352-2011 or request a quote online." />
        <meta name="twitter:image" content={seoData.ogImage} />
        <meta name="twitter:image:alt" content={logoAlt} />
      </Helmet>
      
      {/* Hero */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Contact Lawn Care Kuna for professional lawn care services in Idaho"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Contact Us</h1>
            <p className="text-lg text-muted-foreground">
              Get your free, no-obligation quote or reach out with any questions
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
                  <p className="text-muted-foreground mb-6">
                    We'd love to hear from you. Fill out the form or contact us directly.
                  </p>
                </div>

                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <a href="tel:2083522011" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-phone">
                          (208) 352-2011
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to call us directly
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <a href="mailto:hello@lawncarekuna.com" className="text-muted-foreground hover:text-primary transition-colors break-all" data-testid="link-email">
                          hello@lawncarekuna.com
                        </a>
                        <p className="text-xs text-muted-foreground mt-1">
                          We respond within 24 hours
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Address</h3>
                        <p className="text-sm text-muted-foreground">
                          2283 N Coopers Hawk Ave<br />
                          Kuna, ID 83634
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Serving Kuna, Boise, Meridian, Eagle, Star, Middleton & surrounding areas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Business Hours</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Monday - Friday: 7:00 AM - 6:00 PM</p>
                          <p>Saturday: 8:00 AM - 4:00 PM</p>
                          <p>Sunday: Closed</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quote Form */}
              <div className="lg:col-span-2">
                <SimpleQuoteWizard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Maps Location */}
      <section className="py-16">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Visit Us</h2>
            <p className="text-muted-foreground">
              Located in Kuna, Idaho. Serving the entire Treasure Valley area.
            </p>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps?q=2283+N+Coopers+Hawk+Ave,+Kuna,+ID+83634&output=embed"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lawn Care Kuna Location - 2283 N Coopers Hawk Ave, Kuna, ID 83634"
                data-testid="map-location"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                asChild
                variant="default"
                size="lg"
                data-testid="button-get-directions"
              >
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=2283+N+Coopers+Hawk+Ave,+Kuna,+ID+83634"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  Get Directions
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                data-testid="button-leave-review"
              >
                <a
                  href="https://share.google/qS8UCGzYV6EcS3iUP"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Star className="h-5 w-5 mr-2" />
                  Leave a Google Review
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">What Happens Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-lg mb-2">We Review Your Request</h3>
                <p className="text-sm text-muted-foreground">
                  We'll review your quote request and property details within a few hours
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-lg mb-2">We Contact You</h3>
                <p className="text-sm text-muted-foreground">
                  We'll reach out via phone or email within 24 hours to discuss your needs
                </p>
              </div>
              <div>
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-lg mb-2">You Receive Your Quote</h3>
                <p className="text-sm text-muted-foreground">
                  We provide a detailed, transparent quote with no hidden fees or obligations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
