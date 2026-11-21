/**
 * Generates shared/blogImageRegistry.ts with reviewed, topic-appropriate imagery.
 * Related topics may share representative images; source uniqueness is not proof of relevance.
 * Run: node scripts/generate-blog-image-registry.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const cs = (service, city) => `/images/city-service/${service}__${city}.webp`;
const gal = (name) => `/images/gallery/gallery-${name}.webp`;
const area = (city) => `/images/areas/${city}.webp`;
const svc = (name) => `/images/services/${name}.webp`;
const cat = (room) => `/images/catalog/rooms/${room}.webp`;
const blog = (slug) => `/images/blog/${slug}.webp`;

/** slug -> { hero, alt, topicTags, source, copyFrom? } */
const ENTRIES = {
  // —— Premium long-form posts ——
  "framed-vs-frameless-cabinets": {
    hero: blog("framed-vs-frameless-cabinets"),
    alt: "Oak drawer box with dovetail joints and a black pull, shown open",
    topicTags: ["frameless", "framed", "kitchen", "cabinets"],
    source: "blog",
  },
  "what-are-rta-cabinets": {
    hero: blog("what-are-rta-cabinets"),
    alt: "Oak cabinet boxes clamped together during installation, with a drill on the floor",
    topicTags: ["rta", "kitchen", "cabinets"],
    source: "blog",
  },
  "custom-kitchen-cabinet-cost": {
    hero: blog("custom-kitchen-cabinet-cost"),
    alt: "White kitchen with an oak island of drawers and black-framed windows facing dry hills",
    topicTags: ["cost", "custom", "kitchen"],
    source: "blog",
  },
  "standard-kitchen-cabinet-sizes": {
    hero: blog("standard-kitchen-cabinet-sizes"),
    alt: "White kitchen with stacked upper cabinets to the ceiling above a stainless steel range",
    topicTags: ["sizes", "dimensions", "kitchen"],
    source: "blog",
  },
  "bathroom-vanity-buying-guide": {
    hero: blog("bathroom-vanity-buying-guide"),
    alt: "Bathroom with a long oak vanity, two black-framed mirrors and a freestanding tub",
    topicTags: ["bathroom", "vanity", "guide"],
    source: "blog",
  },
  "cabinet-refacing-vs-refinishing-vs-replacing": {
    hero: blog("cabinet-refacing-vs-refinishing-vs-replacing"),
    alt: "Kitchen cabinets partway through refacing, with new oak door fronts beside the older doors",
    topicTags: ["refacing", "refinishing", "kitchen"],
    source: "blog",
  },
  "kitchen-cabinet-organization-ideas": {
    hero: blog("kitchen-cabinet-organization-ideas"),
    alt: "Oak drawer fronts with black bar pulls on a kitchen island",
    topicTags: ["organization", "storage", "kitchen"],
    source: "blog",
  },
  "what-are-shaker-cabinets": {
    hero: blog("what-are-shaker-cabinets"),
    alt: "White shaker kitchen with an oak peninsula and a stainless steel range",
    topicTags: ["shaker", "door styles", "kitchen"],
    source: "blog",
  },
  "how-to-paint-kitchen-cabinets": {
    hero: blog("how-to-paint-kitchen-cabinets"),
    alt: "Cabinet doors laid flat after painting, in white and grey",
    topicTags: ["painting", "refinishing", "kitchen"],
    source: "blog",
  },
  "pantry-cabinet-ideas": {
    hero: blog("pantry-cabinet-ideas"),
    alt: "Pantry with white drawer cabinets, oak shelves and glass jars",
    topicTags: ["pantry", "storage", "organization"],
    source: "blog",
  },
  "how-to-make-oak-cabinets-look-modern": {
    hero: blog("how-to-make-oak-cabinets-look-modern"),
    alt: "Kitchen with oak slab cabinets on three sides and a window over the sink",
    topicTags: ["oak", "modern", "kitchen"],
    source: "blog",
  },
  "best-wood-for-kitchen-cabinets": {
    hero: blog("best-wood-for-kitchen-cabinets"),
    alt: "Kitchen with oak cabinets and a walnut island with a white counter",
    topicTags: ["wood", "materials", "kitchen"],
    source: "blog",
  },
  "two-tone-kitchen-cabinets": {
    hero: blog("two-tone-kitchen-cabinets"),
    alt: "Kitchen with oak upper cabinets, charcoal base cabinets and a white peninsula",
    topicTags: ["two-tone", "colors", "kitchen"],
    source: "blog",
  },
  "best-kitchen-cabinet-colors": {
    hero: blog("best-kitchen-cabinet-colors"),
    alt: "Sage green upper cabinets above oak drawer base cabinets with a white counter",
    topicTags: ["colors", "navy", "kitchen"],
    source: "blog",
  },
  "sage-green-kitchen-cabinets": {
    hero: blog("sage-green-kitchen-cabinets"),
    alt: "Kitchen with sage green upper cabinets and an oak island with a white counter",
    topicTags: ["sage", "green", "kitchen"],
    source: "blog",
  },
  "home-office-built-ins": {
    hero: blog("home-office-built-ins"),
    alt: "Home office with a built-in oak desk, white upper cabinets and open shelves",
    topicTags: ["built-ins", "home office", "storage"],
    source: "blog",
  },
  "laundry-room-cabinet-ideas": {
    hero: blog("laundry-room-cabinet-ideas"),
    alt: "Laundry room with white cabinets, an undermount sink and a front-loading washer and dryer",
    topicTags: ["laundry", "built-ins", "storage"],
    source: "blog",
  },
  "how-to-plan-a-kitchen-cabinet-project": {
    hero: blog("how-to-plan-a-kitchen-cabinet-project"),
    alt: "Cabinet door samples, hardware pulls and a kitchen plan on an oak table",
    topicTags: ["planning", "layout", "kitchen"],
    source: "blog",
  },
  "how-deep-are-kitchen-cabinets": {
    hero: blog("how-deep-are-kitchen-cabinets"),
    alt: "Kitchen with oak cabinets, a small oak island and a black-framed window",
    topicTags: ["depth", "sizes", "kitchen"],
    source: "blog",
  },
  "mudroom-cabinets": {
    hero: blog("mudroom-cabinets"),
    alt: "Mudroom with a built-in bench, white lockers and a coat on a hook",
    topicTags: ["mudroom", "built-ins", "storage"],
    source: "blog",
  },
  "how-to-clean-kitchen-cabinets": {
    hero: blog("how-to-clean-kitchen-cabinets"),
    alt: "Sage green upper cabinets above oak drawer base cabinets with a white counter",
    topicTags: ["cleaning", "maintenance", "kitchen"],
    source: "blog",
  },
  // —— Cabinet costs (8) ——
  "kitchen-cabinet-cost-boise": {
    hero: cs("kitchen-remodel", "boise"),
    alt: "Kitchen with oak tall cabinets, sage green upper cabinets and an oak island with drawers",
    topicTags: ["kitchen", "cost", "boise"],
    source: "city-service",
  },
  "bathroom-vanity-cost-boise": {
    hero: cs("bathroom-remodel", "boise"),
    alt: "Bathroom with an oak double vanity, two mirrors and wall-mounted brass faucets",
    topicTags: ["bathroom", "cost", "boise"],
    source: "city-service",
  },
  "whole-home-cabinet-cost-boise": {
    hero: cs("whole-home-remodel", "boise"),
    alt: "Cream built-in cabinets with three arched open shelves",
    topicTags: ["whole-home", "cost", "boise"],
    source: "city-service",
  },
  "luxury-custom-cabinet-cost-boise": {
    hero: cs("kitchen-remodel", "eagle"),
    alt: "White kitchen with an oak island of drawers and black-framed windows facing dry hills",
    topicTags: ["luxury", "cost", "eagle"],
    source: "city-service",
  },
  "cabinet-cost-per-linear-foot": {
    hero: blog("cabinet-cost-per-linear-foot"),
    alt: "Kitchen with oak tall cabinets, sage green upper cabinets and an oak island with drawers",
    topicTags: ["cost", "kitchen", "boise"],
    source: "blog",
  },
  "what-impacts-cabinet-costs-boise": {
    hero: "/images/blog/questions-to-ask-remodeling-contractor.webp",
    alt: "Cabinet door samples, paint chips, three pull finishes and a cabinet elevation drawing on a wood table",
    topicTags: ["cost", "planning", "process"],
    source: "blog",
  },
  "how-to-budget-cabinets-boise": {
    hero: "/images/marketing/hero-home.webp",
    alt: "Cream Shaker kitchen cabinets with a white oak island and a white subway tile backsplash",
    topicTags: ["cost", "budget", "planning"],
    source: "services",
  },
  "stock-vs-custom-cabinets-boise": {
    hero: blog("stock-vs-custom-cabinets-boise"),
    alt: "White kitchen with standard-height upper cabinets, a range hood and a stainless steel range",
    topicTags: ["cost", "cabinets", "boise"],
    source: "blog",
  },

  // —— Kitchen cabinets (6) ——
  "kitchen-cabinet-timeline-boise": {
    hero: cs("kitchen-remodel", "meridian"),
    alt: "Cream kitchen with an oak island of drawers and two black pendant lights",
    topicTags: ["kitchen", "timeline", "meridian"],
    source: "city-service",
  },
  "kitchen-layout-ideas-boise-homes": {
    hero: cs("kitchen-remodel", "nampa"),
    alt: "White shaker kitchen with an oak peninsula and a stainless steel range",
    topicTags: ["kitchen", "layout", "nampa"],
    source: "city-service",
  },
  "kitchen-cabinet-trends": {
    hero: cs("kitchen-remodel", "kuna"),
    alt: "Kitchen with sage green upper cabinets and an oak island with a white counter",
    topicTags: ["kitchen", "cabinets", "kuna"],
    source: "city-service",
  },
  "open-kitchen-cabinet-storage": {
    hero: blog("open-concept-kitchen-remodeling"),
    alt: "Open kitchen with a long oak island of drawers and a wall of oak tall cabinets",
    topicTags: ["kitchen", "open-concept"],
    source: "blog",
    copyFrom: cs("kitchen-remodel", "star"),
  },
  "kitchen-island-design-guide": {
    hero: cs("kitchen-remodel", "middleton"),
    alt: "Kitchen with oak upper cabinets, charcoal base cabinets and a white peninsula",
    topicTags: ["kitchen", "island", "middleton"],
    source: "city-service",
  },
  "walk-in-pantry-design-guide": {
    hero: cs("kitchen-remodel", "caldwell"),
    alt: "Kitchen with oak cabinets and a walnut island with a white counter",
    topicTags: ["kitchen", "pantry", "caldwell"],
    source: "city-service",
  },

  // —— Bathroom vanities (4) ——
  "luxury-bathroom-vanity-guide": {
    hero: cs("bathroom-remodel", "eagle"),
    alt: "Bathroom with a floating walnut vanity, a white counter and a glass shower",
    topicTags: ["bathroom", "luxury", "eagle"],
    source: "city-service",
  },
  "small-bathroom-vanity-ideas": {
    hero: cs("bathroom-remodel", "meridian"),
    alt: "Bathroom with a long oak vanity, two black-framed mirrors and a freestanding tub",
    topicTags: ["bathroom", "small", "meridian"],
    source: "city-service",
  },
  "accessible-bathroom-vanity-guide": {
    hero: cs("bathroom-remodel", "nampa"),
    alt: "Oak double vanity with two black-framed mirrors and black faucets",
    topicTags: ["bathroom", "aging-in-place", "nampa"],
    source: "city-service",
  },
  "bathroom-vanity-layout-guide": {
    hero: cs("bathroom-remodel", "kuna"),
    alt: "Floating oak vanity with a white counter and a wall-mounted faucet",
    topicTags: ["bathroom", "layout", "kuna"],
    source: "city-service",
  },

  // —— Built-ins & storage (3) ——
  "primary-suite-closet-cabinets": {
    hero: cat("closet"),
    alt: "Closet with oak wardrobe cabinets, open hanging space and drawers",
    topicTags: ["built-ins", "closet", "storage"],
    source: "services",
  },
  "garage-storage-cabinet-systems": {
    hero: cat("garage"),
    alt: "Garage with charcoal cabinets along two walls",
    topicTags: ["built-ins", "garage", "storage"],
    source: "services",
  },
  "multi-room-cabinet-planning": {
    hero: cs("whole-home-remodel", "star"),
    alt: "Oak built-in media wall with a television, open shelves and lower cabinets",
    topicTags: ["whole-home", "planning", "star"],
    source: "city-service",
  },

  // —— Outdoor cabinetry (3) ——
  "outdoor-kitchen-cabinets-boise": {
    hero: blog("outdoor-kitchens-boise"),
    alt: "Charcoal outdoor kitchen cabinets with a built-in grill, a sink and a beverage fridge on a covered patio",
    topicTags: ["outdoor", "kitchen", "boise"],
    source: "blog",
    copyFrom: cat("outdoor"),
  },
  "outdoor-bar-cabinet-storage": {
    hero: "/images/catalog/rooms/outdoor.webp",
    alt: "Outdoor kitchen with wood cabinets, a built-in grill and a stainless steel refrigerator",
    topicTags: ["outdoor", "patio", "boise"],
    source: "blog",
    copyFrom: "/images/catalog/rooms/outdoor.webp",
  },
  "premium-outdoor-cabinetry": {
    hero: "/images/blog/outdoor-kitchens-boise.webp",
    alt: "Covered patio with charcoal outdoor cabinets, a built-in grill and a stainless beverage fridge",
    topicTags: ["outdoor", "luxury", "eagle"],
    source: "city-service",
  },

  // —— Whole-home cabinetry (7) ——
  "cabinet-project-planning-guide": {
    hero: "/images/blog/material-selection-guide.webp",
    alt: "Cabinet door and finish samples arranged for project planning",
    topicTags: ["whole-home", "planning", "middleton"],
    source: "city-service",
  },
  "cabinet-buying-mistakes": {
    hero: cs("whole-home-remodel", "caldwell"),
    alt: "Oak built-in shelving with lower cabinets beside a window",
    topicTags: ["whole-home", "planning", "caldwell"],
    source: "city-service",
  },
  "whole-home-cabinet-timeline": {
    hero: cs("whole-home-remodel", "kuna"),
    alt: "White built-in bookshelves and a window seat on both sides of a window",
    topicTags: ["whole-home", "timeline", "kuna"],
    source: "city-service",
  },
  "living-through-cabinet-installation": {
    hero: "/images/blog/punch-list-guide.webp",
    alt: "Kitchen with oak cabinets, white counters, a range and an island with a sink",
    topicTags: ["whole-home", "living-in-place"],
    source: "gallery",
  },
  "cabinet-refresh-vs-replace-vs-moving": {
    hero: "/images/blog/cabinet-refacing-vs-refinishing-vs-replacing.webp",
    alt: "Kitchen cabinets partway through refacing, with new oak door fronts beside the older doors",
    topicTags: ["whole-home", "planning", "boise"],
    source: "gallery",
  },
  "custom-cabinet-design-process": {
    hero: "/images/blog/questions-to-ask-remodeling-contractor.webp",
    alt: "Painted and oak door samples, pull options and a cabinet drawing laid out for a design discussion",
    topicTags: ["whole-home", "design-build"],
    source: "blog",
    copyFrom: "/images/blog/questions-to-ask-remodeling-contractor.webp",
  },
  "cabinet-planning-checklist": {
    hero: cs("whole-home-remodel", "nampa"),
    alt: "Oak built-in shelves and cabinets on both sides of a plaster fireplace",
    topicTags: ["whole-home", "checklist", "nampa"],
    source: "city-service",
  },

  // —— Choosing a cabinet company (9) ——
  "questions-to-ask-cabinet-company": {
    hero: blog("questions-to-ask-remodeling-contractor"),
    alt: "Cabinet door samples, paint chips, three pull finishes and a cabinet elevation drawing on a wood table",
    topicTags: ["contractor", "consultation"],
    source: "blog",
    copyFrom: cs("adu", "boise"),
  },
  "cabinet-company-red-flags": {
    hero: "/images/blog/cabinet-construction-quality-guide.webp",
    alt: "dovetail drawer box and cabinet hardware for a quality inspection",
    topicTags: ["contractor", "quality"],
    source: "blog",
    copyFrom: "/images/blog/cabinet-construction-quality-guide.webp",
  },
  "what-makes-great-cabinet-company": {
    hero: "/images/blog/cabinet-door-styles-guide.webp",
    alt: "Cabinet door samples, hardware pulls and a kitchen plan on an oak table",
    topicTags: ["contractor", "craftsmanship"],
    source: "services",
  },
  "how-to-compare-cabinet-quotes": {
    hero: blog("how-to-compare-remodeling-estimates"),
    alt: "Side-by-side cabinet quote comparison for kitchen and bath packages",
    topicTags: ["contractor", "estimates"],
    source: "blog",
    copyFrom: cs("bathroom-remodel", "middleton"),
  },
  "why-cabinet-quotes-vary": {
    hero: cs("bathroom-remodel", "star"),
    alt: "Bathroom with a floating walnut vanity and a wall-mounted black faucet",
    topicTags: ["contractor", "pricing"],
    source: "city-service",
  },
  "cabinet-consultation-process": {
    hero: "/images/blog/material-selection-guide.webp",
    alt: "Cabinet door styles, finish samples and hardware arranged for a consultation",
    topicTags: ["contractor", "consultation"],
    source: "city-service",
  },
  "custom-cabinet-shop-vs-big-box": {
    hero: "/images/blog/stock-vs-custom-cabinets-boise.webp",
    alt: "White kitchen with standard-height upper cabinets, a range hood and a stainless steel range",
    topicTags: ["contractor", "design-build"],
    source: "blog",
    copyFrom: "/images/blog/stock-vs-custom-cabinets-boise.webp",
  },
  "fixed-price-vs-cost-plus": {
    hero: "/images/blog/how-to-compare-remodeling-estimates.webp",
    alt: "Kitchen and bathroom scope documents arranged for comparison",
    topicTags: ["contractor", "pricing"],
    source: "gallery",
  },
  "cabinet-construction-quality-guide": {
    hero: blog("cabinet-construction-quality-guide"),
    alt: "cabinet construction detail: a natural maple dovetailed solid-wood drawer box on soft-close undermount glides",
    topicTags: ["cabinets", "quality", "guide"],
    source: "blog",
  },
  "cabinet-materials-labels-certifications": {
    hero: "/images/blog/cabinet-construction-quality-guide.webp",
    alt: "cabinet construction detail: a natural maple dovetailed solid-wood drawer box on soft-close undermount glides",
    topicTags: ["materials", "cabinets", "guide"],
    source: "blog",
  },

  // —— Cabinet project process (8) ——
  "cabinet-finishes-door-styles-guide": {
    hero: blog("material-selection-guide"),
    alt: "Cabinet door style and finish samples",
    topicTags: ["process", "materials"],
    source: "blog",
    copyFrom: cat("mudroom"),
  },
  "cabinet-measurement-design-phase": {
    hero: gal("kitchen-before"),
    alt: "Oak kitchen cabinets in a traditional layout",
    topicTags: ["process", "design"],
    source: "gallery",
  },
  "cabinet-design-development": {
    hero: gal("bathroom-before"),
    alt: "Design development for bathroom vanity cabinets, hardware, and interior accessories",
    topicTags: ["process", "design"],
    source: "gallery",
  },
  "cabinet-fabrication-installation": {
    hero: "/images/blog/punch-list-guide.webp",
    alt: "Kitchen with oak cabinets, white counters, a range and an island with a sink",
    topicTags: ["process", "construction"],
    source: "city-service",
  },
  "cabinet-installation-punch-list": {
    hero: blog("punch-list-guide"),
    alt: "Kitchen with oak cabinets, white counters, a range and an island with a sink",
    topicTags: ["process", "punch-list"],
    source: "blog",
    copyFrom: cs("room-addition", "meridian"),
  },
  "cabinet-warranty-guide": {
    hero: "/images/blog/cabinet-construction-quality-guide.webp",
    alt: "cabinet drawer joinery and glide hardware relevant to warranty coverage",
    topicTags: ["process", "warranty"],
    source: "gallery",
  },
  "custom-vs-reserve-cabinets": {
    hero: cat("laundry"),
    alt: "Laundry room with sage green cabinets around a front-loading washer and dryer",
    topicTags: ["cabinets", "collections", "planning"],
    source: "services",
  },
  "cabinet-door-styles-guide": {
    hero: blog("cabinet-door-styles-guide"),
    alt: "Cabinet door samples, hardware pulls and a kitchen plan on an oak table",
    topicTags: ["cabinets", "door-styles", "guide"],
    source: "blog",
  },

  // —— Cabinet ROI (6) ——
  "kitchen-cabinet-roi-boise": {
    hero: blog("kitchen-roi-remodeling"),
    alt: "Cream kitchen with an oak island of drawers and two black pendant lights",
    topicTags: ["roi", "kitchen", "boise"],
    source: "blog",
    copyFrom: gal("kitchen-after"),
  },
  "bathroom-vanity-roi-boise": {
    hero: blog("bathroom-roi-remodeling"),
    alt: "Bathroom with a floating walnut vanity, a white counter and a glass shower",
    topicTags: ["roi", "bathroom", "boise"],
    source: "blog",
    copyFrom: gal("bathroom-after"),
  },
  "built-in-storage-roi": {
    hero: "/images/catalog/rooms/entertainment.webp",
    alt: "Oak built-in media wall with a television, open shelves and lower cabinets",
    topicTags: ["roi", "built-ins", "star"],
    source: "city-service",
  },
  "outdoor-cabinet-roi": {
    hero: "/images/catalog/rooms/outdoor.webp",
    alt: "Outdoor kitchen with wood cabinets, a built-in grill and a stainless steel refrigerator",
    topicTags: ["roi", "outdoor"],
    source: "blog",
    copyFrom: "/images/catalog/rooms/outdoor.webp",
  },
  "cabinet-upgrades-before-selling": {
    hero: cs("bathroom-remodel", "caldwell"),
    alt: "Oak single vanity with drawers, a white counter and a black faucet",
    topicTags: ["roi", "selling", "bathroom"],
    source: "city-service",
  },
  "cabinets-for-long-term-living": {
    hero: cs("adu", "caldwell"),
    alt: "Compact kitchen with white upper cabinets and oak base cabinets",
    topicTags: ["roi", "long-term", "caldwell"],
    source: "city-service",
  },

  // —— Cabinet specs & finishes (4) ——
  "cabinet-finishes-colors-guide": {
    hero: blog("cabinet-finishes-colors-guide"),
    alt: "Kitchen with oak cabinets, a marble-look backsplash and a brass faucet",
    topicTags: ["cabinets", "finishes", "guide"],
    source: "blog",
  },
  "cabinet-hardware-guide": {
    hero: blog("cabinet-hardware-guide"),
    alt: "White shaker drawer fronts with black bar pulls",
    topicTags: ["cabinets", "hardware", "guide"],
    source: "blog",
  },

  // —— Guides (10) ——
  "boise-cabinet-cost-guide": {
    hero: "/images/blog/custom-kitchen-cabinet-cost.webp",
    alt: "White kitchen with an oak island of drawers and black-framed windows facing dry hills",
    topicTags: ["cost", "guide", "pillar"],
    source: "gallery",
  },
  "treasure-valley-cabinet-guide": {
    hero: area("boise"),
    alt: "Kitchen with white oak flat-panel cabinets, pale green upper cabinets and a white-topped island",
    topicTags: ["location", "treasure-valley", "guide"],
    source: "areas",
  },
  "boise-cabinet-guide": {
    hero: blog("boise-remodeling-guide"),
    alt: "Tree-lined residential street of two-story homes with foothills in the distance",
    topicTags: ["location", "boise", "guide"],
    source: "blog",
    copyFrom: area("meridian"),
  },
  "boise-kitchen-cabinet-guide": {
    hero: blog("boise-kitchen-cabinet-guide"),
    alt: "Cream kitchen with an oak island of drawers and two black pendant lights",
    topicTags: ["kitchen", "guide", "pillar"],
    source: "blog",
  },
  "boise-bathroom-vanity-guide": {
    hero: cat("bathroom"),
    alt: "Bathroom with an oak double vanity, two mirrors and wall-mounted brass faucets",
    topicTags: ["bathroom", "guide", "pillar"],
    source: "services",
  },
  "built-in-cabinet-guide": {
    hero: cat("built-ins"),
    alt: "Oak built-in shelves and cabinets on both sides of a plaster fireplace",
    topicTags: ["built-ins", "guide", "pillar"],
    source: "services",
  },
  "whole-home-cabinetry-guide": {
    hero: svc("whole-home-remodel"),
    alt: "Coordinated cabinetry beside an open living space",
    topicTags: ["whole-home", "guide", "pillar"],
    source: "services",
  },
  "choose-cabinet-company-boise": {
    hero: "/images/blog/questions-to-ask-remodeling-contractor.webp",
    alt: "Cabinet door samples, paint chips, three pull finishes and a cabinet elevation drawing on a wood table",
    topicTags: ["contractor", "guide", "pillar"],
    source: "blog",
  },
  "cabinet-project-process-guide": {
    hero: blog("what-are-rta-cabinets"),
    alt: "Oak cabinet boxes clamped together during installation, with a drill on the floor",
    topicTags: ["process", "guide", "pillar"],
    source: "blog",
  },
  "cabinet-roi-guide-boise": {
    hero: blog("best-remodeling-roi-boise"),
    alt: "White kitchen cabinets with an island, pale counters and stainless appliances",
    topicTags: ["roi", "guide", "pillar"],
    source: "blog",
    copyFrom: gal("kitchen-after"),
  },

  // —— City cabinet guides (7) ——
  "meridian-cabinet-guide": {
    hero: area("meridian"),
    alt: "Cream kitchen with an oak island of drawers and two black pendant lights",
    topicTags: ["location", "meridian", "guide"],
    source: "areas",
  },
  "eagle-cabinet-guide": {
    hero: area("eagle"),
    alt: "White kitchen with an oak island of drawers and black-framed windows facing dry hills",
    topicTags: ["location", "eagle", "guide"],
    source: "areas",
  },
  "nampa-cabinet-guide": {
    hero: area("nampa"),
    alt: "White Shaker kitchen with a white oak island and a tiled range wall",
    topicTags: ["location", "nampa", "guide"],
    source: "areas",
  },
  "kuna-cabinet-guide": {
    hero: area("kuna"),
    alt: "Kitchen with sage green Shaker upper cabinets and a white oak island",
    topicTags: ["location", "kuna", "guide"],
    source: "areas",
  },
  "star-cabinet-guide": {
    hero: area("star"),
    alt: "Kitchen with white oak flat-panel cabinets and a walnut island of drawers",
    topicTags: ["location", "star", "guide"],
    source: "areas",
  },
  "caldwell-cabinet-guide": {
    hero: area("caldwell"),
    alt: "White oak built-in cabinets with open shelves along a wall",
    topicTags: ["location", "caldwell", "guide"],
    source: "areas",
  },
  "middleton-cabinet-guide": {
    hero: area("middleton"),
    alt: "Kitchen with charcoal lower cabinets, white oak upper cabinets and a white peninsula",
    topicTags: ["location", "middleton", "guide"],
    source: "areas",
  },
  "garden-city-cabinet-guide": {
    hero: blog("two-tone-kitchen-cabinets"),
    alt: "Kitchen with light wood upper cabinets, charcoal lower cabinets and a charcoal island",
    topicTags: ["location", "garden-city", "guide"],
    source: "blog",
  },
};

