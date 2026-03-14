import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { ObfuscatedEmail } from "@/components/ObfuscatedEmail";
import { generateLocalBusinessSchema, generateBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact Us | Call (208) 352-2011 for Free Quote",
  description: "Contact Lawn Care Kuna for lawn mowing, landscaping & yard services in Kuna, Boise & Treasure Valley. Call (208) 352-2011 or get a free quote.",
  alternates: {
    canonical: "https://lawncarekuna.com/contact",
  },
  openGraph: {
    title: "Contact Lawn Care Kuna | Free Quotes",
    description: "Reach our lawn care team for a free estimate. Call (208) 352-2011 or request a quote online.",
    url: "https://lawncarekuna.com/contact",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact Lawn Care Kuna | (208) 352-2011",
    description: "Get in touch for lawn care, landscaping & free quotes in Kuna and the Treasure Valley.",
  },
};

// Schema markup - LocalBusiness for contact page to show contact info in search
const localBusinessSchema = generateLocalBusinessSchema();

const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Contact", url: "/contact" },
]);

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    content: "(208) 352-2011",
    link: "tel:2083522011",
    description: "Call us anytime",
  },
  {
    icon: Mail,
    title: "Email",
    content: "hello@lawncarekuna.com",
    link: "",
    emailUser: "hello",
    emailDomain: "lawncarekuna.com",
    description: "We respond within 24 hours",
  },
  {
    icon: MapPin,
    title: "Address",
    content: "2283 N Coopers Hawk Ave, Kuna, ID 83634",
    link: "https://maps.google.com/?q=2283+N+Coopers+Hawk+Ave+Kuna+ID",
    description: "Serving the Treasure Valley",
  },
  {
    icon: Clock,
    title: "Hours",
    content: "Mon-Sat: 7AM - 7PM",
    description: "Sunday by appointment",
  },
];

export default function ContactPage() {
  return (
    <>
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Contact Us for Lawn Care in Kuna &amp; Boise, Idaho</h1>
            <p className="text-lg text-muted-foreground">
              Get in touch with our lawn care professionals. We're here to help!
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                        {info.emailUser && info.emailDomain ? (
                          <ObfuscatedEmail
                            user={info.emailUser}
                            domain={info.emailDomain}
                            className="text-primary hover:underline font-medium"
                            showIcon={false}
                          />
                        ) : info.link ? (
                          <a 
                            href={info.link} 
                            className="text-primary hover:underline font-medium"
                            target={info.link.startsWith('http') ? '_blank' : undefined}
                            rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="font-medium">{info.content}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Get Quote CTA */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Request a Free Lawn Care Quote in Idaho
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Fill out our online quote request form and we'll get back to you with a detailed estimate within 24 hours.
            </p>
            <Button size="lg" asChild>
              <Link href="/get-quote">
                Get Your Free Lawn Care Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold">Lawn Care Service Areas in the Treasure Valley</h2>
            <p className="text-muted-foreground">
              We proudly serve the following communities in the Treasure Valley
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map((city) => (
                <Link
                  key={city}
                  href={`/areas/${city.toLowerCase()}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
