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

type LabelAnchor = "start" | "middle" | "end";

const mapMarkers: Record<
  string,
  { x: number; y: number; labelDx: number; labelDy: number; anchor: LabelAnchor }
> = {
  middleton: { x: 32, y: 58, labelDx: 0, labelDy: 14, anchor: "middle" },
  star: { x: 70, y: 36, labelDx: 0, labelDy: -10, anchor: "middle" },
  eagle: { x: 115, y: 32, labelDx: 0, labelDy: -10, anchor: "middle" },
  boise: { x: 168, y: 58, labelDx: 0, labelDy: -10, anchor: "middle" },
  meridian: { x: 108, y: 72, labelDx: 0, labelDy: 14, anchor: "middle" },
  kuna: { x: 96, y: 108, labelDx: 0, labelDy: 14, anchor: "middle" },
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

                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-card" data-testid="container-map-visualization">
                    <svg
                      viewBox="0 0 200 140"
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                      role="img"
                      aria-label="Interactive map of Treasure Valley service areas"
                      data-testid="svg-service-areas-map"
                    >
                      <defs>
                        <linearGradient id="mapBg" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
                        </linearGradient>
                        <radialGradient id="valleyGlow" cx="50%" cy="55%" r="60%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.18" />
                          <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </radialGradient>
                        <pattern id="mapDots" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                          <circle cx="1" cy="1" r="0.5" fill="hsl(var(--primary))" fillOpacity="0.18" />
                        </pattern>
                        <filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="0.8" />
                          <feOffset dx="0" dy="0.6" result="off" />
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.35" />
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      <rect width="200" height="140" fill="url(#mapBg)" />
                      <rect width="200" height="140" fill="url(#mapDots)" />

                      {/* Stylized Treasure Valley region shape */}
                      <path
                        d="M14 70
                           C 18 48, 38 28, 70 24
                           C 100 20, 140 22, 168 32
                           C 188 38, 192 60, 184 82
                           C 176 106, 150 122, 118 124
                           C 90 126, 60 120, 38 108
                           C 18 96, 10 86, 14 70 Z"
                        fill="url(#valleyGlow)"
                        stroke="hsl(var(--primary))"
                        strokeOpacity="0.35"
                        strokeWidth="0.8"
                        strokeDasharray="2 2"
                      />

                      {/* Snake River suggestion */}
                      <path
                        d="M10 118 C 50 110, 90 122, 130 116 C 160 112, 180 118, 195 112"
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeOpacity="0.25"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />

                      {/* Connector lines between markers */}
                      <path
                        d={`M ${mapMarkers.middleton.x} ${mapMarkers.middleton.y}
                            Q ${mapMarkers.star.x - 5} ${mapMarkers.star.y + 6} ${mapMarkers.star.x} ${mapMarkers.star.y}
                            L ${mapMarkers.eagle.x} ${mapMarkers.eagle.y}
                            Q ${mapMarkers.boise.x - 8} ${mapMarkers.boise.y - 8} ${mapMarkers.boise.x} ${mapMarkers.boise.y}`}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeOpacity="0.4"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeDasharray="1.5 2.5"
                      />
                      <path
                        d={`M ${mapMarkers.meridian.x} ${mapMarkers.meridian.y}
                            L ${mapMarkers.kuna.x} ${mapMarkers.kuna.y}`}
                        stroke="hsl(var(--primary))"
                        strokeOpacity="0.4"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeDasharray="1.5 2.5"
                      />
                      <path
                        d={`M ${mapMarkers.meridian.x} ${mapMarkers.meridian.y}
                            L ${mapMarkers.eagle.x} ${mapMarkers.eagle.y}`}
                        stroke="hsl(var(--primary))"
                        strokeOpacity="0.4"
                        strokeWidth="0.8"
                        strokeLinecap="round"
                        strokeDasharray="1.5 2.5"
                      />

                      {serviceAreas.map((area) => {
                        const m = mapMarkers[area.slug];
                        return (
                          <a
                            key={area.slug}
                            href={`/areas/${area.slug}`}
                            data-testid={`map-marker-${area.slug}`}
                            aria-label={`View services in ${area.name}, Idaho`}
                            tabIndex={0}
                            className="group outline-none cursor-pointer"
                            style={{ cursor: "pointer" }}
                          >
                            {/* Invisible larger hit/focus target */}
                            <circle
                              cx={m.x}
                              cy={m.y}
                              r="10"
                              fill="transparent"
                              className="group-focus-visible:stroke-primary"
                              strokeWidth="1.2"
                              strokeDasharray="2 2"
                              stroke="transparent"
                            />
                            <g
                              className="transition-transform duration-200 ease-out origin-center group-hover:[transform:scale(1.12)] group-focus-visible:[transform:scale(1.12)]"
                              style={{ transformBox: "fill-box", transformOrigin: "center" }}
                            >
                              <circle
                                cx={m.x}
                                cy={m.y}
                                r="6"
                                fill="hsl(var(--primary))"
                                fillOpacity="0.12"
                                className="transition-opacity duration-200 group-hover:fill-opacity-25"
                              />
                              <circle
                                cx={m.x}
                                cy={m.y}
                                r="3.2"
                                fill="hsl(var(--background))"
                                stroke="hsl(var(--primary))"
                                strokeWidth="1.3"
                                filter="url(#markerShadow)"
                              />
                              <circle
                                cx={m.x}
                                cy={m.y}
                                r="1.4"
                                fill="hsl(var(--primary))"
                              />
                            </g>
                            <text
                              x={m.x + m.labelDx}
                              y={m.y + m.labelDy}
                              textAnchor={m.anchor}
                              dominantBaseline="middle"
                              className="fill-foreground pointer-events-none"
                              style={{ fontSize: "7px", fontWeight: 600, letterSpacing: "0.2px" }}
                              data-testid={`text-map-label-${area.slug}`}
                              paintOrder="stroke"
                              stroke="hsl(var(--card))"
                              strokeWidth="2.2"
                              strokeLinejoin="round"
                            >
                              {area.name}
                            </text>
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
