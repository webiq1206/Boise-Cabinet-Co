import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/lib/db";
import { testimonials } from "@/shared/schema";

// Sample testimonials for when database is not available
// Structure matches Testimonials component expectations
const sampleTestimonials = [
  {
    id: 1,
    customerName: "Sarah Johnson",
    city: "kuna",
    serviceType: "lawn-mowing",
    rating: "5",
    testimonial: "Lawn Care Kuna has been maintaining our yard for over two years now. They're always on time, professional, and our lawn has never looked better. Highly recommend their services!",
    createdAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: 2,
    customerName: "Mike Thompson",
    city: "meridian",
    serviceType: "landscaping",
    rating: "5",
    testimonial: "They transformed our backyard with a beautiful patio and landscaping. The team was knowledgeable, efficient, and the results exceeded our expectations.",
    createdAt: new Date("2024-02-20").toISOString(),
  },
  {
    id: 3,
    customerName: "Jennifer Davis",
    city: "boise",
    serviceType: "christmas-lights",
    rating: "5",
    testimonial: "Best Christmas light installation service! They designed and installed beautiful lights that made our home the talk of the neighborhood. Will definitely use them again next year.",
    createdAt: new Date("2023-12-10").toISOString(),
  },
  {
    id: 4,
    customerName: "Robert Wilson",
    city: "eagle",
    serviceType: "aeration",
    rating: "5",
    testimonial: "Had my lawn aerated and overseeded. The difference is remarkable! My grass has never been this thick and healthy. Great service and fair pricing.",
    createdAt: new Date("2024-03-05").toISOString(),
  },
  {
    id: 5,
    customerName: "Lisa Martinez",
    city: "star",
    serviceType: "sprinkler-repair",
    rating: "5",
    testimonial: "Quick and professional sprinkler repair. They diagnosed the problem immediately and had everything fixed within an hour. Very reasonable pricing too.",
    createdAt: new Date("2024-04-12").toISOString(),
  },
  {
    id: 6,
    customerName: "David Anderson",
    city: "kuna",
    serviceType: "spring-cleanup",
    rating: "5",
    testimonial: "Amazing spring cleanup service! They removed all the winter debris, cleaned up the flower beds, and got our yard ready for the season. Very thorough work.",
    createdAt: new Date("2024-03-25").toISOString(),
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
