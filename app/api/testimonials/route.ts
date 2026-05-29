import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/lib/db";
import { testimonials, type Testimonial } from "@/shared/schema";

type SampleTestimonial = {
  id: number | string;
  customerName: string;
  city: string;
  serviceType: string;
  rating: string;
  testimonial: string;
  createdAt: string;
};

const sampleTestimonials: SampleTestimonial[] = [
  { id: 1, customerName: "Sarah M.", city: "boise", serviceType: "kitchen-remodel", rating: "5", testimonial: "Boise Remodeling Co transformed our dated kitchen into something out of a magazine. On time, transparent about costs, and the results were stunning.", createdAt: new Date("2024-01-15").toISOString() },
  { id: 2, customerName: "David A.", city: "meridian", serviceType: "bathroom-remodel", rating: "5", testimonial: "Our master bath went from builder-grade to spa-worthy. The team communicated every step of the way and the craftsmanship is incredible.", createdAt: new Date("2024-03-25").toISOString() },
  { id: 3, customerName: "Nancy P.", city: "boise", serviceType: "whole-home-remodel", rating: "5", testimonial: "We stayed in our home through a full renovation and the team made it as painless as possible. We are absolutely in love with the result.", createdAt: new Date("2024-05-10").toISOString() },
  { id: 4, customerName: "Mike R.", city: "eagle", serviceType: "room-addition", rating: "5", testimonial: "They added a full master suite to our home on time and within budget. The addition blends seamlessly with the original structure. Outstanding work.", createdAt: new Date("2024-02-20").toISOString() },
  { id: 5, customerName: "Jennifer K.", city: "nampa", serviceType: "basement-finish", rating: "5", testimonial: "Our basement went from unfinished storage to a beautiful family room, office, and full bath. The team handled permits and inspections without any hassle.", createdAt: new Date("2024-06-10").toISOString() },
  { id: 6, customerName: "Tom H.", city: "kuna", serviceType: "kitchen-remodel", rating: "5", testimonial: "From the design phase through final walkthrough, everything was first class. Our open-concept kitchen is the heart of our home now.", createdAt: new Date("2024-04-08").toISOString() },
  { id: 7, customerName: "Amanda L.", city: "meridian", serviceType: "bathroom-remodel", rating: "5", testimonial: "They remodeled both our bathrooms and the attention to detail was impressive. The tile work alone is worth every penny.", createdAt: new Date("2024-02-20").toISOString() },
  { id: 8, customerName: "Chris B.", city: "boise", serviceType: "outdoor-living", rating: "5", testimonial: "Our new covered patio with an outdoor kitchen has completely changed how we use our backyard. The pergola they designed is gorgeous.", createdAt: new Date("2024-03-05").toISOString() },
  { id: 9, customerName: "Rachel S.", city: "meridian", serviceType: "kitchen-remodel", rating: "5", testimonial: "We had a tricky galley kitchen and they completely reimagined the layout. The result is functional, beautiful, and exactly what we envisioned.", createdAt: new Date("2024-06-15").toISOString() },
  { id: 10, customerName: "Robert W.", city: "eagle", serviceType: "whole-home-remodel", rating: "5", testimonial: "A complete whole-home renovation that came in on schedule. They coordinated all the trades seamlessly — we never had to chase anyone down.", createdAt: new Date("2024-03-05").toISOString() },
  { id: 11, customerName: "Karen T.", city: "star", serviceType: "room-addition", rating: "5", testimonial: "Our home office addition has been a game changer. Permits, framing, insulation, electrical — they handled everything. Excellent from start to finish.", createdAt: new Date("2024-05-22").toISOString() },
  { id: 12, customerName: "Steve M.", city: "boise", serviceType: "basement-finish", rating: "5", testimonial: "Converted our unfinished basement into a home theater and guest suite. The sound insulation work they did is fantastic — you cannot hear anything upstairs.", createdAt: new Date("2024-10-30").toISOString() },
  { id: 13, customerName: "Lisa M.", city: "meridian", serviceType: "bathroom-remodel", rating: "5", testimonial: "Quick and professional bathroom remodel. They worked around our family schedule and kept the dust contained. Beautiful result in just two weeks.", createdAt: new Date("2024-04-12").toISOString() },
  { id: 14, customerName: "Brian C.", city: "eagle", serviceType: "kitchen-remodel", rating: "5", testimonial: "They rebuilt our kitchen from scratch — new layout, custom cabinets, waterfall island. Every single detail was done with care.", createdAt: new Date("2024-07-18").toISOString() },
  { id: 15, customerName: "Michelle D.", city: "boise", serviceType: "outdoor-living", rating: "5", testimonial: "Our outdoor living space with a fireplace, built-in grill, and overhead heaters is stunning. We use it year-round now.", createdAt: new Date("2024-08-05").toISOString() },
  { id: 16, customerName: "James F.", city: "nampa", serviceType: "whole-home-remodel", rating: "5", testimonial: "Three-month full renovation and they delivered on every promise. Budget was respected, timeline was met, quality is exceptional.", createdAt: new Date("2024-02-28").toISOString() },
  { id: 17, customerName: "Patricia G.", city: "meridian", serviceType: "room-addition", rating: "5", testimonial: "Our sunroom addition is now our favorite room in the house. The quality of the windows and the framing work is excellent. So much natural light.", createdAt: new Date("2024-06-20").toISOString() },
  { id: 18, customerName: "Mark R.", city: "boise", serviceType: "kitchen-remodel", rating: "5", testimonial: "We upgraded from a closed-off kitchen to an open concept and it changed everything about how we live in our home. Absolutely worth it.", createdAt: new Date("2024-01-20").toISOString() },
  { id: 19, customerName: "Susan E.", city: "eagle", serviceType: "bathroom-remodel", rating: "5", testimonial: "The freestanding tub and custom tile shower they designed for our primary bath is breathtaking. Friends think we moved into a new house.", createdAt: new Date("2024-09-10").toISOString() },
  { id: 20, customerName: "Daniel K.", city: "boise", serviceType: "basement-finish", rating: "5", testimonial: "Finished basement with a wet bar, gym, and two bedrooms. They maximized every square foot and the egress windows they added look natural.", createdAt: new Date("2024-05-15").toISOString() },
  { id: 21, customerName: "Emily N.", city: "meridian", serviceType: "kitchen-remodel", rating: "5", testimonial: "Our kitchen remodel came in exactly on budget and three days ahead of schedule. The quartz countertops and custom hood vent are show-stopping.", createdAt: new Date("2024-05-15").toISOString() },
  { id: 22, customerName: "Greg P.", city: "eagle", serviceType: "whole-home-remodel", rating: "5", testimonial: "Top-notch remodeling work throughout our entire home. They kept the site clean and communicated daily updates. Could not have asked for a better experience.", createdAt: new Date("2024-07-25").toISOString() },
  { id: 23, customerName: "Laura H.", city: "star", serviceType: "outdoor-living", rating: "5", testimonial: "Our covered outdoor patio with a full kitchen and bar was a big project. They nailed the design and the build quality is rock solid.", createdAt: new Date("2024-04-20").toISOString() },
  { id: 24, customerName: "Kevin O.", city: "nampa", serviceType: "bathroom-remodel", rating: "5", testimonial: "Remodeled two bathrooms at once and they finished both in under three weeks. Clean work, no surprises on the bill, beautiful tile selections.", createdAt: new Date("2024-03-18").toISOString() },
  { id: 25, customerName: "Angela W.", city: "boise", serviceType: "kitchen-remodel", rating: "5", testimonial: "The designer they assigned to us was fantastic. She helped us pick finishes that all work together beautifully. Our kitchen is truly one of a kind now.", createdAt: new Date("2024-06-12").toISOString() },
  { id: 26, customerName: "Rick D.", city: "meridian", serviceType: "room-addition", rating: "5", testimonial: "They added a full in-law suite over our garage. The structural work, staircase, and finishes are all top tier. Our parents love their space.", createdAt: new Date("2024-04-22").toISOString() },
  { id: 27, customerName: "Heather L.", city: "boise", serviceType: "kitchen-remodel", rating: "5", testimonial: "From design consultation to final walkthrough, everything was handled with professionalism. Our kitchen is now the most talked-about room in the house.", createdAt: new Date("2024-07-08").toISOString() },
  { id: 28, customerName: "Tony V.", city: "eagle", serviceType: "basement-finish", rating: "4", testimonial: "Solid basement finish with great layout planning. Minor scheduling delay mid-project but the end result — a full home gym and media room — was worth every penny.", createdAt: new Date("2024-08-15").toISOString() },
  { id: 29, customerName: "Carmen J.", city: "boise", serviceType: "whole-home-remodel", rating: "5", testimonial: "Hands down the most professional remodeling contractor we have ever worked with. They renovated our 1980s home top to bottom and it looks brand new.", createdAt: new Date("2024-06-28").toISOString() },
  { id: 30, customerName: "Paul T.", city: "meridian", serviceType: "kitchen-remodel", rating: "5", testimonial: "We hired them for a kitchen renovation and the transformation is stunning. They worked creatively with our budget and delivered beyond what we imagined.", createdAt: new Date("2024-05-20").toISOString() },
];

export async function GET() {
  if (isDbAvailable && db) {
    try {
      const dbTestimonials = await db.select().from(testimonials).limit(50);
      if (dbTestimonials.length > 0) {
        return NextResponse.json(dbTestimonials);
      }
    } catch (error) {
      console.error("Error fetching testimonials from database:", error);
    }
  }

  return NextResponse.json(sampleTestimonials);
}