const HUB_HEROES = {
  "cabinet-costs": "/images/blog/custom-kitchen-cabinet-cost.webp",
  "kitchen-cabinets": "/images/catalog/rooms/kitchen-walnut-mountain.webp",
  "bathroom-vanities": cat("bathroom"),
  "built-ins-storage": cat("built-ins"),
  "whole-home-cabinetry": svc("whole-home-remodel"),
  "choosing-cabinet-company": "/images/blog/questions-to-ask-remodeling-contractor.webp",
  "cabinet-project-process": "/images/blog/questions-to-ask-remodeling-contractor.webp",
  "cabinet-roi": blog("best-remodeling-roi-boise"),
  "local-guides": area("boise"),
};

const GUIDE_START = "boise-cabinet-cost-guide";
const blogSlugsFromEntries = Object.keys(ENTRIES).slice(0, Object.keys(ENTRIES).indexOf(GUIDE_START));
const EXPECTED_BLOG = 78;
const EXPECTED_GUIDES = 18;

if (blogSlugsFromEntries.length !== EXPECTED_BLOG) {
  console.error(`Expected ${EXPECTED_BLOG} blog slugs before guides, got ${blogSlugsFromEntries.length}`);
  process.exit(1);
}

const BLOG_POST_SLUGS = new Set(blogSlugsFromEntries);

