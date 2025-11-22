import { QuoteWizard } from "@/components/QuoteWizard";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import heroBackground from "@assets/Untitled design_1763639882299.png";

export default function Contact() {
  return (
    <div className="flex flex-col">
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
                          Serving Kuna, Boise, Meridian, Nampa, Caldwell, Eagle & surrounding areas
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
                <QuoteWizard />
              </div>
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
