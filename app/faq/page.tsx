import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Phone,
  Leaf,
  Snowflake,
  HelpCircle,
} from "lucide-react";
import { PRIORITY_SERVICES, CITIES } from "@/shared/contentData";
import { generateFAQSchema, generateBreadcrumbSchema, generateWebPageSchema, generateSpeakableSchema } from "@/lib/schema";
import { BUSINESS_INFO } from "@/lib/seo";
import { FAQSearch } from "@/components/FAQSearch";

export const metadata: Metadata = {
  title: "Lawn Care FAQ | Common Questions Answered | Lawn Care Kuna",
  description:
    "Find answers to common lawn care and landscaping questions for Idaho's Treasure Valley. Pricing, scheduling, soil tips, and seasonal advice from local pros. Call (208) 352-2011.",
  openGraph: {
    title: "Lawn Care FAQ | Lawn Care Kuna",
    description:
      "Answers to common lawn care, landscaping, and seasonal service questions for Kuna, Boise, Meridian, and the Treasure Valley.",
    url: "/faq",
    type: "website",
  },
  alternates: {
    canonical: "https://lawncarekuna.com/faq",
  },
};

interface FAQCategory {
  title: string;
  slug: string;
  iconName: string;
  questions: Array<{ question: string; answer: string; source?: string }>;
}

function buildFAQCategories(): FAQCategory[] {
  const generalQuestions: Array<{ question: string; answer: string }> = [
    {
      question: "What areas do you serve?",
      answer: `We serve Kuna, Boise, Meridian, Eagle, Star, and Middleton in Idaho's Treasure Valley. Our team is based in Kuna and travels throughout the region for all residential and commercial services.`,
    },
    {
      question: "Are you licensed and insured?",
      answer: `Yes. Lawn Care Kuna is fully licensed and insured with $2M liability coverage. We carry all required state and local licenses for lawn care and landscaping work in Idaho.`,
    },
    {
      question: "Do you offer free estimates?",
      answer: `Yes. Every estimate is free with no obligation. We can often provide a quote within 24 hours. Call us at ${BUSINESS_INFO.phone} or use our online quote form to get started.`,
    },
    {
      question: "What forms of payment do you accept?",
      answer: "We accept cash, credit cards, checks, Venmo, and PayPal. Payment is due upon completion of service unless other arrangements have been made.",
    },
    {
      question: "Do I need to be home during service?",
      answer: "No. Most clients prefer recurring service where our crew arrives on the same day each week or every other week. We text you when we arrive and when service is complete. Just make sure gates are unlocked and any obstacles are clear.",
    },
    {
      question: "What if I am not satisfied with the work?",
      answer: "Your satisfaction is guaranteed. If something does not meet your expectations, contact us within 24 hours and we will return to address the issue at no additional cost.",
    },
  ];

  const lawnCareServices = PRIORITY_SERVICES.filter(
    (s) => s.category === "lawn-care"
  );
  const lawnCareFaqs: Array<{ question: string; answer: string; source?: string }> = [];
  for (const service of lawnCareServices) {
    if (service.faqs) {
      for (const faq of service.faqs.slice(0, 2)) {
        lawnCareFaqs.push({ ...faq, source: service.slug });
      }
    }
  }

  const landscapingServices = PRIORITY_SERVICES.filter((s) =>
    s.category.startsWith("landscaping")
  );
  const landscapingFaqs: Array<{ question: string; answer: string; source?: string }> = [];
  for (const service of landscapingServices) {
    if (service.faqs) {
      for (const faq of service.faqs.slice(0, 2)) {
        landscapingFaqs.push({ ...faq, source: service.slug });
      }
    }
  }

  const seasonalServices = PRIORITY_SERVICES.filter(
    (s) =>
      s.slug === "spring-cleanup" ||
      s.slug === "fall-cleanup" ||
      s.slug === "snow-removal" ||
      s.slug === "christmas-light-installation"
  );
  const seasonalFaqs: Array<{ question: string; answer: string; source?: string }> = [];
  for (const service of seasonalServices) {
    if (service.faqs) {
      for (const faq of service.faqs.slice(0, 2)) {
        seasonalFaqs.push({ ...faq, source: service.slug });
      }
    }
  }

  const irrigationServices = PRIORITY_SERVICES.filter(
    (s) =>
      s.slug.includes("sprinkler") ||
      s.slug.includes("irrigation") ||
      s.slug === "landscape-lighting"
  );
  const irrigationFaqs: Array<{ question: string; answer: string; source?: string }> = [];
  for (const service of irrigationServices) {
    if (service.faqs) {
      for (const faq of service.faqs.slice(0, 2)) {
        irrigationFaqs.push({ ...faq, source: service.slug });
      }
    }
  }

  const locationQuestions: Array<{ question: string; answer: string }> = [];
  for (const city of CITIES) {
    locationQuestions.push({
      question: `Do you provide lawn care in ${city.name}?`,
      answer: `Yes. We serve all neighborhoods in ${city.name}${city.neighborhoods ? `, including ${city.neighborhoods.slice(0, 3).join(", ")}` : ""}. ${city.name}'s ${city.localFactors?.soil || "local soil"} and ${city.localFactors?.climate || "climate"} require specialized care that our local team understands well. ${city.zipCodes ? `We cover zip code${city.zipCodes.length > 1 ? "s" : ""} ${city.zipCodes.join(", ")}.` : ""}`,
    });
  }

  return [
    {
      title: "General Questions",
      slug: "general",
      iconName: "HelpCircle",
      questions: generalQuestions,
    },
    {
      title: "Lawn Care Services",
      slug: "lawn-care",
      iconName: "Leaf",
      questions: lawnCareFaqs.slice(0, 10),
    },
    {
      title: "Landscaping Services",
      slug: "landscaping",
      iconName: "Sun",
      questions: landscapingFaqs.slice(0, 10),
    },
    {
      title: "Seasonal Services",
      slug: "seasonal",
      iconName: "Snowflake",
      questions: seasonalFaqs.slice(0, 8),
    },
    {
      title: "Irrigation and Lighting",
      slug: "irrigation",
      iconName: "Droplets",
      questions: irrigationFaqs.slice(0, 8),
    },
    {
      title: "Service Areas",
      slug: "service-areas",
      iconName: "MapPin",
      questions: locationQuestions,
    },
  ];
}