function effectiveImage(entry) {
  return entry.copyFrom ?? entry.hero;
}

const blogEffectivePaths = new Map();
for (const slug of BLOG_POST_SLUGS) {
  const entry = ENTRIES[slug];
  const eff = effectiveImage(entry);
  if (blogEffectivePaths.has(eff)) {
    console.warn(
      `Shared representative image for related blog topics: ${eff} used by ${blogEffectivePaths.get(eff)} and ${slug}`,
    );
  }
  blogEffectivePaths.set(eff, slug);
}

const heroPaths = new Map();
for (const [slug, entry] of Object.entries(ENTRIES)) {
  if (heroPaths.has(entry.hero)) {
    console.warn(`Shared representative hero: ${entry.hero} used by ${heroPaths.get(entry.hero)} and ${slug}`);
  }
  heroPaths.set(entry.hero, slug);
}

if (Object.keys(ENTRIES).length !== EXPECTED_BLOG + EXPECTED_GUIDES) {
  console.error(`Expected ${EXPECTED_BLOG + EXPECTED_GUIDES} entries, got ${Object.keys(ENTRIES).length}`);
  process.exit(1);
}

const registryBody = Object.entries(ENTRIES)
  .map(([slug, e]) => {
    const thumb = e.thumbnail ? `\n    thumbnail: '${e.thumbnail}',` : "";
    return `  '${slug}': {
    hero: '${e.hero}',${thumb}
    alt: '${e.alt.replace(/'/g, "\\'")}',
    topicTags: ${JSON.stringify(e.topicTags)},
    source: '${e.source}',
  },`;
  })
  .join("\n");

