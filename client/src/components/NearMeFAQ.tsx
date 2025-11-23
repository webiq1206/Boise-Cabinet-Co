import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

interface NearMeFAQProps {
  city?: string;
  serviceName?: string;
}

export function NearMeFAQ({ city = "Kuna", serviceName = "lawn care" }: NearMeFAQProps) {
  const faqs = [
    {
      question: `Where can I find ${serviceName} near me in ${city}?`,
      answer: `Lawn Care Kuna provides professional ${serviceName} services throughout ${city} and the entire Treasure Valley. We're locally based and serve all neighborhoods in ${city}, including surrounding areas. Call us at (208) 352-2011 for immediate service in your area.`,
    },
    {
      question: `How quickly can you provide ${serviceName} near me?`,
      answer: `As a local ${city}-based company, we can typically schedule ${serviceName} services within 24-48 hours for most areas in ${city} and the Treasure Valley. For urgent needs, we offer same-day service availability. Contact us today for the fastest response to "${serviceName} near me" searches.`,
    },
    {
      question: `Do you offer free quotes for ${serviceName} near me in ${city}?`,
      answer: `Yes! We provide completely free, no-obligation quotes for all ${serviceName} services in ${city} and surrounding areas. Use our online quote tool or call (208) 352-2011 to get an instant estimate for ${serviceName} near your location.`,
    },
    {
      question: `What areas do you serve for ${serviceName} near me?`,
      answer: `We proudly serve ${city}, Boise, Meridian, Nampa, Caldwell, Eagle, Star, and Middleton - covering the entire Treasure Valley within a 25-mile radius. If you're searching for "${serviceName} near me" in any of these areas, we've got you covered with licensed, insured professionals.`,
    },
    {
      question: `Why choose Lawn Care Kuna for ${serviceName} near me?`,
      answer: `When searching for "${serviceName} near me," you want a local company you can trust. We've been serving ${city} since 2010 with 4.9-star ratings, licensed professionals, and guaranteed satisfaction. Unlike national chains, we're your neighbors - we know ${city}'s unique climate, soil conditions, and local lawn care needs.`,
    },
    {
      question: `How much does ${serviceName} cost near me in ${city}?`,
      answer: `${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} pricing in ${city} varies based on property size, current lawn condition, and service frequency. Most residential properties start at $50-$85. Get an exact quote for ${serviceName} near your specific location using our instant online quoting tool or by calling (208) 352-2011.`,
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20" data-testid="near-me-faq">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
        </div>
        <CardDescription className="text-base">
          Common questions about finding {serviceName} near you in {city}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full" data-testid="near-me-faq-accordion">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} data-testid={`faq-item-${index}`}>
              <AccordionTrigger className="text-left font-semibold hover:text-primary" data-testid={`faq-trigger-${index}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed" data-testid={`faq-content-${index}`}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
