import { CATALOG_CONTENT } from "@/shared/catalog";

export interface HomepageFaq {
  q: string;
  a: string;
}

export const HOMEPAGE_FAQS: HomepageFaq[] = [
  {
    q: "What makes Boise Cabinet Co different from other cabinet companies?",
    a: "We combine a full product catalog (299 finishes and six door styles) with an online Design Studio, a dedicated client portal for project tracking, and frameless Euro construction backed by a lifetime warranty. You get one accountable team from design through installation, with transparent timelines, written scope, and proactive updates at every stage.",
  },
  {
    q: "What kind of cabinets do you build?",
    a: "We build fully custom frameless cabinets, made to order for your space. You choose from 299 finishes and six door styles, and every cabinet uses the same quality frameless construction.",
  },
  {
    q: "How long does a custom cabinet project take?",
    a: `Most custom cabinet projects run about ${CATALOG_CONTENT.leadTime} from approved design, depending on size and finish selection. Your client portal shows real-time status from design review through fabrication, delivery, and installation.`,
  },
  {
    q: "Can I design my cabinets online before committing?",
    a: "Yes. Our Design Studio starts by scanning your real room (phone AR or a wide photo), then shows cabinet layouts that fit your space. You refine the plan in 2D and 3D, preview finishes, save your design, and request pricing, all before your free consultation. We still confirm exact dimensions at your site visit.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve the full Treasure Valley: Boise, Meridian, Eagle, Nampa, Kuna, Star, Middleton, and Caldwell. If you are just outside these areas, reach out and we will let you know if we can accommodate your project.",
  },
  {
    q: "Do you install cabinets or supply only?",
    a: "We offer full-service design, fabrication coordination, delivery, and professional installation. You can also discuss supply-only options for trade partners and contractors through our partner portal.",
  },
  {
    q: "What warranty do you provide?",
    a: "Every Boise Cabinet Co cabinet carries a limited lifetime warranty to the original homeowner on workmanship and materials. Warranty details and service requests are accessible anytime through your client portal.",
  },
  {
    q: "What does the free design consultation include?",
    a: "A 60 to 90 minute consultation at your home or our showroom. We review your space, discuss goals, walk through finish and door style options, and provide a planning investment range. No pressure, you leave with clarity, not a sales pitch.",
  },
  {
    q: "How do I track my project after I order?",
    a: "Every customer gets access to our client portal where you can view your project timeline, approve designs, sign documents, pay invoices, message your project team, upload inspiration photos, and track order status through delivery and installation.",
  },
  {
    q: "What door styles and finishes are available?",
    a: "Six door styles: Slab, 3 Piece, Modern Shaker, Thin Shaker, Alpha Shaker, and Beta Shaker. Finishes span matte solids, high-gloss, and woodgrain textures, 299 options total. Browse the full finish library at boisecabinet.co/finishes or explore them in the Design Studio.",
  },
  {
    q: "Do you offer closet, laundry, and mudroom cabinets?",
    a: "Yes. We design and build cabinetry for every room in the home, kitchens, bathrooms, laundry rooms, mudrooms, home offices, pantries, closets, garage storage, entertainment centers, and built-ins. Outdoor cabinetry is available through consultation for specialty applications.",
  },
  {
    q: "How does pricing work?",
    a: "Pricing depends on your door style, finish selections, linear footage, and accessories. After your Design Studio session or consultation, we provide a detailed written proposal with line-item scope. Deposits are collected through your client portal with secure online payment.",
  },
];
