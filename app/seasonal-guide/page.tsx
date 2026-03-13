import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Phone,
  Leaf,
  Snowflake,
  Sun,
  Droplets,
  Calendar,
  ThermometerSun,
  CloudRain,
} from "lucide-react";
import { generateBreadcrumbSchema, generateWebPageSchema, generateSpeakableSchema } from "@/lib/schema";
import { Testimonials } from "@/components/Testimonials";

export const metadata: Metadata = {
  title: "Seasonal Lawn Care Guide for Idaho | Month-by-Month Calendar",
  description:
    "Month-by-month lawn care calendar for Idaho Zone 6b-7a. When to mow, fertilize, aerate & winterize your lawn. Free guide from Lawn Care Kuna.",
  openGraph: {
    title: "Seasonal Lawn Care Guide | Lawn Care Kuna",
    description:
      "Your complete month-by-month lawn care calendar for Idaho's Treasure Valley. Expert timing recommendations for every season.",
    url: "https://lawncarekuna.com/seasonal-guide",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Idaho Seasonal Lawn Care Guide | Month-by-Month",
    description: "When to mow, fertilize, aerate & winterize in Idaho Zone 6b-7a. Free month-by-month calendar.",
  },
  alternates: {
    canonical: "https://lawncarekuna.com/seasonal-guide",
  },
};

interface MonthGuide {
  month: string;
  season: "spring" | "summer" | "fall" | "winter";
  tempRange: string;
  tasks: Array<{
    task: string;
    details: string;
    serviceLink?: string;
    serviceName?: string;
  }>;
}