const hubBody = Object.entries(HUB_HEROES)
  .map(([hub, hero]) => `  '${hub}': '${hero}',`)
  .join("\n");

const ts = `/**
 * Per-slug blog and guide imagery - single source of truth.
 * Generated by scripts/generate-blog-image-registry.mjs - do not hand-edit entries.
 * Re-run the generator after changing slug mappings, then npm run images:blog.
 */

export type BlogImageSource = 'blog' | 'gallery' | 'city-service' | 'areas' | 'services';

export interface BlogImageEntry {
  hero: string;
  thumbnail?: string;
  alt: string;
  topicTags: string[];
  source: BlogImageSource;
}

export const BLOG_IMAGE_REGISTRY: Record<string, BlogImageEntry> = {
${registryBody}
};

export const HUB_HERO_IMAGES: Record<string, string> = {
${hubBody}
};

/** Slugs that need files copied to public/images/blog/ (see scripts/setup-blog-images.mjs) */
export const BLOG_ASSET_COPY_MAP: Record<string, string> = {
${Object.entries(ENTRIES)
  .filter(([, e]) => e.copyFrom)
  .map(([slug, e]) => `  '${slug}': '${e.copyFrom}',`)
  .join("\n")}
};
`;

fs.writeFileSync(path.join(root, "shared", "blogImageRegistry.ts"), ts);
console.log(`Wrote blogImageRegistry.ts with ${Object.keys(ENTRIES).length} entries`);
