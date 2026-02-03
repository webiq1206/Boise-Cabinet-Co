import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { CITIES, type CityData } from "@/shared/contentData";

interface CityCrosslinksProps {
  currentCity: string;
  serviceSlug: string;
  serviceName: string;
}

export function CityCrosslinks({ currentCity, serviceSlug, serviceName }: CityCrosslinksProps) {
  // Filter out current city
  const otherCities = CITIES.filter(
    (city: CityData) => city.name.toLowerCase() !== currentCity.toLowerCase()
  );

  if (otherCities.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center space-y-2 md:space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {serviceName} in Other Treasure Valley Locations
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              We also provide professional {serviceName.toLowerCase()} services in these nearby areas
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {otherCities.map((city: CityData) => (
              <Card key={city.slug} className="hover-elevate">
                <CardContent className="p-4 md:p-5 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base mb-1">
                      {city.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Treasure Valley
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs" 
                    asChild
                  >
                    <Link href={`/services/${serviceSlug}/${city.slug}`}>
                      View Service
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Serving the entire Treasure Valley with professional lawn care and landscaping services
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
