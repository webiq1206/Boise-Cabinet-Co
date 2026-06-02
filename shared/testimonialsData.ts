export interface TestimonialItem {
  customerName: string;
  serviceType: string;
  city: string;
  rating: string;
  testimonial: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    customerName: "Sarah M.",
    serviceType: "kitchen-remodel",
    city: "boise",
    rating: "5",
    testimonial:
      "Boise Cabinet Co did an amazing job on our kitchen cabinets. On time, clear communication throughout, and the results were stunning.",
  },
  {
    customerName: "Mike R.",
    serviceType: "bathroom-remodel",
    city: "meridian",
    rating: "5",
    testimonial:
      "Our master bath went from builder-grade to a space we actually enjoy every morning. The team was professional and communicated throughout the entire project.",
  },
  {
    customerName: "Jennifer K.",
    serviceType: "whole-home-remodel",
    city: "eagle",
    rating: "5",
    testimonial:
      "We stayed in our home through a full cabinet program and the team made it as painless as possible. Absolutely love the result.",
  },
  {
    customerName: "David L.",
    serviceType: "room-addition",
    city: "nampa",
    rating: "5",
    testimonial:
      "Fantastic craftsmanship and reliable timeline. Our new mudroom and pantry storage exceeded every expectation.",
  },
];
