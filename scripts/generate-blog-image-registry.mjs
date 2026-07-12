/**
 * Generates shared/blogImageRegistry.ts with unique hero paths for every blog post and guide.
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
const blog = (slug) => `/images/blog/${slug}.png`;

/** slug -> { hero, alt, topicTags, source, copyFrom? } */
const ENTRIES = {
  // —— Premium long-form posts ——
  "framed-vs-frameless-cabinets": {
    hero: blog("framed-vs-frameless-cabinets"),
    alt: "Real completed modern frameless kitchen in a Treasure Valley home with warm white oak flat-panel cabinets, a crisp white perimeter, and wide full-extension drawers",
    topicTags: ["frameless", "framed", "kitchen", "cabinets"],
    source: "blog",
  },
  "what-are-rta-cabinets": {
    hero: blog("what-are-rta-cabinets"),
    alt: "Real completed budget-friendly Treasure Valley kitchen with warm natural white oak flat-panel cabinets, black bar pulls, and quartz counters",
    topicTags: ["rta", "kitchen", "cabinets"],
    source: "blog",
  },
  "custom-kitchen-cabinet-cost": {
    hero: blog("custom-kitchen-cabinet-cost"),
    alt: "Real completed luxury custom kitchen in a Treasure Valley home with navy blue and white two-tone cabinets, brass hardware, and a marble-look quartz island",
    topicTags: ["cost", "custom", "kitchen"],
    source: "blog",
  },
  "standard-kitchen-cabinet-sizes": {
    hero: blog("standard-kitchen-cabinet-sizes"),
    alt: "Real completed white Shaker kitchen in a Treasure Valley family home showing a full wall of base cabinets, upper cabinets, and a tall pantry",
    topicTags: ["sizes", "dimensions", "kitchen"],
    source: "blog",
  },
  "bathroom-vanity-buying-guide": {
    hero: blog("bathroom-vanity-buying-guide"),
    alt: "Real completed Treasure Valley bathroom with a modern floating white oak double vanity, white quartz top, undermount sinks, and a large framed mirror",
    topicTags: ["bathroom", "vanity", "guide"],
    source: "blog",
  },
  "cabinet-refacing-vs-refinishing-vs-replacing": {
    hero: blog("cabinet-refacing-vs-refinishing-vs-replacing"),
    alt: "Real completed Treasure Valley kitchen with warm white painted perimeter cabinets and a deep forest-green island, showing a refreshed cabinet update",
    topicTags: ["refacing", "refinishing", "kitchen"],
    source: "blog",
  },
  "kitchen-cabinet-organization-ideas": {
    hero: blog("kitchen-cabinet-organization-ideas"),
    alt: "Real completed Treasure Valley kitchen with base-cabinet drawers and pull-outs open showing organized interior storage in light white oak and white cabinets",
    topicTags: ["organization", "storage", "kitchen"],
    source: "blog",
  },
  "what-are-shaker-cabinets": {
    hero: blog("what-are-shaker-cabinets"),
    alt: "Real completed classic white Shaker kitchen in a Treasure Valley home with brushed-nickel hardware, subway tile, quartz counters, and a farmhouse sink",
    topicTags: ["shaker", "door styles", "kitchen"],
    source: "blog",
  },
  "how-to-paint-kitchen-cabinets": {
    hero: blog("how-to-paint-kitchen-cabinets"),
    alt: "Real completed freshly painted two-tone Treasure Valley kitchen with deep navy lower cabinets and warm white uppers, matte black hardware, and a smooth painted finish",
    topicTags: ["painting", "refinishing", "kitchen"],
    source: "blog",
  },
  "pantry-cabinet-ideas": {
    hero: blog("pantry-cabinet-ideas"),
    alt: "Real completed floor-to-ceiling walnut pantry cabinet in a Treasure Valley home with roll-out shelves and adjustable shelving stocked with everyday groceries",
    topicTags: ["pantry", "storage", "organization"],
    source: "blog",
  },
  "how-to-make-oak-cabinets-look-modern": {
    hero: blog("how-to-make-oak-cabinets-look-modern"),
    alt: "Real completed modern Treasure Valley kitchen with light natural white oak flat-panel cabinets, long matte-black bar pulls, and a white quartz waterfall counter",
    topicTags: ["oak", "modern", "kitchen"],
    source: "blog",
  },
  "best-wood-for-kitchen-cabinets": {
    hero: blog("best-wood-for-kitchen-cabinets"),
    alt: "Real completed warm traditional Treasure Valley kitchen with rich cherry and hickory stained solid-wood cabinets showing natural grain variation and oil-rubbed bronze hardware",
    topicTags: ["wood", "materials", "kitchen"],
    source: "blog",
  },
  "two-tone-kitchen-cabinets": {
    hero: blog("two-tone-kitchen-cabinets"),
    alt: "Real completed two-tone Treasure Valley kitchen with creamy off-white perimeter cabinets and a warm natural stained-wood island, brushed brass hardware, and pendant lights",
    topicTags: ["two-tone", "colors", "kitchen"],
    source: "blog",
  },
  "best-kitchen-cabinet-colors": {
    hero: blog("best-kitchen-cabinet-colors"),
    alt: "Real completed upscale Treasure Valley kitchen with deep navy-blue painted Shaker cabinets, brushed brass hardware, white marble-look quartz counters, and a large island",
    topicTags: ["colors", "navy", "kitchen"],
    source: "blog",
  },
  "sage-green-kitchen-cabinets": {
    hero: blog("sage-green-kitchen-cabinets"),
    alt: "Real completed Treasure Valley kitchen with soft muted sage green painted Shaker cabinets, aged brass hardware, white quartz counters, and a natural stone backsplash",
    topicTags: ["sage", "green", "kitchen"],
    source: "blog",
  },
  "home-office-built-ins": {
    hero: blog("home-office-built-ins"),
    alt: "Real completed custom home office built-in in a Treasure Valley home with a full wall of white oak and warm white cabinetry, a floating desk, and styled open shelving",
    topicTags: ["built-ins", "home office", "storage"],
    source: "blog",
  },
  "laundry-room-cabinet-ideas": {
    hero: blog("laundry-room-cabinet-ideas"),
    alt: "Real completed Treasure Valley laundry room with deep navy-blue Shaker cabinets, a folding counter over front-load machines, open uppers, a utility sink, and a hanging rod",
    topicTags: ["laundry", "built-ins", "storage"],
    source: "blog",
  },
  "how-to-plan-a-kitchen-cabinet-project": {
    hero: blog("how-to-plan-a-kitchen-cabinet-project"),
    alt: "Real completed transitional Treasure Valley kitchen blending warm white oak and crisp white cabinets with a large island, showing a functional work-triangle layout",
    topicTags: ["planning", "layout", "kitchen"],
    source: "blog",
  },
  "how-deep-are-kitchen-cabinets": {
    hero: blog("how-deep-are-kitchen-cabinets"),
    alt: "Real completed bright Treasure Valley kitchen with soft greige Shaker cabinets showing standard-depth base and upper cabinets along a wall with white quartz counters",
    topicTags: ["depth", "sizes", "kitchen"],
    source: "blog",
  },
  "mudroom-cabinets": {
    hero: blog("mudroom-cabinets"),
    alt: "Real completed custom mudroom built-in in a Treasure Valley home with white oak and sage-green lockers, open cubbies, coat hooks, and a bench with shoe storage",
    topicTags: ["mudroom", "built-ins", "storage"],
    source: "blog",
  },
  "how-to-clean-kitchen-cabinets": {
    hero: blog("how-to-clean-kitchen-cabinets"),
    alt: "Real completed warm traditional Treasure Valley kitchen with clean, well-kept honey-stained maple raised-panel cabinets, granite counters, and a tile backsplash",
    topicTags: ["cleaning", "maintenance", "kitchen"],
    source: "blog",
  },
  // —— Cabinet costs (8) ——
  "kitchen-cabinet-cost-boise": {
    hero: cs("kitchen-remodel", "boise"),
    alt: "Custom kitchen cabinets installed in a Boise home with warm finishes and quartz counters",
    topicTags: ["kitchen", "cost", "boise"],
    source: "city-service",
  },
  "bathroom-vanity-cost-boise": {
    hero: cs("bathroom-remodel", "boise"),
    alt: "Bathroom vanity cabinets in a Boise home with modern tile and coordinated storage",
    topicTags: ["bathroom", "cost", "boise"],
    source: "city-service",
  },
  "whole-home-cabinet-cost-boise": {
    hero: cs("whole-home-remodel", "boise"),
    alt: "Whole-home cabinet package with coordinated kitchen and living storage in Boise",
    topicTags: ["whole-home", "cost", "boise"],
    source: "city-service",
  },
  "luxury-custom-cabinet-cost-boise": {
    hero: cs("kitchen-remodel", "eagle"),
    alt: "Luxury custom kitchen cabinetry with premium finishes in an Eagle executive home",
    topicTags: ["luxury", "cost", "eagle"],
    source: "city-service",
  },
  "cabinet-cost-per-linear-foot": {
    hero: blog("cabinet-cost-per-linear-foot"),
    alt: "Real completed kitchen in a standard Treasure Valley family home with warm natural white oak cabinets, a crisp white perimeter, and black bar pulls",
    topicTags: ["cost", "kitchen", "boise"],
    source: "blog",
  },
  "what-impacts-cabinet-costs-boise": {
    hero: blog("what-impacts-cabinet-costs-boise"),
    alt: "Homeowner and designer comparing cabinet door samples beside an itemized cabinet estimate in a Treasure Valley kitchen",
    topicTags: ["cost", "planning", "process"],
    source: "blog",
  },
  "how-to-budget-cabinets-boise": {
    hero: "/images/marketing/hero-home.webp",
    alt: "Warm interior cabinetry illustrating thoughtful budgeting for a Boise cabinet project",
    topicTags: ["cost", "budget", "planning"],
    source: "services",
  },
  "stock-vs-custom-cabinets-boise": {
    hero: blog("stock-vs-custom-cabinets-boise"),
    alt: "Real completed custom Treasure Valley kitchen with floor-to-ceiling cream and off-white cabinets fitted precisely to a tall ceiling and around a window",
    topicTags: ["cost", "cabinets", "boise"],
    source: "blog",
  },

  // —— Kitchen cabinets (6) ——
  "kitchen-cabinet-timeline-boise": {
    hero: cs("kitchen-remodel", "meridian"),
    alt: "Kitchen cabinet installation in progress with boxes staged in a Meridian home",
    topicTags: ["kitchen", "timeline", "meridian"],
    source: "city-service",
  },
  "kitchen-layout-ideas-boise-homes": {
    hero: cs("kitchen-remodel", "nampa"),
    alt: "Efficient kitchen cabinet layout with clear work zones in a Nampa home",
    topicTags: ["kitchen", "layout", "nampa"],
    source: "city-service",
  },
  "kitchen-cabinet-trends": {
    hero: cs("kitchen-remodel", "kuna"),
    alt: "Modern kitchen cabinetry with warm wood tones in a Kuna home",
    topicTags: ["kitchen", "cabinets", "kuna"],
    source: "city-service",
  },
  "open-kitchen-cabinet-storage": {
    hero: blog("open-concept-kitchen-remodeling"),
    alt: "Open kitchen with upper and base cabinets tied to living space storage in Boise",
    topicTags: ["kitchen", "open-concept"],
    source: "blog",
    copyFrom: cs("kitchen-remodel", "star"),
  },
  "kitchen-island-design-guide": {
    hero: cs("kitchen-remodel", "middleton"),
    alt: "Large kitchen island cabinets with seating in a Middleton home",
    topicTags: ["kitchen", "island", "middleton"],
    source: "city-service",
  },
  "walk-in-pantry-design-guide": {
    hero: cs("kitchen-remodel", "caldwell"),
    alt: "Walk-in pantry cabinets with custom shelving in a Caldwell kitchen",
    topicTags: ["kitchen", "pantry", "caldwell"],
    source: "city-service",
  },

  // —— Bathroom vanities (4) ——
  "luxury-bathroom-vanity-guide": {
    hero: cs("bathroom-remodel", "eagle"),
    alt: "Luxury master bathroom vanity cabinets with premium finishes in Eagle",
    topicTags: ["bathroom", "luxury", "eagle"],
    source: "city-service",
  },
  "small-bathroom-vanity-ideas": {
    hero: cs("bathroom-remodel", "meridian"),
    alt: "Compact bathroom vanity cabinets maximizing storage and light in Meridian",
    topicTags: ["bathroom", "small", "meridian"],
    source: "city-service",
  },
  "accessible-bathroom-vanity-guide": {
    hero: cs("bathroom-remodel", "nampa"),
    alt: "Accessible bathroom vanity height and storage in a Nampa bath remodel",
    topicTags: ["bathroom", "aging-in-place", "nampa"],
    source: "city-service",
  },
  "bathroom-vanity-layout-guide": {
    hero: cs("bathroom-remodel", "kuna"),
    alt: "Bathroom vanity layout with optimized drawers and mirror placement in Kuna",
    topicTags: ["bathroom", "layout", "kuna"],
    source: "city-service",
  },

  // —— Built-ins & storage (3) ——
  "primary-suite-closet-cabinets": {
    hero: cat("closet"),
    alt: "Primary suite closet cabinetry with hanging zones and custom drawers in the Treasure Valley",
    topicTags: ["built-ins", "closet", "storage"],
    source: "services",
  },
  "garage-storage-cabinet-systems": {
    hero: cat("garage"),
    alt: "Garage storage cabinet systems with durable finishes for Boise-area homes",
    topicTags: ["built-ins", "garage", "storage"],
    source: "services",
  },
  "multi-room-cabinet-planning": {
    hero: cs("whole-home-remodel", "star"),
    alt: "Coordinated cabinet selections across multiple rooms in a Star-area home",
    topicTags: ["whole-home", "planning", "star"],
    source: "city-service",
  },

  // —— Outdoor cabinetry (3) ——
  "outdoor-kitchen-cabinets-boise": {
    hero: blog("outdoor-kitchens-boise"),
    alt: "Outdoor kitchen cabinets with built-in grill storage in a Boise backyard",
    topicTags: ["outdoor", "kitchen", "boise"],
    source: "blog",
    copyFrom: cat("outdoor"),
  },
  "outdoor-bar-cabinet-storage": {
    hero: blog("covered-patios-boise"),
    alt: "Outdoor bar cabinet storage under a covered patio in the Treasure Valley",
    topicTags: ["outdoor", "patio", "boise"],
    source: "blog",
    copyFrom: gal("outdoor-before"),
  },
  "premium-outdoor-cabinetry": {
    hero: cs("adu", "eagle"),
    alt: "Premium outdoor cabinetry adjacent to an Eagle home entertaining area",
    topicTags: ["outdoor", "luxury", "eagle"],
    source: "city-service",
  },

  // —— Whole-home cabinetry (7) ——
  "cabinet-project-planning-guide": {
    hero: cs("whole-home-remodel", "middleton"),
    alt: "Cabinet project planning session with layouts and finish samples in Middleton",
    topicTags: ["whole-home", "planning", "middleton"],
    source: "city-service",
  },
  "cabinet-buying-mistakes": {
    hero: cs("whole-home-remodel", "caldwell"),
    alt: "Quality whole-home cabinetry illustrating proper specification in Caldwell",
    topicTags: ["whole-home", "planning", "caldwell"],
    source: "city-service",
  },
  "whole-home-cabinet-timeline": {
    hero: cs("whole-home-remodel", "kuna"),
    alt: "Phased whole-home cabinet delivery and installation in a Kuna residence",
    topicTags: ["whole-home", "timeline", "kuna"],
    source: "city-service",
  },
  "living-through-cabinet-installation": {
    hero: gal("whole-home-before"),
    alt: "Home interior during cabinet installation with protected floors and staged boxes",
    topicTags: ["whole-home", "living-in-place"],
    source: "gallery",
  },
  "cabinet-refresh-vs-replace-vs-moving": {
    hero: gal("addition-after"),
    alt: "Refreshed cabinetry helping Treasure Valley homeowners stay in their neighborhood",
    topicTags: ["whole-home", "planning", "boise"],
    source: "gallery",
  },
  "custom-cabinet-design-process": {
    hero: blog("design-build-process-guide"),
    alt: "Custom cabinet design process from measure through shop drawings and approval",
    topicTags: ["whole-home", "design-build"],
    source: "blog",
    copyFrom: gal("addition-before"),
  },
  "cabinet-planning-checklist": {
    hero: cs("whole-home-remodel", "nampa"),
    alt: "Whole-home cabinet checklist review in a Nampa kitchen and bath package",
    topicTags: ["whole-home", "checklist", "nampa"],
    source: "city-service",
  },

  // —— Choosing a cabinet company (9) ——
  "questions-to-ask-cabinet-company": {
    hero: blog("questions-to-ask-remodeling-contractor"),
    alt: "Homeowner meeting with a cabinet company reviewing scope and line-item quote in Boise",
    topicTags: ["contractor", "consultation"],
    source: "blog",
    copyFrom: cs("adu", "boise"),
  },
  "cabinet-company-red-flags": {
    hero: blog("remodeling-contractor-red-flags"),
    alt: "Quality cabinet installation detail showing aligned doors and finished end panels",
    topicTags: ["contractor", "quality"],
    source: "blog",
    copyFrom: cs("room-addition", "boise"),
  },
  "what-makes-great-cabinet-company": {
    hero: svc("adu"),
    alt: "Precision cabinet shop craftsmanship demonstrating expert Treasure Valley work",
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
    alt: "Finished bathroom vanity illustrating scope differences between cabinet quotes",
    topicTags: ["contractor", "pricing"],
    source: "city-service",
  },
  "cabinet-consultation-process": {
    hero: cs("adu", "star"),
    alt: "In-home cabinet consultation with samples at a Star-area property",
    topicTags: ["contractor", "consultation"],
    source: "city-service",
  },
  "custom-cabinet-shop-vs-big-box": {
    hero: blog("design-build-vs-general-contractor"),
    alt: "Custom cabinet shop team reviewing shop drawings with Treasure Valley homeowners",
    topicTags: ["contractor", "design-build"],
    source: "blog",
    copyFrom: cs("room-addition", "kuna"),
  },
  "fixed-price-vs-cost-plus": {
    hero: gal("basement-before"),
    alt: "Cabinet scope documents laid out for fixed-price versus cost-plus comparison",
    topicTags: ["contractor", "pricing"],
    source: "gallery",
  },
  "cabinet-construction-quality-guide": {
    hero: blog("cabinet-construction-quality-guide"),
    alt: "Close-up of high-quality cabinet construction in a real completed kitchen: a natural maple dovetailed solid-wood drawer box on soft-close undermount glides",
    topicTags: ["cabinets", "quality", "guide"],
    source: "blog",
  },

  // —— Cabinet project process (8) ——
  "cabinet-finishes-door-styles-guide": {
    hero: blog("material-selection-guide"),
    alt: "Cabinet door style and finish samples for Treasure Valley selections",
    topicTags: ["process", "materials"],
    source: "blog",
    copyFrom: cat("mudroom"),
  },
  "cabinet-measurement-design-phase": {
    hero: gal("kitchen-before"),
    alt: "Field measure and layout verification before cabinet shop drawings are released",
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
    hero: cs("room-addition", "caldwell"),
    alt: "Cabinet delivery and installation phase with staged boxes on a Caldwell job site",
    topicTags: ["process", "construction"],
    source: "city-service",
  },
  "cabinet-installation-punch-list": {
    hero: blog("punch-list-guide"),
    alt: "Final cabinet installation punch list with adjusted doors and scribe fillers",
    topicTags: ["process", "punch-list"],
    source: "blog",
    copyFrom: cs("room-addition", "meridian"),
  },
  "cabinet-warranty-guide": {
    hero: gal("basement-after"),
    alt: "Completed cabinet installation detail showing warranty-worthy adjustment and finish",
    topicTags: ["process", "warranty"],
    source: "gallery",
  },
  "custom-vs-reserve-cabinets": {
    hero: cat("laundry"),
    alt: "Laundry room cabinets comparing Custom Cabinets and Reserve Collection specification levels",
    topicTags: ["cabinets", "collections", "planning"],
    source: "services",
  },
  "cabinet-door-styles-guide": {
    hero: blog("cabinet-door-styles-guide"),
    alt: "Real completed transitional Treasure Valley kitchen with classic Shaker cabinet doors in warm greige and cream paint and a natural stained wood island",
    topicTags: ["cabinets", "door-styles", "guide"],
    source: "blog",
  },

  // —— Cabinet ROI (6) ——
  "kitchen-cabinet-roi-boise": {
    hero: blog("kitchen-roi-remodeling"),
    alt: "Kitchen cabinet upgrade delivering strong resale context in Boise",
    topicTags: ["roi", "kitchen", "boise"],
    source: "blog",
    copyFrom: gal("kitchen-after"),
  },
  "bathroom-vanity-roi-boise": {
    hero: blog("bathroom-roi-remodeling"),
    alt: "Bathroom vanity cabinets improving home value in the Treasure Valley",
    topicTags: ["roi", "bathroom", "boise"],
    source: "blog",
    copyFrom: gal("bathroom-after"),
  },
  "built-in-storage-roi": {
    hero: cs("room-addition", "star"),
    alt: "Built-in storage cabinets increasing functional value in a Star-area home",
    topicTags: ["roi", "built-ins", "star"],
    source: "city-service",
  },
  "outdoor-cabinet-roi": {
    hero: blog("outdoor-living-roi"),
    alt: "Outdoor cabinetry supporting entertaining and curb appeal in Boise",
    topicTags: ["roi", "outdoor"],
    source: "blog",
    copyFrom: gal("outdoor-after"),
  },
  "cabinet-upgrades-before-selling": {
    hero: cs("bathroom-remodel", "caldwell"),
    alt: "Vanity cabinet refresh staged before listing a Treasure Valley home for sale",
    topicTags: ["roi", "selling", "bathroom"],
    source: "city-service",
  },
  "cabinets-for-long-term-living": {
    hero: cs("adu", "caldwell"),
    alt: "Accessible and durable cabinets planned for long-term living in Caldwell",
    topicTags: ["roi", "long-term", "caldwell"],
    source: "city-service",
  },

  // —— Cabinet specs & finishes (4) ——
  "cabinet-finishes-colors-guide": {
    hero: blog("cabinet-finishes-colors-guide"),
    alt: "Real completed two-tone Treasure Valley kitchen with creamy white upper cabinets and a rich stained walnut lower run and island showing cabinet finishes and colors",
    topicTags: ["cabinets", "finishes", "guide"],
    source: "blog",
  },
  "cabinet-hardware-guide": {
    hero: blog("cabinet-hardware-guide"),
    alt: "Real completed luxury bathroom vanity in a Treasure Valley home with a walnut double vanity, statement matte-black and brass hardware, and a marble-look quartz top",
    topicTags: ["cabinets", "hardware", "guide"],
    source: "blog",
  },

  // —— Guides (10) ——
  "boise-cabinet-cost-guide": {
    hero: gal("whole-home-after"),
    alt: "Treasure Valley cabinet cost planning guide with whole-home kitchen and bath context",
    topicTags: ["cost", "guide", "pillar"],
    source: "gallery",
  },
  "treasure-valley-cabinet-guide": {
    hero: area("boise"),
    alt: "Treasure Valley neighborhoods served by Boise Cabinet Co custom cabinetry",
    topicTags: ["location", "treasure-valley", "guide"],
    source: "areas",
  },
  "boise-cabinet-guide": {
    hero: blog("boise-remodeling-guide"),
    alt: "Boise homes and neighborhoods for custom kitchen, bath, and built-in cabinetry",
    topicTags: ["location", "boise", "guide"],
    source: "blog",
    copyFrom: area("meridian"),
  },
  "boise-kitchen-cabinet-guide": {
    hero: blog("boise-kitchen-cabinet-guide"),
    alt: "Custom white shaker kitchen cabinets with island and quartz counters in a bright Boise Idaho home",
    topicTags: ["kitchen", "guide", "pillar"],
    source: "blog",
  },
  "boise-bathroom-vanity-guide": {
    hero: cat("bathroom"),
    alt: "Boise bathroom vanity guide covering layouts, storage, and aging-in-place",
    topicTags: ["bathroom", "guide", "pillar"],
    source: "services",
  },
  "built-in-cabinet-guide": {
    hero: cat("built-ins"),
    alt: "Built-in and storage cabinet guide for mudroom, closet, and entertainment casework",
    topicTags: ["built-ins", "guide", "pillar"],
    source: "services",
  },
  "whole-home-cabinetry-guide": {
    hero: svc("whole-home-remodel"),
    alt: "Whole-home cabinetry guide for coordinated Treasure Valley cabinet packages",
    topicTags: ["whole-home", "guide", "pillar"],
    source: "services",
  },
  "choose-cabinet-company-boise": {
    hero: blog("choose-remodeling-contractor-boise"),
    alt: "Choosing a custom cabinet company in Boise and the Treasure Valley",
    topicTags: ["contractor", "guide", "pillar"],
    source: "blog",
  },
  "cabinet-project-process-guide": {
    hero: blog("boise-remodeling-process-guide"),
    alt: "Boise cabinet project process from consultation through installation and warranty",
    topicTags: ["process", "guide", "pillar"],
    source: "blog",
    copyFrom: gal("whole-home-before"),
  },
  "cabinet-roi-guide-boise": {
    hero: blog("best-remodeling-roi-boise"),
    alt: "Best cabinet upgrades for ROI in Boise and Treasure Valley homes",
    topicTags: ["roi", "guide", "pillar"],
    source: "blog",
    copyFrom: gal("kitchen-after"),
  },

  // —— City cabinet guides (7) ——
  "meridian-cabinet-guide": {
    hero: area("meridian"),
    alt: "Custom kitchen cabinets and storage for Meridian Idaho subdivision homes",
    topicTags: ["location", "meridian", "guide"],
    source: "areas",
  },
  "eagle-cabinet-guide": {
    hero: area("eagle"),
    alt: "Luxury custom cabinets and built-ins for Eagle Idaho estate homes",
    topicTags: ["location", "eagle", "guide"],
    source: "areas",
  },
  "nampa-cabinet-guide": {
    hero: area("nampa"),
    alt: "Custom kitchen cabinets and vanities for Nampa Idaho homes in Canyon County",
    topicTags: ["location", "nampa", "guide"],
    source: "areas",
  },
  "kuna-cabinet-guide": {
    hero: area("kuna"),
    alt: "Custom kitchen and garage storage cabinets for Kuna Idaho family homes",
    topicTags: ["location", "kuna", "guide"],
    source: "areas",
  },
  "star-cabinet-guide": {
    hero: area("star"),
    alt: "Custom cabinets and walk-in pantries for Star Idaho new builds and acreage homes",
    topicTags: ["location", "star", "guide"],
    source: "areas",
  },
  "caldwell-cabinet-guide": {
    hero: area("caldwell"),
    alt: "Custom kitchen cabinets for historic and new Caldwell Idaho homes",
    topicTags: ["location", "caldwell", "guide"],
    source: "areas",
  },
  "middleton-cabinet-guide": {
    hero: area("middleton"),
    alt: "Custom cabinets, mudrooms, and shop storage for Middleton Idaho acreage properties",
    topicTags: ["location", "middleton", "guide"],
    source: "areas",
  },
};

