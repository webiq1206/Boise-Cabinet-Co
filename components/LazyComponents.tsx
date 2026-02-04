"use client";

import dynamic from "next/dynamic";

export const LazyTestimonials = dynamic(
  () => import("@/components/Testimonials").then((mod) => mod.Testimonials),
  { 
    loading: () => <div className="h-96 animate-pulse bg-muted/50 rounded-lg" />,
    ssr: true
  }
);

export const LazyNearMeFAQ = dynamic(
  () => import("@/components/NearMeFAQ").then((mod) => mod.NearMeFAQ),
  { 
    loading: () => <div className="h-64 animate-pulse bg-muted/50 rounded-lg" />,
    ssr: true
  }
);

export const LazyServiceAreasSection = dynamic(
  () => import("@/components/ServiceAreasSection").then((mod) => mod.ServiceAreasSection),
  { 
    loading: () => <div className="h-96 animate-pulse bg-muted/50 rounded-lg" />,
    ssr: true
  }
);
