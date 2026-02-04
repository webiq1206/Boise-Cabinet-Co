import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Leaf, 
  Sprout, 
  Droplets, 
  Flame, 
  Building2, 
  Lightbulb, 
  Trees 
} from "lucide-react";
import { PRIORITY_SERVICES, type ServiceData } from "@/shared/contentData";

// Map service categories to icons
const categoryIcons: Record<string, typeof Leaf> = {
  'lawn-care': Leaf,
  'landscaping-softscape': Sprout,
  'landscaping-hardscape': Building2,
  'landscaping-water': Droplets,
  'landscaping-fire': Flame,
  'landscaping-structures': Building2,
  'landscaping-lighting': Lightbulb,
  'landscaping-irrigation': Droplets,
  'landscaping-rock': Building2,
  'landscaping-specialty': Trees,
  'christmas-lights': Lightbulb,
  'commercial': Building2,
};

interface RelatedServicesProps {
  currentServiceSlug: string;
  city?: string;
  limit?: number;
}

// Service relationship mapping for intelligent suggestions
const serviceRelationships: Record<string, string[]> = {
  // Lawn care core services
  "lawn-mowing": ["aeration", "fertilization", "weed-control", "lawn-edging"],
  "aeration": ["fertilization", "overseeding", "lawn-mowing", "dethatching"],
  "fertilization": ["weed-control", "aeration", "lawn-mowing", "overseeding"],
  "weed-control": ["fertilization", "lawn-mowing", "aeration", "lawn-renovation"],
  "dethatching": ["aeration", "overseeding", "lawn-renovation", "fertilization"],
  "overseeding": ["aeration", "fertilization", "lawn-renovation", "dethatching"],
  "lawn-edging": ["lawn-mowing", "mulch-installation", "hedge-trimming", "seasonal-cleanup"],
  "lawn-renovation": ["sod-installation", "aeration", "overseeding", "fertilization"],
  
  // Landscaping hardscape
  "patio-installation": ["retaining-walls", "fire-pit-installation", "landscape-lighting", "sod-installation"],
  "retaining-walls": ["patio-installation", "mulch-installation", "landscape-lighting", "sod-installation"],
  "fire-pit-installation": ["patio-installation", "landscape-lighting", "retaining-walls", "sod-installation"],
  "landscape-lighting": ["patio-installation", "fire-pit-installation", "retaining-walls", "tree-trimming"],
  
  // Landscaping softscape
  "sod-installation": ["lawn-mowing", "fertilization", "irrigation-repair", "aeration"],
  "mulch-installation": ["hedge-trimming", "tree-trimming", "seasonal-cleanup", "retaining-walls"],
  "hedge-trimming": ["tree-trimming", "mulch-installation", "lawn-edging", "seasonal-cleanup"],
  "tree-trimming": ["hedge-trimming", "tree-removal", "stump-grinding", "mulch-installation"],
  "tree-removal": ["stump-grinding", "tree-trimming", "mulch-installation", "sod-installation"],
  "stump-grinding": ["tree-removal", "sod-installation", "mulch-installation", "lawn-renovation"],
  
  // Irrigation
  "sprinkler-system-installation": ["sprinkler-repair", "irrigation-maintenance", "sod-installation", "fertilization"],
  "sprinkler-repair": ["irrigation-maintenance", "sprinkler-blowout", "sprinkler-system-installation", "lawn-mowing"],
  "irrigation-repair": ["irrigation-maintenance", "sprinkler-blowout", "sprinkler-system-installation", "lawn-mowing"],
  "irrigation-maintenance": ["sprinkler-repair", "irrigation-repair", "sprinkler-blowout", "fertilization"],
  "sprinkler-blowout": ["irrigation-maintenance", "sprinkler-repair", "fall-cleanup", "seasonal-cleanup"],
  
  // Seasonal
  "spring-cleanup": ["lawn-mowing", "fertilization", "aeration", "mulch-installation"],
  "fall-cleanup": ["sprinkler-blowout", "seasonal-cleanup", "aeration", "dethatching"],
  "seasonal-cleanup": ["lawn-mowing", "hedge-trimming", "mulch-installation", "tree-trimming"],
  
  // Christmas lights
  "christmas-light-installation": ["landscape-lighting", "hedge-trimming", "seasonal-cleanup", "lawn-edging"],
};

export function RelatedServices({ currentServiceSlug, city, limit = 4 }: RelatedServicesProps) {
  // Get related service slugs
  const relatedSlugs = serviceRelationships[currentServiceSlug] || [];
  
  // Get full service objects
  const relatedServices = relatedSlugs
    .map(slug => PRIORITY_SERVICES.find((s: ServiceData) => s.slug === slug))
    .filter((s): s is ServiceData => s !== undefined)
    .slice(0, limit);

  if (relatedServices.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Related Services You May Need
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Enhance your lawn care results with these complementary services
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedServices.map((service) => {
              // Build URL - if city is provided, link to geo page, otherwise service page
              const href = city 
                ? `/services/${service.slug}/${city.toLowerCase()}`
                : `/services/${service.slug}`;
              
              const IconComponent = categoryIcons[service.category] || Leaf;

              return (
                <Card key={service.slug} className="hover-elevate">
                  <CardHeader className="space-y-2 md:space-y-3">
                    <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
                      <IconComponent className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <CardTitle className="text-base md:text-lg">{service.name}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {service.shortDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={href}>
                        Explore {service.name}
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