const HUB_HEROES = {
  "cabinet-costs": gal("whole-home-after"),
  "kitchen-cabinets": cat("kitchen"),
  "bathroom-vanities": cat("bathroom"),
  "built-ins-storage": cat("built-ins"),
  "whole-home-cabinetry": svc("whole-home-remodel"),
  "choosing-cabinet-company": blog("choose-remodeling-contractor-boise"),
  "cabinet-project-process": blog("boise-remodeling-process-guide"),
  "cabinet-roi": blog("best-remodeling-roi-boise"),
  "local-guides": area("boise"),
};

const GUIDE_START = "boise-cabinet-cost-guide";
const blogSlugsFromEntries = Object.keys(ENTRIES).slice(0, Object.keys(ENTRIES).indexOf(GUIDE_START));
const EXPECTED_BLOG = 77;
const EXPECTED_GUIDES = 17;

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
    console.error(
      `Duplicate effective image for blog posts: ${eff} used by ${blogEffectivePaths.get(eff)} and ${slug}`,
    );
    process.exit(1);
  }
  blogEffectivePaths.set(eff, slug);
}

const heroPaths = new Map();
for (const [slug, entry] of Object.entries(ENTRIES)) {
  if (heroPaths.has(entry.hero)) {
    console.error(`Duplicate hero: ${entry.hero} used by ${heroPaths.get(entry.hero)} and ${slug}`);
    process.exit(1);
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
