"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, ArrowRight } from "lucide-react";

const serviceAreas = [
  { name: "Kuna", slug: "kuna", state: "ID" },
  { name: "Boise", slug: "boise", state: "ID" },
  { name: "Meridian", slug: "meridian", state: "ID" },
  { name: "Eagle", slug: "eagle", state: "ID" },
  { name: "Star", slug: "star", state: "ID" },
  { name: "Middleton", slug: "middleton", state: "ID" },
];

const mapPositions: Record<string, { x: number; y: number }> = {
  middleton: { x: 18, y: 28 },
  star: { x: 32, y: 18 },
  eagle: { x: 48, y: 15 },
  boise: { x: 58, y: 28 },
  meridian: { x: 42, y: 38 },
  kuna: { x: 38, y: 58 },
};

export function ServiceAreasSection() {
  return (
    <section className="py-16 md:py-24 bg-primary/5" data-testid="section-service-areas">
      <div className="container px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
          <div className="text-center space-y-3 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" data-testid="text-service-areas-heading">
              We Serve the Entire Treasure Valley
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-service-areas-subtitle">
              Professional lawn care services across Southwest Idaho
            </p>
          </div>

          <Card className="overflow-visible" data-testid="card-service-areas-map">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8 space-y-4 border-b md:border-b-0 md:border-r">
                  <div className="flex items-center flex-wrap gap-2">
                    <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="text-lg font-semibold" data-testid="text-our-service-area">Our Service Area</h3>
                  </div>
                  <p className="text-sm text-muted-foreground" data-testid="text-service-area-description">
                    We proudly serve the greater Treasure Valley region
                  </p>

                  <div className="relative aspect-[4/3] bg-primary/5 rounded-lg overflow-visible" data-testid="container-map-visualization">
                    <svg
                      viewBox="0 0 100 80"
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                      role="img"
                      aria-label="Interactive map of Treasure Valley service areas"
                      data-testid="svg-service-areas-map"
                    >
                      <defs>
                        <linearGradient id="mapBg" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                        </linearGradient>
                      </defs>
                      <rect width="100" height="80" fill="url(#mapBg)" />

                      <path
                        d="M15 70 Q25 60, 35 55 Q50 45, 65 50 Q80 55, 85 65"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />

                      <line
                        x1={mapPositions.kuna.x}
                        y1={mapPositions.kuna.y}
                        x2={mapPositions.meridian.x}
                        y2={mapPositions.meridian.y}
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />
                      <line
                        x1={mapPositions.meridian.x}
                        y1={mapPositions.meridian.y}
                        x2={mapPositions.boise.x}
                        y2={mapPositions.boise.y}
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />
                      <line
                        x1={mapPositions.meridian.x}
                        y1={mapPositions.meridian.y}
                        x2={mapPositions.eagle.x}
                        y2={mapPositions.eagle.y}
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />
                      <line
                        x1={mapPositions.eagle.x}
                        y1={mapPositions.eagle.y}
                        x2={mapPositions.star.x}
                        y2={mapPositions.star.y}
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />
                      <line
                        x1={mapPositions.star.x}
                        y1={mapPositions.star.y}
                        x2={mapPositions.middleton.x}
                        y2={mapPositions.middleton.y}
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        opacity="0.3"
                      />

                      {serviceAreas.map((area) => {
                        const pos = mapPositions[area.slug];
                        return (
                          <a
                            key={area.slug}
                            href={`/areas/${area.slug}`}
                            data-testid={`map-marker-${area.slug}`}
                            aria-label={`View services in ${area.name}, Idaho`}
                            tabIndex={0}
                            style={{ cursor: "pointer" }}
                            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <g className="transition-opacity">
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="8"
                                fill="hsl(var(--primary))"
                                opacity="0.15"
                                className="transition-all duration-200"
                              />
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="4"
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="1.5"
                                className="transition-all duration-200"
                              />
                              <circle
                                cx={pos.x}
                                cy={pos.y}
                                r="1.5"
                                fill="hsl(var(--primary))"
                              />
                              <text
                                x={pos.x}
                                y={pos.y - 10}
                                textAnchor="middle"
                                className="text-[5px] font-medium fill-foreground pointer-events-none"
                                data-testid={`text-map-label-${area.slug}`}
                              >
                                {area.name}
                              </text>
                            </g>
                          </a>
                        );
                      })}
                    </svg>
                  </div>

                  <p className="text-xs text-muted-foreground text-center" data-testid="text-map-instruction">
                    Click on any location to view services in that area
                  </p>
                </div>

                <div className="p-6 md:p-8 space-y-4">
                  <h3 className="text-lg font-semibold" data-testid="text-locations-heading">Locations We Serve</h3>

                  <div className="space-y-0 divide-y" data-testid="list-locations">
                    {serviceAreas.map((area) => (
                      <div
                        key={area.slug}
                        className="flex items-center flex-wrap justify-between gap-4 py-3 first:pt-0 last:pb-0"
                        data-testid={`row-location-${area.slug}`}
                      >
                        <div className="flex items-center flex-wrap gap-2">
                          <MapPin className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
                          <span className="font-medium" data-testid={`text-city-${area.slug}`}>
                            {area.name}, {area.state}
                          </span>
                        </div>
                        <Link
                          href={`/areas/${area.slug}`}
                          className="text-sm text-muted-foreground flex items-center flex-wrap gap-1 transition-colors flex-shrink-0 hover-elevate"
                          data-testid={`link-area-${area.slug}`}
                        >
                          View Services
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground pt-4 border-t" data-testid="text-service-areas-footer">
                    Serving the greater Treasure Valley region since 2017.
                    Professional lawn care, landscaping, and Christmas light
                    installation available in all areas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
