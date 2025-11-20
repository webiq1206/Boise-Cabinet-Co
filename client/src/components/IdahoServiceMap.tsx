import { Link } from "wouter";
import { MapPin } from "lucide-react";

interface City {
  name: string;
  slug: string;
  x: number;
  y: number;
  size: 'large' | 'medium' | 'small';
}

const cities: City[] = [
  { name: 'Eagle', slug: 'eagle', x: 520, y: 180, size: 'medium' },
  { name: 'Boise', slug: 'boise', x: 500, y: 240, size: 'large' },
  { name: 'Meridian', slug: 'meridian', x: 560, y: 260, size: 'large' },
  { name: 'Kuna', slug: 'kuna', x: 540, y: 320, size: 'medium' },
  { name: 'Nampa', slug: 'nampa', x: 420, y: 300, size: 'medium' },
  { name: 'Caldwell', slug: 'caldwell', x: 340, y: 280, size: 'small' },
];

export function IdahoServiceMap() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-2xl md:text-3xl font-serif tracking-tight">Our Service Area</h3>
        </div>
        <p className="text-muted-foreground">
          We proudly serve the greater Treasure Valley region
        </p>
      </div>

      <div className="relative w-full aspect-[4/3] bg-background rounded-lg border border-border p-4 md:p-8">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Idaho outline (simplified Treasure Valley focus) */}
          <path
            d="M 150 100 Q 200 80 250 100 L 350 120 Q 400 110 450 130 L 550 140 Q 600 135 650 150 L 700 180 Q 720 220 710 260 L 690 320 Q 680 360 650 390 L 600 420 Q 550 440 500 450 L 400 460 Q 350 455 300 440 L 250 420 Q 200 400 180 360 L 150 300 Q 140 250 150 200 Z"
            fill="hsl(var(--muted))"
            stroke="hsl(var(--border))"
            strokeWidth="2"
            className="transition-colors"
          />

          {/* City markers */}
          {cities.map((city) => {
            const radius = city.size === 'large' ? 60 : city.size === 'medium' ? 50 : 40;
            
            return (
              <Link key={city.slug} href={`/areas/${city.slug}`}>
                <g className="cursor-pointer group" data-testid={`map-city-${city.slug}`}>
                  {/* Clickable area */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={radius}
                    fill="hsl(var(--primary) / 0.15)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    className="transition-all duration-300 group-hover:fill-[hsl(var(--primary)/0.25)] group-active:fill-[hsl(var(--primary)/0.35)]"
                  />
                  
                  {/* City label */}
                  <text
                    x={city.x}
                    y={city.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground font-medium text-sm md:text-base pointer-events-none select-none"
                    style={{ fontSize: city.size === 'large' ? '16px' : '14px' }}
                  >
                    {city.name}
                  </text>
                </g>
              </Link>
            );
          })}
        </svg>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">
        Click on any city to view services in that area
      </p>
    </div>
  );
}
