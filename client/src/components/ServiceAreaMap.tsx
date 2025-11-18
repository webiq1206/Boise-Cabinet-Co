import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const serviceAreas = [
  { name: "Kuna", slug: "kuna", color: "fill-primary hover:fill-primary/80" },
  { name: "Boise", slug: "boise", color: "fill-primary hover:fill-primary/80" },
  { name: "Meridian", slug: "meridian", color: "fill-primary hover:fill-primary/80" },
  { name: "Nampa", slug: "nampa", color: "fill-primary hover:fill-primary/80" },
  { name: "Caldwell", slug: "caldwell", color: "fill-primary hover:fill-primary/80" },
  { name: "Eagle", slug: "eagle", color: "fill-primary hover:fill-primary/80" },
];

export function ServiceAreaMap() {
  return (
    <Card data-testid="card-service-area-map">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="heading-map">
          <MapPin className="h-5 w-5" />
          Our Service Area
        </CardTitle>
        <CardDescription data-testid="desc-map">
          We proudly serve the greater Treasure Valley region
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visual Map Representation */}
          <div className="relative bg-muted/30 rounded-md p-8" data-testid="map-visual">
            <svg viewBox="0 0 400 300" className="w-full h-auto">
              {/* Simple grid layout representing the Treasure Valley */}
              {/* Eagle (top right) */}
              <Link href="/areas/eagle">
                <g className="cursor-pointer">
                  <rect
                    x="250"
                    y="20"
                    width="120"
                    height="80"
                    className="fill-primary/20 hover:fill-primary/40 transition-colors"
                    rx="4"
                    data-testid="map-zone-eagle"
                  />
                  <text x="310" y="65" textAnchor="middle" className="fill-foreground text-sm font-medium pointer-events-none">
                    Eagle
                  </text>
                </g>
              </Link>

              {/* Boise (center-left) */}
              <Link href="/areas/boise">
                <g className="cursor-pointer">
                  <rect
                    x="100"
                    y="80"
                    width="140"
                    height="100"
                    className="fill-primary/30 hover:fill-primary/50 transition-colors"
                    rx="4"
                    data-testid="map-zone-boise"
                  />
                  <text x="170" y="135" textAnchor="middle" className="fill-foreground text-base font-bold pointer-events-none">
                    Boise
                  </text>
                </g>
              </Link>

              {/* Meridian (center-right) */}
              <Link href="/areas/meridian">
                <g className="cursor-pointer">
                  <rect
                    x="250"
                    y="110"
                    width="120"
                    height="90"
                    className="fill-primary/20 hover:fill-primary/40 transition-colors"
                    rx="4"
                    data-testid="map-zone-meridian"
                  />
                  <text x="310" y="160" textAnchor="middle" className="fill-foreground text-sm font-medium pointer-events-none">
                    Meridian
                  </text>
                </g>
              </Link>

              {/* Kuna (bottom center) */}
              <Link href="/areas/kuna">
                <g className="cursor-pointer">
                  <rect
                    x="180"
                    y="190"
                    width="140"
                    height="80"
                    className="fill-primary/40 hover:fill-primary/60 transition-colors"
                    rx="4"
                    data-testid="map-zone-kuna"
                  />
                  <text x="250" y="235" textAnchor="middle" className="fill-foreground text-base font-bold pointer-events-none">
                    Kuna
                  </text>
                </g>
              </Link>

              {/* Nampa (bottom left) */}
              <Link href="/areas/nampa">
                <g className="cursor-pointer">
                  <rect
                    x="20"
                    y="190"
                    width="140"
                    height="80"
                    className="fill-primary/20 hover:fill-primary/40 transition-colors"
                    rx="4"
                    data-testid="map-zone-nampa"
                  />
                  <text x="90" y="235" textAnchor="middle" className="fill-foreground text-sm font-medium pointer-events-none">
                    Nampa
                  </text>
                </g>
              </Link>

              {/* Caldwell (far left) */}
              <Link href="/areas/caldwell">
                <g className="cursor-pointer">
                  <rect
                    x="20"
                    y="100"
                    width="70"
                    height="70"
                    className="fill-primary/15 hover:fill-primary/35 transition-colors"
                    rx="4"
                    data-testid="map-zone-caldwell"
                  />
                  <text x="55" y="140" textAnchor="middle" className="fill-foreground text-xs font-medium pointer-events-none">
                    Caldwell
                  </text>
                </g>
              </Link>
            </svg>
            <p className="text-xs text-center text-muted-foreground mt-4" data-testid="text-map-hint">
              Click on any city to view services in that area
            </p>
          </div>

          {/* City List */}
          <div className="space-y-3">
            <h3 className="font-semibold mb-4" data-testid="heading-cities">Cities We Serve</h3>
            {serviceAreas.map((area) => (
              <Link key={area.slug} href={`/areas/${area.slug}`}>
                <div
                  className="flex items-center justify-between p-3 rounded-md bg-muted/30 hover-elevate active-elevate-2 transition-colors group cursor-pointer"
                  data-testid={`link-city-${area.slug}`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium">{area.name}, ID</span>
                  </div>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    View Services →
                  </span>
                </div>
              </Link>
            ))}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground" data-testid="text-coverage">
                Serving the greater Treasure Valley region since 2017. Professional lawn care, landscaping, and Christmas light installation available in all areas.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