const MONTHLY_GUIDES: MonthGuide[] = [
  {
    month: "January",
    season: "winter",
    tempRange: "20-38 F",
    tasks: [
      {
        task: "Plan spring projects",
        details:
          "Review your landscape goals for the year. Schedule consultations for hardscaping, irrigation upgrades, or landscape redesigns before the spring rush.",
      },
      {
        task: "Monitor snow load",
        details:
          "Heavy snow on shrubs and young trees can cause branch damage. Gently brush off excess snow, but leave ice alone to avoid snapping branches.",
        serviceLink: "/services/snow-removal",
        serviceName: "Snow Removal",
      },
      {
        task: "Check irrigation system",
        details:
          "Confirm your sprinkler system was properly blown out last fall. If you missed the winterization window, call immediately to prevent freeze damage.",
        serviceLink: "/services/sprinkler-blowout",
        serviceName: "Sprinkler Blowout",
      },
    ],
  },
  {
    month: "February",
    season: "winter",
    tempRange: "25-45 F",
    tasks: [
      {
        task: "Sharpen mower blades",
        details:
          "Get your mower serviced before the season starts. Sharp blades cut cleanly, reducing disease risk and giving your lawn a better appearance.",
      },
      {
        task: "Order soil amendments",
        details:
          "Treasure Valley clay soil benefits from compost and gypsum. Order amendments early so they are ready when the ground thaws.",
      },
      {
        task: "Inspect trees and shrubs",
        details:
          "Late winter is an ideal time to prune dormant deciduous trees and remove any dead or damaged branches before new growth starts.",
        serviceLink: "/services/tree-trimming",
        serviceName: "Tree Trimming",
      },
    ],
  },
  {
    month: "March",
    season: "spring",
    tempRange: "30-55 F",
    tasks: [
      {
        task: "Spring cleanup",
        details:
          "Remove leaves, twigs, and debris from the lawn and landscape beds. Clear drainage areas and gutters. This is the foundation for a healthy growing season.",
        serviceLink: "/services/spring-cleanup",
        serviceName: "Spring Cleanup",
      },
      {
        task: "Apply pre-emergent herbicide",
        details:
          "Apply pre-emergent weed control before soil temperatures hit 55 F consistently (typically late March in the Treasure Valley). This prevents crabgrass and annual weeds from germinating.",
        serviceLink: "/services/weed-control",
        serviceName: "Weed Control",
      },
      {
        task: "Test irrigation system",
        details:
          "Turn on each zone and check for broken heads, leaks, and coverage gaps. Repair any winter damage before you need full watering capacity.",
        serviceLink: "/services/sprinkler-repair",
        serviceName: "Sprinkler Repair",
      },
    ],
  },
  {
    month: "April",
    season: "spring",
    tempRange: "38-65 F",
    tasks: [
      {
        task: "First mow of the season",
        details:
          "Begin mowing when grass is actively growing, typically mid-April. Set your mower to 3 inches for the first cut. Avoid cutting more than one-third of the blade height at once.",
        serviceLink: "/services/lawn-mowing",
        serviceName: "Lawn Mowing",
      },
      {
        task: "Spring fertilization",
        details:
          "Apply a balanced slow-release fertilizer once soil temps reach 55 F. This fuels spring green-up and root development. Avoid high-nitrogen blasts that promote weak top growth.",
        serviceLink: "/services/fertilization",
        serviceName: "Fertilization",
      },
      {
        task: "Begin regular watering",
        details:
          "Start irrigation schedules at 2-3 days per week, adjusting based on rainfall. Treasure Valley lawns need about 1 to 1.5 inches of water per week in spring.",
        serviceLink: "/services/irrigation-maintenance",
        serviceName: "Irrigation Maintenance",
      },
    ],
  },
  {
    month: "May",
    season: "spring",
    tempRange: "45-75 F",
    tasks: [
      {
        task: "Switch to weekly mowing",
        details:
          "Peak spring growth means weekly mowing is important. Maintain a cutting height of 3 to 3.5 inches to promote root depth and shade out weeds.",
        serviceLink: "/services/lawn-mowing",
        serviceName: "Lawn Mowing",
      },
      {
        task: "Post-emergent weed treatment",
        details:
          "Spot-treat broadleaf weeds like dandelions and clover that escaped pre-emergent. Treat when weeds are actively growing for best results.",
        serviceLink: "/services/weed-control",
        serviceName: "Weed Control",
      },
      {
        task: "Mulch landscape beds",
        details:
          "Apply 2-3 inches of mulch around trees, shrubs, and flower beds. Mulch retains moisture, regulates soil temperature, and suppresses weeds.",
        serviceLink: "/services/mulch-installation",
        serviceName: "Mulch Installation",
      },
    ],
  },
  {
    month: "June",
    season: "summer",
    tempRange: "52-88 F",
    tasks: [
      {
        task: "Increase irrigation",
        details:
          "As temperatures climb, increase watering to 4-5 days per week. Water deeply and early in the morning (before 8 AM) to reduce evaporation. Target 1.5 to 2 inches per week.",
      },
      {
        task: "Raise mowing height",
        details:
          "Raise your cutting height to 3.5 inches. Taller grass shades roots, retains moisture, and stays greener through the heat of summer.",
        serviceLink: "/services/lawn-mowing",
        serviceName: "Lawn Mowing",
      },
      {
        task: "Trim hedges",
        details:
          "Shape hedges and shrubs after their first flush of spring growth. This is the ideal window for trimming before summer heat stresses the plants.",
        serviceLink: "/services/hedge-trimming",
        serviceName: "Hedge Trimming",
      },
    ],
  },
  {
    month: "July",
    season: "summer",
    tempRange: "58-98 F",
    tasks: [
      {
        task: "Monitor for heat stress",
        details:
          "Watch for signs of drought stress: bluish-gray color, footprints that linger, and wilting. Water deeply when you see these signs rather than waiting for your schedule.",
      },
      {
        task: "Avoid fertilizing",
        details:
          "Do not fertilize during peak summer heat. Nitrogen pushes tender new growth that burns easily. Wait until September for the next application.",
      },
      {
        task: "Check irrigation coverage",
        details:
          "Perform a can test: place tuna cans around your lawn and run each zone for 15 minutes. Adjust heads to ensure even coverage with no dry spots.",
        serviceLink: "/services/irrigation-maintenance",
        serviceName: "Irrigation Maintenance",
      },
    ],
  },
  {
    month: "August",
    season: "summer",
    tempRange: "55-95 F",
    tasks: [
      {
        task: "Plan fall projects",
        details:
          "Schedule aeration, overseeding, and fall cleanup services now. August and early September are the busiest booking months for fall lawn care in the Treasure Valley.",
      },
      {
        task: "Treat grubs if present",
        details:
          "Check for grub damage by pulling back turf in brown areas. If you find white grubs, apply a targeted treatment before they cause major damage.",
      },
      {
        task: "Maintain mowing routine",
        details:
          "Continue weekly mowing at 3.5 inches. Late summer growth may slow, so you may be able to shift to every 10 days as temperatures moderate.",
        serviceLink: "/services/lawn-mowing",
        serviceName: "Lawn Mowing",
      },
    ],
  },
  {
    month: "September",
    season: "fall",
    tempRange: "42-82 F",
    tasks: [
      {
        task: "Core aeration",
        details:
          "Fall aeration is the single most important thing you can do for Treasure Valley clay soil. Aeration relieves compaction, improves water penetration, and lets roots expand before winter.",
        serviceLink: "/services/aeration",
        serviceName: "Aeration",
      },
      {
        task: "Overseed thin areas",
        details:
          "After aeration, overseed with Kentucky bluegrass or a bluegrass-fescue blend. September soil temperatures are ideal for seed germination in Idaho.",
        serviceLink: "/services/overseeding",
        serviceName: "Overseeding",
      },
      {
        task: "Fall fertilization",
        details:
          "Apply a balanced fall fertilizer to fuel root growth before dormancy. This is the most important fertilizer application of the year for cool-season grasses.",
        serviceLink: "/services/fertilization",
        serviceName: "Fertilization",
      },
    ],
  },
  {
    month: "October",
    season: "fall",
    tempRange: "32-65 F",
    tasks: [
      {
        task: "Fall cleanup",
        details:
          "Remove fallen leaves promptly. A thick layer of leaves left on the lawn smothers grass, promotes fungus, and invites pests. Leaf removal is essential for winter lawn health.",
        serviceLink: "/services/fall-cleanup",
        serviceName: "Fall Cleanup",
      },
      {
        task: "Last mow of the season",
        details:
          "Lower your mowing height to 2.5 inches for the final cut. Shorter grass going into winter reduces snow mold risk and keeps the lawn tidy until spring.",
        serviceLink: "/services/lawn-mowing",
        serviceName: "Lawn Mowing",
      },
      {
        task: "Winterize irrigation",
        details:
          "Schedule your sprinkler blowout before the first hard freeze (typically late October to early November in the Treasure Valley). Frozen water in lines causes costly pipe and valve damage.",
        serviceLink: "/services/sprinkler-blowout",
        serviceName: "Sprinkler Blowout",
      },
    ],
  },
  {
    month: "November",
    season: "fall",
    tempRange: "25-48 F",
    tasks: [
      {
        task: "Complete sprinkler blowout",
        details:
          "If not done in October, get your irrigation system blown out immediately. Hard freezes can arrive any day now and unprotected lines will crack.",
        serviceLink: "/services/sprinkler-blowout",
        serviceName: "Sprinkler Blowout",
      },
      {
        task: "Christmas light installation",
        details:
          "Professional holiday lighting installation is best done before freezing temperatures and snow make rooflines slippery. Book early for the best selection of dates.",
        serviceLink: "/services/christmas-lights",
        serviceName: "Christmas Light Installation",
      },
      {
        task: "Protect sensitive plants",
        details:
          "Apply a layer of mulch around the base of young trees and tender perennials to insulate roots from freeze-thaw cycles through winter.",
      },
    ],
  },
  {
    month: "December",
    season: "winter",
    tempRange: "20-38 F",
    tasks: [
      {
        task: "Snow removal",
        details:
          "Keep driveways, walkways, and entrances clear after snowfall. Prompt removal prevents ice buildup and keeps your property safe and accessible.",
        serviceLink: "/services/snow-removal",
        serviceName: "Snow Removal",
      },
      {
        task: "Enjoy your holiday lights",
        details:
          "If you scheduled professional installation, sit back and enjoy the display. We handle maintenance and will return in January for removal.",
        serviceLink: "/services/christmas-lights",
        serviceName: "Christmas Light Installation",
      },
      {
        task: "Review the year",
        details:
          "Take notes on what worked and what did not this year. Were there persistent brown spots? Drainage issues? Use this information to plan improvements for next spring.",
      },
    ],
  },
];