export default function FAQPage() {
  const categories = buildFAQCategories();

  const allFaqs = categories.flatMap((cat) => cat.questions);
  const faqSchema = generateFAQSchema(allFaqs.slice(0, 50));
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ]);
  const webPageSchema = generateWebPageSchema({
    title: "Lawn Care FAQ",
    description:
      "Answers to common lawn care and landscaping questions for Idaho's Treasure Valley.",
    url: "/faq",
  });

  const speakableSchema = generateSpeakableSchema({
    name: "Lawn Care FAQ",
    url: "/faq",
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />

      <div className="flex flex-col pb-20">
        <nav
          className="container px-4 py-4"
          aria-label="Breadcrumb"
          data-testid="nav-breadcrumb"
        >
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="hover-elevate px-1 rounded"
                data-testid="link-breadcrumb-home"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li className="font-medium text-foreground">FAQ</li>
          </ol>
        </nav>

        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="secondary" data-testid="badge-faq">
                <HelpCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                Frequently Asked Questions
              </Badge>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
                data-testid="text-faq-heading"
              >
                Lawn Care Questions, Answered
              </h1>
              <p
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
                data-speakable="summary"
                data-testid="text-faq-summary"
              >
                Lawn Care Kuna provides professional lawn care and landscaping
                services in Kuna, Boise, Meridian, Eagle, Star, and Middleton,
                Idaho. Below you will find answers to the questions our customers
                ask most often, covering pricing, scheduling, soil conditions,
                seasonal timing, and service details for the Treasure Valley.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16" data-testid="section-faq-content">
          <div className="container px-4">
            <FAQSearch categories={categories} />
          </div>
        </section>

        <section className="py-12 md:py-16 bg-muted/30" data-testid="section-faq-links">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-2xl font-bold text-center" data-testid="text-helpful-resources">
                Helpful Resources
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/seasonal-guide"
                  className="flex items-center gap-3 p-4 rounded-md border bg-background hover-elevate"
                  data-testid="link-seasonal-guide"
                >
                  <Snowflake className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Seasonal Lawn Care Guide</div>
                    <div className="text-xs text-muted-foreground">Month-by-month tips for Idaho</div>
                  </div>
                </Link>
                <Link
                  href="/pricing"
                  className="flex items-center gap-3 p-4 rounded-md border bg-background hover-elevate"
                  data-testid="link-pricing"
                >
                  <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Pricing Information</div>
                    <div className="text-xs text-muted-foreground">Transparent service pricing</div>
                  </div>
                </Link>
                <Link
                  href="/blog"
                  className="flex items-center gap-3 p-4 rounded-md border bg-background hover-elevate"
                  data-testid="link-blog"
                >
                  <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Lawn Care Blog</div>
                    <div className="text-xs text-muted-foreground">Expert tips and guides</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24" data-testid="section-faq-cta">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Still have questions?
              </h2>
              <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
                Our team is happy to help. Call us directly or request a free
                quote online and we will get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-white text-green-900 hover:bg-white/90 border-0"
                  asChild
                >
                  <Link href="/get-quote" data-testid="link-faq-cta-quote">
                    Get Free Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <a href="tel:2083522011" data-testid="link-faq-cta-phone">
                    <Phone className="mr-2 h-5 w-5" />
                    (208) 352-2011
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
