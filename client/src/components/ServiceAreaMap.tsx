import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface City {
  name: string;
  slug: string;
  x: number;
  y: number;
  size: 'large' | 'medium' | 'small';
}

const cities: City[] = [
  { name: 'Eagle', slug: 'eagle', x: 280, y: 110, size: 'medium' },
  { name: 'Star', slug: 'star', x: 220, y: 120, size: 'small' },
  { name: 'Boise', slug: 'boise', x: 260, y: 145, size: 'large' },
  { name: 'Meridian', slug: 'meridian', x: 310, y: 155, size: 'large' },
  { name: 'Middleton', slug: 'middleton', x: 190, y: 140, size: 'small' },
  { name: 'Kuna', slug: 'kuna', x: 290, y: 195, size: 'medium' },
  { name: 'Nampa', slug: 'nampa', x: 210, y: 180, size: 'medium' },
  { name: 'Caldwell', slug: 'caldwell', x: 160, y: 165, size: 'small' },
];

const serviceAreas = [
  { name: "Kuna", slug: "kuna" },
  { name: "Boise", slug: "boise" },
  { name: "Meridian", slug: "meridian" },
  { name: "Nampa", slug: "nampa" },
  { name: "Caldwell", slug: "caldwell" },
  { name: "Eagle", slug: "eagle" },
  { name: "Star", slug: "star" },
  { name: "Middleton", slug: "middleton" },
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
          {/* Interactive Idaho Map */}
          <div className="relative bg-muted/30 rounded-md p-6" data-testid="map-visual">
            <svg viewBox="0 0 400 300" className="w-full h-auto">
              {/* Idaho outline (simplified, focused on Treasure Valley) */}
              <path
                d="M 80 80 Q 90 70 110 75 L 150 80 Q 180 78 210 85 L 260 90 Q 300 88 330 95 L 360 110 Q 375 130 370 155 L 360 190 Q 355 215 340 235 L 320 250 Q 290 265 260 270 L 210 275 Q 180 273 150 265 L 120 250 Q 95 235 90 210 L 80 175 Q 75 140 80 110 Z"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
                strokeWidth="2"
                className="transition-colors"
              />

              {/* City markers */}
              {cities.map((city) => {
                const radius = city.size === 'large' ? 35 : city.size === 'medium' ? 28 : 22;
                
                return (
                  <Link key={city.slug} href={`/areas/${city.slug}`}>
                    <g className="cursor-pointer group" data-testid={`map-city-${city.slug}`}>
                      {/* Glow effect on hover */}
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={radius + 5}
                        fill="hsl(var(--primary) / 0)"
                        className="transition-all duration-300 group-hover:fill-[hsl(var(--primary)/0.1)]"
                      />
                      
                      {/* City region circle */}
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r={radius}
                        fill="hsl(var(--primary) / 0.15)"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                        className="transition-all duration-300 group-hover:fill-[hsl(var(--primary)/0.25)] group-hover:stroke-[hsl(var(--primary)/0.8)] group-active:fill-[hsl(var(--primary)/0.35)]"
                      />
                      
                      {/* City label */}
                      <text
                        x={city.x}
                        y={city.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="fill-foreground font-medium pointer-events-none select-none transition-all duration-300 group-hover:fill-primary"
                        style={{ fontSize: city.size === 'large' ? '13px' : city.size === 'medium' ? '11px' : '9px' }}
                      >
                        {city.name}
                      </text>
                    </g>
                  </Link>
                );
              })}
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
