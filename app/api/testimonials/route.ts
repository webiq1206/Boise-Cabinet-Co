import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/lib/db";
import { testimonials } from "@/shared/schema";

// Sample testimonials for when database is not available
// Structure matches Testimonials component expectations
// Covers all 6 service areas and various services
const sampleTestimonials = [
  // Kuna testimonials
  {
    id: 1,
    customerName: "Sarah M.",
    city: "kuna",
    serviceType: "lawn-mowing",
    rating: "5",
    testimonial: "Lawn Care Kuna has been taking care of our yard for 2 years now. Always on time, professional, and our lawn has never looked better!",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: 2,
    customerName: "David A.",
    city: "kuna",
    serviceType: "spring-cleanup",
    rating: "5",
    testimonial: "Amazing spring cleanup service! They removed all the winter debris, cleaned up the flower beds, and got our yard ready for the season.",
    createdAt: new Date("2024-03-25").toISOString(),
  },
  {
    id: 3,
    customerName: "Nancy P.",
    city: "kuna",
    serviceType: "fertilization",
    rating: "5",
    testimonial: "Our lawn was struggling until we started their fertilization program. Now it's the greenest on the block! Very knowledgeable team.",
    createdAt: new Date("2024-05-10").toISOString(),
  },
  // Boise testimonials
  {
    id: 4,
    customerName: "Mike R.",
    city: "boise",
    serviceType: "patio-installation",
    rating: "5",
    testimonial: "They installed a beautiful patio in our backyard. The crew was professional and the work quality exceeded our expectations.",
    createdAt: new Date("2024-02-20").toISOString(),
  },
  {
    id: 5,
    customerName: "Jennifer K.",
    city: "boise",
    serviceType: "christmas-lights",
    rating: "5",
    testimonial: "Best Christmas light installation service in the valley! They made our home look amazing for the holidays.",
    createdAt: new Date("2023-12-10").toISOString(),
  },
  {
    id: 6,
    customerName: "Tom H.",
    city: "boise",
    serviceType: "irrigation-maintenance",
    rating: "5",
    testimonial: "They winterized our sprinkler system and got it running perfectly in spring. Saved us from costly repairs. Highly recommend!",
    createdAt: new Date("2024-04-08").toISOString(),
  },
  // Meridian testimonials
  {
    id: 7,
    customerName: "Amanda L.",
    city: "meridian",
    serviceType: "landscaping",
    rating: "5",
    testimonial: "They transformed our backyard with a beautiful landscape design. The attention to detail was impressive. Worth every penny!",
    createdAt: new Date("2024-02-20").toISOString(),
  },
  {
    id: 8,
    customerName: "Chris B.",
    city: "meridian",
    serviceType: "aeration",
    rating: "5",
    testimonial: "Had my lawn aerated and overseeded. The difference is remarkable! My grass has never been this thick and healthy.",
    createdAt: new Date("2024-03-05").toISOString(),
  },
  {
    id: 9,
    customerName: "Rachel S.",
    city: "meridian",
    serviceType: "weed-control",
    rating: "5",
    testimonial: "Our lawn was overrun with weeds before we called them. Now it's weed-free and looks incredible. Great ongoing service!",
    createdAt: new Date("2024-06-15").toISOString(),
  },
  // Eagle testimonials
  {
    id: 10,
    customerName: "Robert W.",
    city: "eagle",
    serviceType: "retaining-walls",
    rating: "5",
    testimonial: "Beautiful retaining wall that solved our drainage issues and looks fantastic. Professional from start to finish.",
    createdAt: new Date("2024-03-05").toISOString(),
  },
  {
    id: 11,
    customerName: "Karen T.",
    city: "eagle",
    serviceType: "hedge-trimming",
    rating: "5",
    testimonial: "They keep our hedges perfectly manicured year-round. Always prompt, professional, and the results speak for themselves.",
    createdAt: new Date("2024-05-22").toISOString(),
  },
  {
    id: 12,
    customerName: "Steve M.",
    city: "eagle",
    serviceType: "fall-cleanup",
    rating: "5",
    testimonial: "Thorough fall cleanup service. They removed all the leaves, cleaned gutters, and prepared our yard for winter. Excellent work!",
    createdAt: new Date("2024-10-30").toISOString(),
  },
  // Star testimonials
  {
    id: 13,
    customerName: "Lisa M.",
    city: "star",
    serviceType: "sprinkler-repair",
    rating: "5",
    testimonial: "Quick and professional sprinkler repair. They diagnosed the problem immediately and had everything fixed within an hour.",
    createdAt: new Date("2024-04-12").toISOString(),
  },
  {
    id: 14,
    customerName: "Brian C.",
    city: "star",
    serviceType: "lawn-mowing",
    rating: "5",
    testimonial: "Reliable weekly mowing service. They show up when they say they will and always leave our property looking great.",
    createdAt: new Date("2024-07-18").toISOString(),
  },
  {
    id: 15,
    customerName: "Michelle D.",
    city: "star",
    serviceType: "landscape-lighting",
    rating: "5",
    testimonial: "Our new landscape lighting is gorgeous! They designed and installed lights that highlight all our best features. Love it!",
    createdAt: new Date("2024-08-05").toISOString(),
  },
  // Middleton testimonials
  {
    id: 16,
    customerName: "James F.",
    city: "middleton",
    serviceType: "lawn-mowing",
    rating: "5",
    testimonial: "Been using their services for 3 years now. Consistent quality, fair pricing, and they really care about their customers.",
    createdAt: new Date("2024-02-28").toISOString(),
  },
  {
    id: 17,
    customerName: "Patricia G.",
    city: "middleton",
    serviceType: "tree-trimming",
    rating: "5",
    testimonial: "They did an excellent job trimming our large oak tree. Very careful work that improved the tree's health and appearance.",
    createdAt: new Date("2024-06-20").toISOString(),
  },
  {
    id: 18,
    customerName: "Mark R.",
    city: "middleton",
    serviceType: "snow-removal",
    rating: "5",
    testimonial: "Reliable snow removal all winter long. They cleared our driveway early every morning so we could get to work safely.",
    createdAt: new Date("2024-01-20").toISOString(),
  },
  // Additional variety testimonials
  {
    id: 19,
    customerName: "Susan E.",
    city: "kuna",
    serviceType: "overseeding",
    rating: "5",
    testimonial: "Our patchy lawn is now thick and lush thanks to their overseeding service. The results exceeded our expectations!",
    createdAt: new Date("2024-09-10").toISOString(),
  },
  {
    id: 20,
    customerName: "Daniel K.",
    city: "boise",
    serviceType: "sprinkler-installation",
    rating: "5",
    testimonial: "Professional sprinkler system installation. They designed an efficient system that keeps our whole yard perfectly watered.",
    createdAt: new Date("2024-05-15").toISOString(),
  },
  {
    id: 21,
    customerName: "Emily N.",
    city: "meridian",
    serviceType: "christmas-lights",
    rating: "5",
    testimonial: "Made the holidays so much easier! Beautiful lights, professional installation, and they took care of everything.",
    createdAt: new Date("2023-12-15").toISOString(),
  },
  {
    id: 22,
    customerName: "Greg P.",
    city: "eagle",
    serviceType: "lawn-mowing",
    rating: "5",
    testimonial: "Top-notch lawn care service. Our property always looks professionally maintained. Couldn't be happier!",
    createdAt: new Date("2024-07-25").toISOString(),
  },
  {
    id: 23,
    customerName: "Laura H.",
    city: "star",
    serviceType: "landscaping",
    rating: "5",
    testimonial: "They completely redesigned our front yard. The curb appeal is incredible now. Neighbors keep asking who did the work!",
    createdAt: new Date("2024-04-20").toISOString(),
  },
  {
    id: 24,
    customerName: "Kevin O.",
    city: "middleton",
    serviceType: "spring-cleanup",
    rating: "5",
    testimonial: "Fast, thorough spring cleanup. They had our whole property looking pristine in just a few hours. Great value!",
    createdAt: new Date("2024-03-18").toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("service");
    const limit = parseInt(searchParams.get("limit") || "10");

    // If database is available, fetch from it
    if (isDbAvailable() && db) {
      const allTestimonials = await db.select().from(testimonials);
      
      let filtered = allTestimonials;
      if (serviceType) {
        filtered = filtered.filter(t => t.serviceType === serviceType);
      }
      
      return NextResponse.json(filtered.slice(0, limit));
    }

    // Otherwise, return sample data
    let filtered = sampleTestimonials;
    if (serviceType) {
      filtered = filtered.filter(t => t.serviceType === serviceType);
    }
    
    return NextResponse.json(filtered.slice(0, limit));
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    // Return sample data on error
    return NextResponse.json(sampleTestimonials);
  }
}