const getSeasonIcon = (season: string) => {
  switch (season) {
    case "spring":
      return Leaf;
    case "summer":
      return Sun;
    case "fall":
      return CloudRain;
    case "winter":
      return Snowflake;
    default:
      return Calendar;
  }
};

const getSeasonColor = (season: string) => {
  switch (season) {
    case "spring":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "summer":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    case "fall":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "winter":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getSeasonBorder = (season: string) => {
  switch (season) {
    case "spring":
      return "border-l-green-500";
    case "summer":
      return "border-l-amber-500";
    case "fall":
      return "border-l-orange-500";
    case "winter":
      return "border-l-blue-500";
    default:
      return "border-l-muted";
  }
};

export default function SeasonalGuidePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Seasonal Guide", url: "/seasonal-guide" },
  ]);
  const webPageSchema = generateWebPageSchema({
    title: "Seasonal Lawn Care Guide for Idaho",
    description:
      "Month-by-month lawn care calendar for Idaho's Treasure Valley.",
    url: "/seasonal-guide",
  });

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Year-Round Lawn Care in Idaho's Treasure Valley",
    "description":
      "A month-by-month guide to maintaining a healthy lawn in USDA Zone 6b-7a, covering mowing, fertilization, aeration, irrigation, and seasonal maintenance.",
    "step": MONTHLY_GUIDES.map((guide, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": `${guide.month} Lawn Care`,
      "text": guide.tasks.map((t) => t.task).join(", "),
    })),
  };

  const speakableSchema = generateSpeakableSchema({
    name: "Seasonal Lawn Care Guide",
    url: "/seasonal-guide",
  });

  return (
    <>
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
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
            <li className="font-medium text-foreground">Seasonal Guide</li>
          </ol>
        </nav>

        <section className="relative py-16 md:py-24 bg-gradient-to-b from-primary/10 via-primary/5 to-background">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <Badge variant="secondary" data-testid="badge-seasonal">
                <Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                USDA Zone 6b-7a
              </Badge>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground"
                data-testid="text-seasonal-heading"
              >
                Seasonal Lawn Care Guide for Idaho
              </h1>
              <p
                className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
                data-speakable="summary"
                data-testid="text-seasonal-summary"
              >
                Idaho's Treasure Valley sits in USDA Hardiness Zones 6b through
                7a, with hot, dry summers reaching 95-100 F and cold winters
                that drop below zero. This month-by-month calendar tells you
                exactly when to mow, fertilize, aerate, water, and winterize
                your lawn for the best results in Kuna, Boise, Meridian, Eagle,
                Star, and Middleton.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 border-b" data-testid="section-season-nav">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-wrap justify-center gap-3">
                {(["spring", "summer", "fall", "winter"] as const).map(
                  (season) => {
                    const SeasonIcon = getSeasonIcon(season);
                    return (
                      <a
                        key={season}
                        href={`#${season}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2 transition-colors capitalize"
                        data-testid={`link-season-${season}`}
                      >
                        <SeasonIcon
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                        {season}
                      </a>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-4 bg-muted/30" data-testid="section-key-dates">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                <div className="text-center space-y-1">
                  <ThermometerSun className="h-5 w-5 text-primary mx-auto" aria-hidden="true" />
                  <div className="text-sm font-semibold">Growing Season</div>
                  <div className="text-xs text-muted-foreground">April - October</div>
                </div>
                <div className="text-center space-y-1">
                  <Droplets className="h-5 w-5 text-primary mx-auto" aria-hidden="true" />
                  <div className="text-sm font-semibold">Annual Rainfall</div>
                  <div className="text-xs text-muted-foreground">10-12 inches</div>
                </div>
                <div className="text-center space-y-1">
                  <Leaf className="h-5 w-5 text-primary mx-auto" aria-hidden="true" />
                  <div className="text-sm font-semibold">Best Aeration</div>
                  <div className="text-xs text-muted-foreground">September</div>
                </div>
                <div className="text-center space-y-1">
                  <Snowflake className="h-5 w-5 text-primary mx-auto" aria-hidden="true" />
                  <div className="text-sm font-semibold">Winterize By</div>
                  <div className="text-xs text-muted-foreground">Late October</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {(["spring", "summer", "fall", "winter"] as const).map((season) => {
          const seasonMonths = MONTHLY_GUIDES.filter(
            (g) => g.season === season
          );
          const SeasonIcon = getSeasonIcon(season);
          return (
            <section
              key={season}
              id={season}
              className="py-12 md:py-16 scroll-mt-24"
              data-testid={`section-season-${season}`}
            >
              <div className="container px-4">
                <div className="max-w-5xl mx-auto space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <SeasonIcon
                        className="h-5 w-5 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <h2
                      className="text-2xl md:text-3xl font-bold capitalize"
                      data-testid={`text-season-heading-${season}`}
                    >
                      {season} Lawn Care
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {seasonMonths.map((guide) => (
                      <Card
                        key={guide.month}
                        className={`border-l-4 rounded-none sm:rounded-md ${getSeasonBorder(season)}`}
                        data-testid={`card-month-${guide.month.toLowerCase()}`}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-center flex-wrap justify-between gap-3">
                            <CardTitle className="text-xl">
                              {guide.month}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getSeasonColor(season)}
                                data-testid={`badge-season-${guide.month.toLowerCase()}`}
                              >
                                {guide.tempRange}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {guide.tasks.map((task, taskIndex) => (
                            <div
                              key={taskIndex}
                              className="flex items-start gap-3"
                              data-testid={`task-${guide.month.toLowerCase()}-${taskIndex}`}
                            >
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                <span className="text-xs font-bold text-primary">
                                  {taskIndex + 1}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="font-semibold text-sm">
                                  {task.task}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {task.details}
                                </p>
                                {task.serviceLink && (
                                  <Link
                                    href={task.serviceLink}
                                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                    data-testid={`link-task-service-${guide.month.toLowerCase()}-${taskIndex}`}
                                  >
                                    {task.serviceName}
                                    <ArrowRight className="h-3 w-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        <section className="py-12 md:py-16 bg-muted/30" data-testid="section-seasonal-links">
          <div className="container px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-2xl font-bold text-center" data-testid="text-related-resources">
                Related Resources
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/faq"
                  className="flex items-center gap-3 p-4 rounded-md border bg-background hover-elevate"
                  data-testid="link-faq-from-guide"
                >
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">FAQ</div>
                    <div className="text-xs text-muted-foreground">Common questions answered</div>
                  </div>
                </Link>
                <Link
                  href="/services"
                  className="flex items-center gap-3 p-4 rounded-md border bg-background hover-elevate"
                  data-testid="link-services-from-guide"
                >
                  <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">All Services</div>
                    <div className="text-xs text-muted-foreground">View our full service list</div>
                  </div>
                </Link>
                <Link
                  href="/blog"
                  className="flex items-center gap-3 p-4 rounded-md border bg-background hover-elevate"
                  data-testid="link-blog-from-guide"
                >
                  <Sun className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">Lawn Care Blog</div>
                    <div className="text-xs text-muted-foreground">Expert tips and guides</div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Testimonials limit={6} />

        <section className="py-16 md:py-24" data-testid="section-seasonal-cta">
          <div className="container px-4">
            <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-br from-green-950 via-primary to-green-700 text-white p-10 md:p-16 text-center space-y-8 shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Let us handle the seasonal work for you
              </h2>
              <p className="text-lg text-white/85 leading-relaxed max-w-2xl mx-auto">
                From spring cleanup to winterization, our team takes care of
                every step on this calendar so you can enjoy a great-looking lawn
                without the effort.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-white text-green-900 hover:bg-white/90 border-0"
                  asChild
                >
                  <Link href="/get-quote" data-testid="link-seasonal-cta-quote">
                    Get Your Free Lawn Care Quote
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <a href="tel:2083522011" data-testid="link-seasonal-cta-phone">
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
