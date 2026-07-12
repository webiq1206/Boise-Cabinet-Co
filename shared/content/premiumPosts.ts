/**
 * Premium, long-form blog posts (1,600+ words) authored to the full
 * SEO/AEO/GEO bar: Answer-First, rich HTML (tables, checklists, sage callouts),
 * FAQ blocks, deep internal linking, and unique AI-photorealistic hero images.
 *
 * These are full BlogPostData objects (not factory-generated cluster posts).
 * Spread into ALL_BLOG_POSTS. When a slug here matches a legacy factory post,
 * remove the legacy entry so there is exactly one post per slug.
 */
import type { BlogPostData } from '../blogContent';

const AUTHOR = 'Boise Cabinet Co';

/** Sage key-takeaway callout (styled by `.blog-content .summary-block`). */
const framedVsFramelessContent = `
<p class="text-lg"><strong>Framed cabinets</strong> have a face frame (a border of solid wood) across the front of the box; <strong>frameless cabinets</strong>, also called European or full-access cabinets, skip the frame so doors mount directly to the box. The practical result: frameless gives you wider drawers, easier reach, and a cleaner modern look, while framed offers a classic profile and slightly more racking rigidity. For most Treasure Valley kitchens that want maximum storage and a contemporary feel, frameless wins.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Frameless = ~10–15% more usable space, full drawer access, and seamless modern lines. Framed = traditional face-frame look and a familiar repair path. Build quality (box material, drawer boxes, hinges) matters more than the frame debate itself. <a href="/estimate">Get a planning range</a> in about a minute.</p>
</div>

<h2 id="what-are-framed-cabinets">What are framed cabinets?</h2>
<p>A framed cabinet has a <strong>face frame</strong>, usually 1.5-inch-wide solid hardwood, attached to the front edges of the cabinet box. Doors and drawer fronts attach to that frame. This is the traditional American construction method, and it is what most big-box and stock lines still use.</p>
<p>Because the frame adds a rigid border, framed boxes tolerate out-of-square walls well and give installers a solid surface to shim and fasten against. The trade-off is that the frame narrows the opening, so drawers and pull-outs are a little smaller than the full box width, and you get a center stile on many double-door cabinets that can interrupt access.</p>
<h3>Overlay options on framed cabinets</h3>
<ul>
  <li><strong>Standard (partial) overlay:</strong> doors cover part of the frame; you see a border of frame around each door. Most budget-friendly.</li>
  <li><strong>Full overlay:</strong> doors cover nearly all of the frame for a near-frameless look while keeping framed construction.</li>
  <li><strong>Inset:</strong> doors sit flush inside the frame for a furniture-grade, traditional aesthetic (and a higher price).</li>
</ul>

<h2 id="what-are-frameless-cabinets">What are frameless (European) cabinets?</h2>
<p>Frameless cabinets, the style <a href="/construction">we build</a> at ${AUTHOR}, omit the face frame entirely. The box is engineered from thicker panels (typically 3/4-inch), and doors mount to the sides of the box with concealed, adjustable hinges. This is why you will also hear the terms <strong>European cabinets</strong>, <strong>full-access cabinets</strong>, or <strong>frameless construction</strong>.</p>
<p>Without a frame stealing an inch and a half on each side, the entire box opening is usable. Drawers run nearly wall-to-wall, roll-outs are wider, and there is no center stile blocking a double-door cabinet. The look is clean and contemporary, which pairs naturally with slab and <a href="/door-styles">Shaker door styles</a> and the flat, seamless runs homeowners want in a modern kitchen.</p>

<blockquote>Frameless construction typically returns 10–15% more usable cabinet space than a comparable framed layout, most noticeable in drawer banks and corner cabinets.</blockquote>

<h2 id="framed-vs-frameless-comparison">Framed vs frameless: side-by-side comparison</h2>
<table>
  <thead>
    <tr><th>Factor</th><th>Framed cabinets</th><th>Frameless (European)</th></tr>
  </thead>
  <tbody>
    <tr><td>Usable interior space</td><td>Good (frame narrows openings)</td><td>Best (full box width)</td></tr>
    <tr><td>Drawer &amp; roll-out width</td><td>Narrower</td><td>Wider, near full-width</td></tr>
    <tr><td>Look</td><td>Traditional, transitional</td><td>Clean, modern, seamless</td></tr>
    <tr><td>Door overlay options</td><td>Partial, full, or inset</td><td>Full overlay (standard)</td></tr>
    <tr><td>Structural rigidity</td><td>Frame adds racking strength</td><td>Thicker box panels compensate</td></tr>
    <tr><td>Install on out-of-square walls</td><td>Very forgiving</td><td>Forgiving with quality install</td></tr>
    <tr><td>Typical cost</td><td>$ – $$</td><td>$$ – $$$ (build-dependent)</td></tr>
    <tr><td>Best for</td><td>Classic, farmhouse, traditional homes</td><td>Modern, transitional, storage-first kitchens</td></tr>
  </tbody>
</table>

<h2 id="pros-and-cons">Pros and cons at a glance</h2>
<h3>Frameless pros</h3>
<ul>
  <li>Maximum usable space and full-access drawers</li>
  <li>Clean, modern, seamless sightlines across a run</li>
  <li>No center stile blocking double-door cabinets</li>
  <li>Easier to reach the back of base cabinets</li>
</ul>
<h3>Frameless considerations</h3>
<ul>
  <li>Requires precise fabrication and installation to look its best</li>
  <li>Often a higher entry price than stock framed lines</li>
</ul>
<h3>Framed pros</h3>
<ul>
  <li>Familiar traditional look, especially with inset doors</li>
  <li>Very forgiving on older, out-of-square Treasure Valley homes</li>
  <li>Widely available at every price point</li>
</ul>
<h3>Framed considerations</h3>
<ul>
  <li>Frame reduces interior width and drawer capacity</li>
  <li>Center stiles can interrupt access on some cabinets</li>
</ul>

<h2 id="which-is-right-for-you">Which is right for your kitchen?</h2>
<p>The frame debate matters less than most homeowners expect, what actually drives daily satisfaction is box material, drawer-box construction, and hinge quality. That said, use this quick checklist to point yourself in the right direction:</p>
<ul>
  <li>☐ You want the most storage possible from the same footprint → <strong>frameless</strong></li>
  <li>☐ You love a clean, modern or transitional look → <strong>frameless</strong></li>
  <li>☐ You are matching a historic or farmhouse aesthetic with inset doors → <strong>framed</strong></li>
  <li>☐ You want wide, full-extension drawers in the base run → <strong>frameless</strong></li>
  <li>☐ You are on the tightest possible budget with stock cabinets → <strong>framed</strong></li>
</ul>
<div class="summary-block">
  <p><strong>Our take:</strong> For new custom kitchens in Boise, Meridian, and across the Treasure Valley, we build frameless because homeowners consistently value the extra space and modern lines, without giving up durability. See how we engineer our boxes on the <a href="/construction">construction page</a>.</p>
</div>

<h2 id="storage-math">The storage math: what 10–15% really means</h2>
<p>On a typical 12-foot base run, switching from framed to frameless can add several inches of usable width per cabinet. In day-to-day terms that is room for an extra stack of dinner plates, a wider utensil drawer, or a deep pot drawer that actually fits your stockpot. In corner cabinets, frameless openings make blind-corner pull-outs and lazy Susans easier to load and reach because there is no frame lip to fight. For families who cook every day, that reclaimed space is often the difference between a kitchen that feels cramped and one that finally works, without changing your footprint or moving a single wall.</p>

<h2 id="cabinet-quality">What actually determines cabinet quality</h2>
<p>Homeowners often fixate on framed versus frameless when the features that decide how a kitchen holds up over 15 to 20 years live elsewhere. Before you sign a quote, look past the frame and compare these four things:</p>
<ul>
  <li><strong>Box material:</strong> furniture-grade plywood resists moisture and holds screws better than particleboard or thin MDF, which matters through Idaho's dry winters and swingy shoulder seasons.</li>
  <li><strong>Drawer boxes:</strong> solid-wood, dovetailed drawer boxes on full-extension, soft-close undermount glides outlast stapled particleboard drawers by years.</li>
  <li><strong>Hinges:</strong> six-way adjustable, soft-close concealed hinges keep doors aligned and quiet and make future adjustments painless.</li>
  <li><strong>Joinery and back panels:</strong> dowel or dado joinery and a full 3/4-inch back panel keep boxes square and let installers anchor securely into studs.</li>
</ul>
<div class="summary-block">
  <p><strong>Pro tip:</strong> When comparing two quotes, ask for the box material, drawer-box construction, and hinge brand <em>in writing</em>. Those three lines predict long-term satisfaction far better than whether a cabinet has a face frame. Our <a href="/construction">construction standards</a> spell all of this out before fabrication.</p>
</div>

<h2 id="frameless-myths">Common myths about frameless cabinets, debunked</h2>
<p>A few persistent myths steer homeowners away from frameless for the wrong reasons. Here is what is actually true:</p>
<ul>
  <li><strong>Myth: frameless is less sturdy.</strong> Reality: frameless boxes use thicker panels and rigid joinery to replace the frame's strength, so a quality frameless cabinet is every bit as durable.</li>
  <li><strong>Myth: frameless only works in ultra-modern kitchens.</strong> Reality: with a <a href="/door-styles">Shaker door</a> and the right finish, frameless reads transitional or even classic while still giving you full access.</li>
  <li><strong>Myth: frameless is always more expensive.</strong> Reality: price is driven by materials, finish, and accessories; a mid-range frameless kitchen can land near a comparable framed one.</li>
  <li><strong>Myth: frameless is hard to install in old homes.</strong> Reality: an experienced installer scribes and shims frameless cabinets cleanly, even in century-old Boise bungalows with out-of-square walls.</li>
</ul>

<h2 id="cost-differences">Cost differences</h2>
<p>Frameless and framed can overlap heavily in price; the bigger cost drivers are materials, finish, hardware, and layout complexity, not the frame alone. Entry-level stock cabinets (usually framed) are the cheapest, while custom frameless with premium finishes and accessories sits at the higher end. For a detailed breakdown of what moves the number in our market, see our <a href="/guides/boise-cabinet-cost-guide">Boise cabinet cost guide</a>, and read <a href="/blog/stock-vs-custom-cabinets-boise">stock vs custom cabinets</a> if you are weighing lines.</p>
<p>Industry resources like the <a href="https://nkba.org" target="_blank" rel="noopener noreferrer">National Kitchen &amp; Bath Association (NKBA)</a> and <a href="https://www.forbes.com/home-improvement/kitchen/" target="_blank" rel="noopener noreferrer">Forbes Home</a> track national remodeling costs, but local labor, delivery, and finish availability shift the real Treasure Valley range, which is exactly what your in-home consultation confirms.</p>

<h2 id="treasure-valley-homes">Frameless cabinets in older vs newer Treasure Valley homes</h2>
<p>Boise's North End and older Nampa and Caldwell neighborhoods are full of charming homes with walls that are anything but plumb. Frameless cabinets install beautifully in these spaces when the crew scribes fillers and levels the run properly, and you still gain the full-access storage that older, smaller kitchens badly need. In newer construction across Meridian, Eagle, Star, and Kuna, frameless is the natural match for the open-concept, clean-line kitchens builders and buyers want today. Either way, the deciding factor is a careful measure and a written plan, not the age of the house.</p>

<h2 id="how-to-decide">How to decide in 5 steps</h2>
<ol>
  <li><strong>Define your look.</strong> Modern or transitional leans frameless; classic and historic can go either way, with inset framed as the premium traditional option.</li>
  <li><strong>Prioritize storage.</strong> If you cook often or have a small kitchen, the extra frameless capacity pays off every single day.</li>
  <li><strong>Set a realistic budget.</strong> Decide door style, finish, and accessories first; those move the price more than the frame.</li>
  <li><strong>Vet construction.</strong> Compare box material, drawer boxes, and hinges across quotes, in writing.</li>
  <li><strong>Get a measured plan.</strong> A free in-home consultation turns your space and wish list into an accurate scope and planning range.</li>
</ol>
<p>Want a shortcut? Try our <a href="/finder">style finder</a> to narrow door styles and finishes, then send your favorites along with your <a href="/estimate">estimate request</a>.</p>

<h2 id="how-we-build">How we build frameless cabinets in the Treasure Valley</h2>
<p>${AUTHOR} designs, builds, and installs frameless custom cabinets for <a href="/cabinets/kitchen">kitchens</a>, <a href="/cabinets/bathroom">bathrooms</a>, and built-ins throughout Boise, Meridian, Eagle, and Nampa. Every project starts with a free in-home design consultation and a written scope before fabrication, so what you approve is what we build. Explore <a href="/door-styles">door styles</a>, <a href="/finishes">finishes</a>, and <a href="/hardware">hardware</a> to see how the frameless look comes together, then browse the full <a href="/cabinets">cabinet catalog</a>.</p>
<p>Ready to price your project? <a href="/estimate">Get an instant planning range</a> or <a href="/contact">schedule your free consultation</a> and we will reach out within one business day.</p>
`;

const cabinetDoorStylesContent = `
<p class="text-lg">The most popular cabinet door styles are <strong>Shaker</strong> (a clean recessed-panel frame), <strong>slab/flat-panel</strong> (a single flat surface, very modern), and <strong>raised-panel</strong> (a traditional profile with a contoured center). Shaker is the most versatile and works in nearly every Treasure Valley home; slab reads contemporary; raised-panel suits classic and formal kitchens. Your door style sets the entire personality of the kitchen, so choose it before finishes and hardware.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Shaker is the safe, timeless default. Slab is best for modern, minimalist looks. Raised-panel leans traditional. Match the profile to your home's era, then coordinate the same style across kitchen, bath, and built-ins. <a href="/door-styles">Browse our door styles</a> or <a href="/estimate">get a planning range</a>.</p>
</div>

<h2 id="what-are-door-styles">What is a cabinet door style?</h2>
<p>A cabinet door style is the design of the door and drawer front — the part you see and touch. It is defined by the <strong>panel</strong> (the center of the door) and the <strong>frame</strong> (the border around it, if any). Because doors and drawer fronts cover most of a kitchen's visible surface, the door style is the single biggest driver of how a kitchen feels, more than the countertop or the backsplash.</p>
<p>Before the individual styles, one quick concept: <strong>overlay</strong>. This is how much of the cabinet box the door covers. Full overlay (doors nearly touching) reads modern and is standard on our frameless cabinets; partial overlay shows a frame border; inset sets the door flush inside the frame for a furniture-grade look. See <a href="/blog/framed-vs-frameless-cabinets">framed vs frameless cabinets</a> for how overlay and construction relate.</p>

<h2 id="shaker">Shaker doors</h2>
<p>Shaker is a five-piece door with a flat recessed center panel and a simple square frame. It is the most requested style in Boise and across the country because it bridges styles effortlessly — paint it white for a farmhouse kitchen, sage green for a transitional space, or dark charcoal for something moody and modern. Clean lines, easy to wipe down, and it never looks dated.</p>
<h3>Best for</h3>
<ul>
  <li>Homeowners who want a timeless look that resists trends</li>
  <li>Transitional kitchens that blend modern and traditional</li>
  <li>Resale-minded projects (broadest buyer appeal)</li>
</ul>

<h2 id="slab">Slab (flat-panel) doors</h2>
<p>A slab door is a single, flat, unbroken surface with no frame or panel detail. It is the definition of modern and minimalist, and it shines in <a href="/blog/framed-vs-frameless-cabinets">frameless</a> layouts with long, seamless runs. Slab doors show off the material — a dramatic wood grain, a rich painted color, or a matte finish — because there is no profile to distract from it.</p>
<h3>Best for</h3>
<ul>
  <li>Modern and contemporary homes</li>
  <li>Handleless or push-to-open designs</li>
  <li>Showcasing a bold finish or wood grain</li>
</ul>
<p>One note: flat surfaces show fingerprints more on very dark or high-gloss finishes, so consider a matte or satin sheen. See our <a href="/finishes">finish options</a>.</p>

<h2 id="raised-panel">Raised-panel doors</h2>
<p>A raised-panel door has a center panel that is contoured or "raised" above the frame, often with a decorative edge profile. It is the most traditional of the common styles and brings warmth and formality — think classic maple or cherry kitchens. In the right home it feels rich and established; in a minimalist space it can feel busy, so match it to your architecture.</p>
<h3>Best for</h3>
<ul>
  <li>Traditional, formal, and classic homes</li>
  <li>Stained wood finishes that highlight grain</li>
  <li>Homeowners who love detail and warmth</li>
</ul>

<h2 id="other-styles">Beadboard, inset, and glass-front options</h2>
<p>Beyond the big three, a few specialty looks add character:</p>
<ul>
  <li><strong>Beadboard:</strong> vertical grooves in the panel for a cottage or coastal feel.</li>
  <li><strong>Inset:</strong> not a panel style but a construction choice — doors sit flush inside the frame for a premium, furniture-grade result (and a higher price).</li>
  <li><strong>Glass-front:</strong> a frame with a glass insert for display cabinets; plan the cabinet interior and lighting since the inside is visible.</li>
</ul>

<h2 id="comparison">Door styles compared</h2>
<table>
  <thead>
    <tr><th>Style</th><th>Look</th><th>Best home</th><th>Upkeep</th></tr>
  </thead>
  <tbody>
    <tr><td>Shaker</td><td>Clean, versatile</td><td>Almost any</td><td>Easy</td></tr>
    <tr><td>Slab / flat</td><td>Modern, minimal</td><td>Contemporary</td><td>Easy (mind fingerprints on dark)</td></tr>
    <tr><td>Raised-panel</td><td>Traditional, warm</td><td>Classic / formal</td><td>More detail to dust</td></tr>
    <tr><td>Beadboard</td><td>Cottage, coastal</td><td>Casual / farmhouse</td><td>Grooves collect dust</td></tr>
    <tr><td>Inset</td><td>Furniture-grade</td><td>Premium builds</td><td>Easy; seasonal wood movement</td></tr>
  </tbody>
</table>

<h2 id="how-to-choose">How to choose your door style</h2>
<ul>
  <li>☐ Start with your home's architecture — match the era and vibe</li>
  <li>☐ Decide modern (slab), transitional (Shaker), or traditional (raised-panel)</li>
  <li>☐ Pick one style and carry it across kitchen, bath, laundry, and built-ins for cohesion</li>
  <li>☐ Order a door sample and view it in your actual kitchen light before committing</li>
  <li>☐ Coordinate hardware to the style — see our <a href="/blog/cabinet-hardware-guide">cabinet hardware guide</a></li>
</ul>
<div class="summary-block">
  <p><strong>Designer tip:</strong> When in doubt, choose Shaker. It is the highest-resale, lowest-regret door style, and finish and hardware do the work of making it modern, classic, or farmhouse. Homeowners across Boise, Meridian, and Eagle choose it for exactly that flexibility.</p>
</div>

<h2 id="by-home-type">Choosing a door style by home type</h2>
<p>Treasure Valley neighborhoods span a wide range of architecture, and the most cohesive kitchens echo the home. A quick guide:</p>
<ul>
  <li><strong>Modern / contemporary (new builds in Meridian, Eagle, Kuna):</strong> slab or flat Shaker in a matte finish, full-overlay, minimal hardware.</li>
  <li><strong>Transitional (the majority of homes):</strong> Shaker in white, greige, or sage green — safe, current, and flexible.</li>
  <li><strong>Farmhouse / cottage:</strong> Shaker or beadboard, often two-tone, with cup pulls and a stained-wood island.</li>
  <li><strong>Traditional / classic (established Boise neighborhoods):</strong> raised-panel or inset in a warm stain or creamy paint.</li>
  <li><strong>Craftsman / bungalow (North End):</strong> flat-panel Shaker with visible quarter-sawn oak grain honors the era.</li>
</ul>
<p>Matching the door to the home is the difference between a kitchen that looks "installed" and one that looks like it belongs. When in doubt, our designers walk your space and recommend a profile that fits the architecture and your taste.</p>

<h2 id="mistakes">Common door style mistakes to avoid</h2>
<p>A few pitfalls we help homeowners sidestep:</p>
<ul>
  <li><strong>Chasing a trend that fights the house.</strong> A high-gloss ultra-modern slab in a traditional home rarely ages well. Let the architecture lead.</li>
  <li><strong>Mixing too many profiles.</strong> One door style across the kitchen, bath, and built-ins reads intentional; three competing styles read chaotic.</li>
  <li><strong>Choosing intricate profiles you will not want to clean.</strong> Deeply grooved raised panels and beadboard collect dust and grease near the range — beautiful, but budget the upkeep.</li>
  <li><strong>Deciding from a screen.</strong> Monitors distort color and depth. Always evaluate a physical door sample in your own kitchen light.</li>
  <li><strong>Forgetting the drawers.</strong> On a drawer-heavy base run, a slab or flat drawer front often looks cleaner than a five-piece panel, even in a Shaker kitchen.</li>
</ul>

<h2 id="maintenance">Door style and everyday maintenance</h2>
<p>Flat and Shaker doors are the easiest to keep clean — a quick wipe with a soft, damp cloth handles daily life. Raised-panel and beadboard doors have more surface detail where dust and cooking residue gather, so they reward a slightly more regular wipe-down, especially on cabinets flanking the cooktop. Whatever the profile, skip abrasive pads and harsh degreasers, which dull the finish over time; mild soap and water protect the look for the long run.</p>

<h2 id="cost">Do door styles change the price?</h2>
<p>Yes, but usually less than finishes and construction. Slab and Shaker are typically the most cost-effective; raised-panel, inset, and glass-front add cost for the extra machining and fitting. The finish (paint vs specialty stain) and the box construction move the budget more. For the full picture in our market, see the <a href="/guides/boise-cabinet-cost-guide">Boise cabinet cost guide</a> and <a href="/blog/cabinet-cost-per-linear-foot">cost per linear foot</a>.</p>

<h2 id="combinations">Door style, finish, and hardware combinations that work</h2>
<p>A door style is only one leg of the stool — the finish and hardware complete the look. A few designer-tested recipes our Treasure Valley clients love:</p>
<ul>
  <li><strong>Timeless transitional:</strong> white Shaker doors + satin nickel bar pulls + a warm quartz counter. Bright, flexible, and endlessly resellable.</li>
  <li><strong>Warm modern:</strong> sage-green slab lowers + white oak uppers + matte-black edge pulls. Calm, current, and full of natural warmth.</li>
  <li><strong>Modern farmhouse:</strong> two-tone Shaker (white uppers, greige lowers) + cup pulls and knobs + a stained-wood island.</li>
  <li><strong>Classic and rich:</strong> raised-panel cherry with a light glaze + aged-brass knobs — formal and established.</li>
  <li><strong>Minimalist contemporary:</strong> handleless slab in a matte painted color + integrated pulls, for uninterrupted lines.</li>
</ul>
<p>Coordinate all three elements early in design so they read as one intentional package. Explore combinations across our <a href="/door-styles">door styles</a>, <a href="/finishes">finishes</a>, and <a href="/hardware">hardware</a>.</p>

<h2 id="resale">Door style and resale value</h2>
<p>If resale is on your mind, favor the broadly loved over the highly personal. Shaker doors in a light, neutral paint appeal to the widest pool of buyers and photograph well in listings, which is why they are the safest choice for a home you may sell within a decade. Bold, era-specific profiles and dramatic colors can absolutely be the right call for your forever home — just know they narrow the audience. A middle path many homeowners take: a timeless door and finish on the perimeter, with personality expressed through an island color, hardware, and decor that a future owner can easily change.</p>

<h2 id="bottom-line">The bottom line on door styles</h2>
<p>Your cabinet door style is the most visible decision in the entire kitchen, and it quietly shapes every choice that follows — the finish that looks right on it, the hardware that suits it, even the countertop that complements it. That is why we start here. If you take one thing away, let it be this: choose a profile that fits your home and your daily life, then let finish and hardware express your personality. A Shaker kitchen in Meridian and a slab kitchen in downtown Boise can both be exactly right, because each honors its home. When you are ready to see and feel the options, we bring real door samples to your kitchen so the decision is easy and confident, not guesswork from a screen.</p>

<h2 id="how-we-build">Explore door styles with Boise Cabinet Co</h2>
<p>${AUTHOR} builds custom cabinets in every major door style for <a href="/cabinets/kitchen">kitchens</a>, <a href="/cabinets/bathroom">bathrooms</a>, and built-ins across Boise, Meridian, Eagle, and Nampa. Browse <a href="/door-styles">door styles</a> and <a href="/finishes">finishes</a> side by side, then <a href="/estimate">get an instant planning range</a> or <a href="/contact">book a free design consultation</a> and we will bring samples to your home.</p>
`;

const cabinetHardwareContent = `
<p class="text-lg">Cabinet hardware is the jewelry of a kitchen: <strong>knobs</strong> (single-point round or shaped pulls) generally go on doors, and <strong>bar or cup pulls</strong> go on drawers, though many designers now use pulls everywhere for a consistent, easy-to-grip look. Choose a finish that coordinates (not necessarily matches) your faucet and lighting, and size pulls to roughly one-third the width of the drawer front. Hardware is usually just 3–5% of a cabinet budget but defines how the kitchen feels every day.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Pulls on drawers, knobs or pulls on doors. Match hardware finish across the room; coordinate (don't perfectly match) with plumbing fixtures. Soft-close is standard on quality cabinets. Buy a few extras for future repairs. <a href="/hardware">See hardware options</a> or <a href="/estimate">plan your project</a>.</p>
</div>

<h2 id="knobs-vs-pulls">Knobs vs pulls: which goes where?</h2>
<p>The classic rule: <strong>knobs on doors, pulls on drawers</strong>. It works because drawers are heavier and a horizontal pull gives you a better grip. That said, the modern move is <strong>pulls everywhere</strong> — consistent, comfortable, and clean. Both are correct; it comes down to your look:</p>
<ul>
  <li><strong>Knobs on doors + pulls on drawers:</strong> classic, a little more traditional, slightly lower cost.</li>
  <li><strong>Pulls on everything:</strong> modern, cohesive, easiest to grab with full hands.</li>
  <li><strong>Cup (bin) pulls on drawers + knobs on doors:</strong> farmhouse and traditional charm.</li>
</ul>

<h2 id="sizing">How to size cabinet hardware</h2>
<p>Sizing is where kitchens look "off" when it's wrong. A good rule: the pull length should be about <strong>one-third the width of the drawer front</strong>. Small drawers take 3–4 inch pulls; wide drawers look best with long 8–12 inch pulls (or two pulls on very wide fronts). For knobs, 1.25–1.5 inch diameters suit most doors.</p>
<table>
  <thead>
    <tr><th>Cabinet part</th><th>Typical hardware</th><th>Size guide</th></tr>
  </thead>
  <tbody>
    <tr><td>Standard door</td><td>Knob or 4" pull</td><td>1.25–1.5" knob</td></tr>
    <tr><td>Small drawer</td><td>Pull</td><td>3–4"</td></tr>
    <tr><td>Wide drawer</td><td>Pull (or two)</td><td>8–12"+</td></tr>
    <tr><td>Appliance panel</td><td>Long bar pull</td><td>12–18"</td></tr>
  </tbody>
</table>

<h2 id="placement">Where to place hardware</h2>
<p>Consistency is everything. Standard placement:</p>
<ul>
  <li><strong>Door knobs/pulls:</strong> on the stile opposite the hinge, near the top corner for lower cabinets and the bottom corner for uppers.</li>
  <li><strong>Drawer pulls:</strong> centered horizontally, centered vertically on the front (or slightly high on tall drawers).</li>
  <li>Use a simple template so every piece lands in the same spot — small inconsistencies are very visible.</li>
</ul>

<h2 id="finishes">Choosing a hardware finish</h2>
<p>The big finishes and the feel they give:</p>
<ul>
  <li><strong>Brushed/satin nickel:</strong> warm, forgiving, hides fingerprints — the safe all-rounder.</li>
  <li><strong>Matte black:</strong> modern, high-contrast, on-trend; pops on white and <a href="/finishes">sage-green cabinets</a>.</li>
  <li><strong>Brass/champagne bronze:</strong> warm and elevated for transitional and classic kitchens.</li>
  <li><strong>Polished chrome:</strong> crisp and traditional, but shows spots.</li>
</ul>
<div class="summary-block">
  <p><strong>Designer tip:</strong> Coordinate, don't perfectly match. Your hardware, faucet, and lighting should share a temperature (all warm or all cool) but they don't need to be identical metals. A matte-black faucet with brushed-nickel pulls can look intentional and layered.</p>
</div>

<h2 id="match-door-style">Match hardware to your door style</h2>
<p>Hardware should echo your <a href="/blog/cabinet-door-styles-guide">door style</a>: simple bar pulls suit Shaker and slab doors; cup pulls and ornate knobs flatter raised-panel and traditional doors. When you order door samples, hold your hardware choices against them in your kitchen's light before finalizing.</p>

<h2 id="handleless">Handleless and integrated options</h2>
<p>Not every kitchen needs visible hardware. Several modern approaches remove or hide it entirely for a seamless look that pairs beautifully with <a href="/blog/framed-vs-frameless-cabinets">frameless slab</a> cabinets:</p>
<ul>
  <li><strong>Edge / finger pulls:</strong> a routed channel or a slim pull along the top edge of the door and drawer — clean and easy to grab.</li>
  <li><strong>Integrated (J-pull) profiles:</strong> the door itself is shaped to create a grip, so there is no separate piece.</li>
  <li><strong>Push-to-open:</strong> a light press releases the door or drawer; ideal for a truly hardware-free front, though it needs quality mechanisms to feel right.</li>
</ul>
<p>Handleless looks stunning in photos, but consider daily life: kids, messy hands, and heavy drawers. Many Treasure Valley families choose a hybrid — handleless on uppers, discreet pulls on the hardest-working base drawers.</p>

<h2 id="mixing-metals">Mixing metals the right way</h2>
<p>Mixing finishes is not only allowed, it is what makes a kitchen look designed rather than ordered from a catalog. The trick is a little structure:</p>
<ul>
  <li><strong>Pick a dominant metal</strong> for the cabinet hardware (say, brushed nickel or matte black).</li>
  <li><strong>Let the faucet or lighting be the accent</strong> in a second finish, ideally sharing a temperature (warm-with-warm, cool-with-cool).</li>
  <li><strong>Repeat each metal at least twice</strong> so it looks intentional — for example, matte-black pulls echoed in the pendant lights.</li>
</ul>
<p>A warm brass faucet over a sink with matte-black cabinet pulls and black pendants is a classic, layered combination that photographs and lives beautifully.</p>

<h2 id="trends">Cabinet hardware trends</h2>
<p>What is moving in Treasure Valley kitchens right now:</p>
<ul>
  <li><strong>Matte black</strong> remains the leading modern choice, especially on white and <a href="/finishes">sage-green cabinets</a>.</li>
  <li><strong>Warm metals</strong> — champagne bronze, aged brass, and unlacquered brass that patinas over time — are rising for transitional and classic kitchens.</li>
  <li><strong>Longer pulls</strong>, including full-height appliance and pantry pulls, for a bold, architectural line.</li>
  <li><strong>Mixed metals</strong> as a deliberate design choice rather than an accident.</li>
  <li><strong>Knurled and fluted textures</strong> for tactile detail on knobs and pulls.</li>
</ul>

<h2 id="accessibility">Hardware and accessibility</h2>
<p>If anyone in your home has limited grip or hand strength, hardware choice matters for comfort and independence. <strong>D-shaped and bar pulls</strong> are far easier to use than small round knobs, because you can hook a few fingers or even a wrist through them. Pulls on both doors and drawers, mounted so they are easy to reach, make a kitchen work for every age — a small decision with a big daily payoff, and a smart one for aging-in-place planning.</p>

<h2 id="budget">How much does cabinet hardware cost?</h2>
<p>Hardware typically runs <strong>3–5% of a cabinet budget</strong>, but the range is wide: basic knobs and pulls can be a few dollars each, while designer solid-brass or specialty pieces run $15–$40+ each. A typical kitchen needs 30–50 pieces, so the choice adds up. Because it is one of the easiest details to change later, some homeowners start modest and upgrade over time — but buying quality once usually feels better every day. For how hardware fits the overall number, see the <a href="/guides/boise-cabinet-cost-guide">Boise cabinet cost guide</a>.</p>

<h2 id="checklist">Hardware selection checklist</h2>
<ul>
  <li>☐ Decide knobs-and-pulls vs pulls-everywhere vs handleless</li>
  <li>☐ Choose a dominant finish; plan any accent metal to coordinate by temperature</li>
  <li>☐ Size pulls to ~1/3 the drawer width; use long pulls on wide fronts</li>
  <li>☐ Confirm consistent placement with a template</li>
  <li>☐ Prioritize easy-grip pulls if accessibility matters</li>
  <li>☐ Order a few extra pieces for future exact-match repairs</li>
</ul>

<h2 id="soft-close">Don't forget the hardware you don't see</h2>
<p>Hinges and drawer glides matter as much as the pulls. Quality cabinets use <strong>six-way adjustable, soft-close concealed hinges</strong> and <strong>full-extension, soft-close undermount glides</strong> so doors and drawers close quietly and stay aligned for years. It's one of the clearest signs of a well-built cabinet — ask about it in any quote. See our <a href="/construction">construction standards</a>.</p>

<h2 id="materials">Hardware materials that last</h2>
<p>Two pulls can look identical in a photo and feel worlds apart in your hand. Material is why:</p>
<ul>
  <li><strong>Solid brass:</strong> heavy, durable, and ages gracefully; the premium choice, and worth it on the pieces you touch most.</li>
  <li><strong>Stainless steel:</strong> tough and corrosion-resistant, great for a clean modern look.</li>
  <li><strong>Zinc alloy (die-cast):</strong> the budget standard — fine for light-use doors, but can feel hollow and wear at the plating over years.</li>
</ul>
<p>A smart strategy is to invest in solid-metal pulls on the hardest-working base drawers and save on lightly used upper-door knobs. Heft, a smooth finish, and secure screws are the tells of quality you can feel in the showroom.</p>

<h2 id="beyond-kitchen">Coordinating hardware beyond the kitchen</h2>
<p>Cabinetry rarely stops at the kitchen. For a home that feels custom rather than piecemeal, carry your hardware language into the <a href="/cabinets/bathroom">bathroom vanities</a>, <a href="/cabinets/laundry">laundry room</a>, mudroom, and built-ins. You do not have to use the identical pull everywhere — but keeping the same finish and a consistent style family ties the whole home together. Many homeowners use the exact kitchen pull in the primary bath and a coordinating knob elsewhere, so each space feels connected without being a copy.</p>

<h2 id="bottom-line">Putting it all together</h2>
<p>Hardware is the smallest line on your cabinet quote and one of the largest influences on how the finished kitchen feels in your hands every day. The decisions compound: the door style suggests a shape, the finish suggests a temperature, your household suggests how easy the grip needs to be, and your budget decides how far the material goes. Get those four in agreement and the hardware disappears into a kitchen that simply works — drawers that glide, doors that close with a quiet touch, and pulls that feel substantial and consistent from one end of the room to the other. Get them out of sync and even beautiful hardware feels a little off. The good news is that this is one of the most forgiving decisions to plan well and, if you ever want a refresh, one of the easiest to change. Our designers help Treasure Valley homeowners choose hardware alongside the door and finish so the whole package reads as one intentional design, then install it with the soft-close hinges and glides that make quality obvious the first time you open a drawer. In a home you will live in and love for years, that everyday feel in your hands is worth getting right the first time.</p>

<h2 id="how-we-build">Hardware, planned with your cabinets</h2>
<p>${AUTHOR} helps homeowners across Boise, Meridian, Eagle, and Nampa choose and place hardware as part of the design, not an afterthought. Browse <a href="/hardware">hardware collections</a>, coordinate with your <a href="/door-styles">door style</a> and <a href="/finishes">finish</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free consultation</a>. Tip: order a few extra pieces so a future replacement is an exact match.</p>
`;

const cabinetFinishesContent = `
<p class="text-lg">Cabinet finishes fall into three families: <strong>painted</strong> (smooth, uniform, endless colors), <strong>stained</strong> (shows the wood grain and character), and <strong>specialty</strong> finishes like thermofoil and laminate (durable, budget-friendly). For color, timeless white and warm greige lead, but sage green, deep navy, and two-tone kitchens are the strongest current trends. Always view a finish sample in your own kitchen's light before you commit — the same color reads differently under Idaho's bright, dry daylight.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Painted = smooth and versatile; stained = warm and natural; specialty = durable and affordable. White and greige are safest; sage green and two-tone are the trend. Match sheen across the home and sample in real light. <a href="/finishes">Explore finishes</a> or <a href="/estimate">get a planning range</a>.</p>
</div>

<h2 id="paint-vs-stain">Painted vs stained vs specialty finishes</h2>
<p>The finish family sets the whole mood of the kitchen:</p>
<ul>
  <li><strong>Painted:</strong> a smooth, opaque, uniform surface. Hides grain, offers unlimited colors, and reads clean and current. Most requested for modern and transitional kitchens.</li>
  <li><strong>Stained:</strong> a translucent finish that lets the wood grain and natural variation show. Warm, classic, and full of character — ideal for oak, hickory, cherry, and walnut.</li>
  <li><strong>Specialty (thermofoil, laminate, melamine):</strong> a durable, wipeable surface applied to an engineered core. Excellent value and very consistent; great for laundry rooms, kids' spaces, and budget-conscious kitchens.</li>
</ul>

<h2 id="colors">The most popular cabinet colors</h2>
<p>Color is where personality comes in. What Treasure Valley homeowners are choosing now:</p>
<ul>
  <li><strong>White and off-white:</strong> the timeless default — bright, clean, and the best for resale.</li>
  <li><strong>Greige and warm neutrals:</strong> softer than stark white, hides everyday wear, pairs with almost any countertop.</li>
  <li><strong>Sage green:</strong> the standout trend — calm, natural, and elegant, especially on lower cabinets or an island.</li>
  <li><strong>Deep navy and charcoal:</strong> dramatic and grounding, best as a lower or island accent.</li>
  <li><strong>Natural stained wood:</strong> warm and characterful; white oak and walnut are especially popular.</li>
</ul>

<h2 id="two-tone">Two-tone kitchens</h2>
<p>One of the biggest trends is combining two finishes — for example creamy white uppers with sage-green or stained-wood lowers, or a contrasting island. Two-tone adds depth and lets you use a bolder color without overwhelming the room. Keep one finish as the "quiet" majority and the other as the accent, and carry the palette into your <a href="/blog/cabinet-hardware-guide">hardware</a> choices.</p>

<h2 id="sheen">Choosing a sheen</h2>
<table>
  <thead>
    <tr><th>Sheen</th><th>Look</th><th>Notes</th></tr>
  </thead>
  <tbody>
    <tr><td>Matte / flat</td><td>Soft, modern</td><td>Hides imperfections; on-trend</td></tr>
    <tr><td>Satin / eggshell</td><td>Subtle glow</td><td>Most popular; easy to clean</td></tr>
    <tr><td>Semi-gloss</td><td>Crisp, traditional</td><td>Durable; shows more detail</td></tr>
    <tr><td>High-gloss</td><td>Reflective, bold</td><td>Striking but shows fingerprints</td></tr>
  </tbody>
</table>

<h2 id="durability">Finishes and Idaho's dry climate</h2>
<p>Treasure Valley homes swing from dry winters to warm summers, and solid wood moves with humidity. Painted finishes on solid wood can show fine hairline joint lines over the seasons — that's normal wood movement, not a defect. Painted finishes on engineered panels and specialty finishes stay the most uniform. Stains gracefully hide movement because the grain is already part of the look. A quality shop accounts for all of this in material selection.</p>

<h2 id="how-to-choose">How to choose your finish and color</h2>
<ul>
  <li>☐ Decide painted (modern), stained (warm), or specialty (value/durability)</li>
  <li>☐ Choose a "quiet" main color, then an optional accent for an island or lowers</li>
  <li>☐ Order door samples and view them morning and evening in your kitchen</li>
  <li>☐ Match sheen across kitchen, bath, and mudroom for a cohesive feel</li>
  <li>☐ Coordinate the countertop and backsplash before locking the color</li>
</ul>
<div class="summary-block">
  <p><strong>Designer tip:</strong> Test big and test in place. A 2-inch chip lies; a full door sample propped against your wall, seen at 7am and 7pm, tells the truth. We bring samples to your Boise, Meridian, or Eagle home so you decide in the exact light you live in.</p>
</div>

<h2 id="lighting">How lighting changes cabinet color</h2>
<p>The single most common finish regret is choosing a color under the wrong light. A greige that looks warm and inviting in the showroom can turn cold and gray in a north-facing Boise kitchen, and a crisp white can read yellow under warm bulbs. Two rules save you:</p>
<ul>
  <li><strong>Sample in place, all day.</strong> Tape a full door sample to the wall and look at it at 7am, noon, and 7pm, and with your lights on.</li>
  <li><strong>Know your exposure.</strong> North light is cool and steady; south light is warm and bright; east and west shift dramatically morning to evening. Pick a color that flatters your room's light, not the store's.</li>
</ul>
<p>Under-cabinet and pendant bulbs matter too — a 2700K "warm" bulb pushes colors amber, while 3500–4000K reads cleaner and truer. Choose bulbs and finish together.</p>

<h2 id="countertops">Pairing finishes with countertops and backsplash</h2>
<p>Cabinets rarely live alone. Lock the cabinet color alongside your counter and backsplash, not before:</p>
<ul>
  <li><strong>White or greige cabinets</strong> pair with almost anything — a veined quartz counter adds movement without competing.</li>
  <li><strong>Sage-green cabinets</strong> love warm white or cream counters and natural wood or brass accents.</li>
  <li><strong>Stained wood</strong> looks richest against lighter counters that let the grain be the star.</li>
  <li><strong>Two-tone kitchens</strong> use the counter as the tiebreaker that connects the upper and lower colors.</li>
</ul>

<h2 id="specialty-techniques">Glazes, distressing, and specialty techniques</h2>
<p>Beyond a straight paint or stain, finish techniques add depth and age:</p>
<ul>
  <li><strong>Glaze:</strong> a tinted layer worked into corners and profiles to add warmth and highlight detail — beautiful on raised-panel doors.</li>
  <li><strong>Distressing:</strong> intentional wear at edges for a lived-in, vintage feel; a little goes a long way.</li>
  <li><strong>Cerused / wire-brushed:</strong> opens the grain and fills it with a contrasting tone for a textural, modern-rustic look on oak.</li>
</ul>
<p>These are best used with restraint and on the right door profile — our designers will show you samples so you can see the effect before committing.</p>

<h2 id="trends-2026">Trending cabinet colors for 2026</h2>
<p>Where Treasure Valley kitchens are heading: <strong>earthy greens</strong> (sage, olive, and deeper forest tones) continue to lead as the go-to color that feels calm and timeless. <strong>Warm, creamy whites and soft greiges</strong> are replacing stark cool whites. <strong>Natural and cerused wood</strong> — especially white oak — is surging, often paired with a painted color in a two-tone layout. And <strong>moody lowers</strong> in charcoal or deep navy under lighter uppers give drama without darkening the whole room. The common thread is warmth and nature, a welcome shift from the all-gray era.</p>

<h2 id="finish-mistakes">Common finish mistakes to avoid</h2>
<ul>
  <li><strong>Committing to a color from a small chip.</strong> Always use a full door sample in your space.</li>
  <li><strong>Ignoring the whole palette.</strong> Choose cabinets with your counter, floor, and wall color in view — not in isolation.</li>
  <li><strong>Chasing a trend you will tire of.</strong> Keep the big, expensive surfaces (cabinets) more timeless and let paint, decor, and hardware carry the trend.</li>
  <li><strong>Mismatched sheens.</strong> Wildly different sheens across the kitchen and adjacent rooms read as a mistake; keep them consistent.</li>
</ul>

<h2 id="care">Caring for your finish</h2>
<p>Wipe spills promptly, use a soft damp cloth with mild soap, and avoid abrasive pads or harsh degreasers that dull the sheen. For painted cabinets near the range, a gentle regular wipe-down prevents grease build-up. See our deeper guide on <a href="/blog/framed-vs-frameless-cabinets">cabinet construction</a> and the <a href="/warranty">workmanship warranty</a> that backs our finishes.</p>

<h2 id="specialty-explained">Specialty finishes explained</h2>
<p>The "specialty" family is often misunderstood, so here is the plain-English version:</p>
<ul>
  <li><strong>Thermofoil:</strong> a vinyl layer heat-sealed over an MDF core. Seamless, easy to clean, and very consistent in color; excellent for bright whites and modern slab doors, though it dislikes intense heat near ovens.</li>
  <li><strong>Laminate (including high-pressure laminate):</strong> a durable printed surface bonded to a substrate. Extremely scratch- and moisture-resistant, with modern matte and woodgrain looks that rival paint at a friendlier price.</li>
  <li><strong>Melamine:</strong> a resin-infused paper fused to a panel — the workhorse for cabinet interiors and value-focused fronts.</li>
</ul>
<p>These finishes shine in laundry rooms, garages, kids' baths, and budget-conscious kitchens where durability and value matter most. Paired with the right door style, they look far more premium than their price suggests.</p>

<h2 id="refinish-reface-replace">Refinish, reface, or replace?</h2>
<p>If your cabinet boxes are sound but the finish is dated, you may not need all-new cabinets:</p>
<ul>
  <li><strong>Refinish:</strong> repaint or re-stain the existing doors and frames. Lowest cost, best when the layout and doors you have still work.</li>
  <li><strong>Reface:</strong> keep the boxes, install new doors, drawer fronts, and a matching skin. A fresh look and new door style without a full remodel.</li>
  <li><strong>Replace:</strong> all-new custom cabinets when you want a different layout, better construction, or maximum longevity.</li>
</ul>
<p>Finish quality is the deciding factor in how any of these ages. A professionally sprayed, properly prepped finish lasts far longer than a quick brush-on, which is why finish work is one of the clearest places to see the difference between a bargain job and a lasting one.</p>

<h2 id="bottom-line">The bottom line on finishes</h2>
<p>Finish is where a kitchen finally becomes yours. It is also the decision most influenced by things outside the cabinet itself — your light, your counters, your floors, and the mood you want to walk into every morning. That is why sampling in place matters so much, and why we bring finishes to your home rather than asking you to decide under showroom lighting. Choose a finish family that matches how you live, a color that flatters your room's light, and a sheen you will enjoy cleaning, and you will love the result for a decade or more. Whether you lean crisp and white, warm and sage, or rich and stained, the goal is the same: a finish that looks intentional today and still feels right long after the trends have moved on, which is exactly what a well-chosen custom finish should do.</p>

<h2 id="how-we-build">Find your finish with Boise Cabinet Co</h2>
<p>${AUTHOR} offers hundreds of painted, stained, and specialty finishes for <a href="/cabinets/kitchen">kitchens</a>, <a href="/cabinets/bathroom">bathrooms</a>, and built-ins across Boise, Meridian, Eagle, and Nampa. Browse <a href="/finishes">finish options</a>, pair them with a <a href="/door-styles">door style</a> and <a href="/hardware">hardware</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free in-home consultation</a> with real samples.</p>
`;

const stockVsCustomContent = `
<p class="text-lg"><strong>Stock cabinets</strong> come pre-built in fixed sizes and finishes and are the fastest and cheapest option. <strong>Semi-custom</strong> cabinets start from stock sizes but allow finish, door, and modification choices. <strong>Custom cabinets</strong> are built to your exact dimensions, layout, and finish with no size limits. Stock is right for tight budgets and standard layouts; custom is right when you want a perfect fit, a specific look, or you have odd walls, tall ceilings, or a one-of-a-kind kitchen. In most Treasure Valley homes that are keeping their cabinets for 15+ years, custom or semi-custom pays off in fit, storage, and longevity.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Stock = cheapest, fastest, fixed sizes. Semi-custom = a middle path with real choices. Custom = exact fit, unlimited finishes, best storage and quality. Choose based on your budget, your layout, and how long you will keep the kitchen. <a href="/estimate">Get a planning range</a> or <a href="/compare">compare our cabinets</a>.</p>
</div>

<h2 id="stock">What are stock cabinets?</h2>
<p>Stock cabinets are mass-produced in standard sizes — typically in three-inch width increments — and sold ready to assemble or pre-assembled at home centers and online. Because they are made in volume, they are the most affordable and the quickest to get. The trade-off is flexibility: you are fitting your kitchen to the cabinets rather than the cabinets to your kitchen. Where a size does not line up, you fill the gap with filler strips, and finish and door choices are limited to what is on the shelf.</p>
<p>Stock is a reasonable choice for a rental, a flip, a laundry room, or a simple kitchen with a standard layout and a tight budget. Just know that "cheap" often shows up later in thinner boxes, stapled drawers, and finishes that wear faster.</p>

<h2 id="semi-custom">What are semi-custom cabinets?</h2>
<p>Semi-custom cabinets begin from a catalog of standard sizes but let you choose door styles, finishes, and a menu of modifications — a cabinet made a few inches taller, a deeper drawer, added roll-outs, or a different toe-kick height. It is the popular middle ground: more personality and better fit than stock, at a lower cost and shorter lead time than full custom. For many Boise and Meridian kitchens with fairly standard footprints, semi-custom hits the sweet spot.</p>

<h2 id="custom">What are custom cabinets?</h2>
<p>Custom cabinets are designed and built specifically for your space, with no size restrictions. Want cabinets that run tight to a sloped ceiling, a bank of drawers sized to your cookware, a 46-inch-wide sink base, or a finish no one else has? That is custom. Because each piece is made to order, you also get to specify construction quality — plywood boxes, dovetailed solid-wood drawers, and premium hinges — rather than accepting whatever the line includes. This is what ${AUTHOR} builds, and it is why custom kitchens feel tailored rather than assembled.</p>
<p>The trade-offs are cost and time: custom typically costs more than stock and takes longer to build. For a forever home, a tricky layout, or anyone who wants the storage and look exactly right, that investment is usually worth it.</p>

<h2 id="comparison">Stock vs semi-custom vs custom compared</h2>
<table>
  <thead>
    <tr><th>Factor</th><th>Stock</th><th>Semi-custom</th><th>Custom</th></tr>
  </thead>
  <tbody>
    <tr><td>Sizes</td><td>Fixed (3" increments)</td><td>Standard + modifications</td><td>Any dimension</td></tr>
    <tr><td>Finish / door options</td><td>Limited</td><td>Broad</td><td>Unlimited</td></tr>
    <tr><td>Fit to your space</td><td>Fillers cover gaps</td><td>Good</td><td>Exact</td></tr>
    <tr><td>Construction quality</td><td>Varies, often basic</td><td>Better</td><td>Best, your spec</td></tr>
    <tr><td>Lead time</td><td>Fastest</td><td>Moderate</td><td>Longest</td></tr>
    <tr><td>Cost</td><td>$</td><td>$$</td><td>$$$</td></tr>
    <tr><td>Best for</td><td>Budget, rentals, standard layouts</td><td>Most kitchens</td><td>Forever homes, odd spaces, specific looks</td></tr>
  </tbody>
</table>

<h2 id="how-to-choose">How to choose the right tier</h2>
<p>Four questions settle it for most homeowners:</p>
<ul>
  <li>☐ <strong>How long will you keep this kitchen?</strong> Under 5 years leans stock/semi-custom; 10+ years leans custom.</li>
  <li>☐ <strong>Is your layout standard or tricky?</strong> Sloped ceilings, tall walls, and unusual widths reward custom.</li>
  <li>☐ <strong>How specific is your look?</strong> A particular color, door, or two-tone plan may only be possible in semi-custom or custom.</li>
  <li>☐ <strong>How much does storage matter?</strong> Custom sizing squeezes the most usable space from your footprint.</li>
</ul>
<div class="summary-block">
  <p><strong>Our take:</strong> For a home you will live in for years, semi-custom or custom almost always wins on daily satisfaction — the fit, the storage, and the finish quality you notice every day. Stock is best kept for secondary spaces and short-term projects.</p>
</div>

<h2 id="quality">Do not confuse tier with quality</h2>
<p>One important nuance: "custom" is about fit and options, not automatically about quality. There are well-built semi-custom lines and poorly built custom shops. Whatever tier you choose, look past the label at the box material, drawer-box construction, and hinges — see our <a href="/blog/cabinet-construction-quality-guide">cabinet construction quality guide</a> for exactly what to inspect. The best value is a tier that fits your space with construction that lasts.</p>

<h2 id="cost">What each tier costs in Boise</h2>
<p>Pricing overlaps more than you would expect, because finish, hardware, and accessories move the number as much as the tier. As a rough guide, stock is the entry point, semi-custom sits in the middle, and custom is the premium — but a loaded semi-custom kitchen can cost more than a simple custom one. For real Treasure Valley ranges and what drives them, see the <a href="/guides/boise-cabinet-cost-guide">Boise cabinet cost guide</a> and <a href="/blog/cabinet-cost-per-linear-foot">cost per linear foot</a>.</p>

<h2 id="lead-times">Lead times: what to expect</h2>
<p>Timing often matters as much as budget, so factor it in early. Stock cabinets are the fastest because they are already made — you can sometimes take them home the same week, which is why they dominate flips and rushed rentals. Semi-custom cabinets are built to order from a catalog and typically take several weeks. Full custom cabinets take the longest because every piece is fabricated for your kitchen, and a quality shop will not rush the finish, which is where hurried work shows first. In the Treasure Valley, a realistic custom timeline runs from your design approval through fabrication to installation, and a good company builds that schedule into your plan from day one rather than surprising you later. If you are working around a move-in date, a holiday, or a new baby, tell your designer up front so the timeline is planned, not hoped for.</p>

<h2 id="where-sold">Where each tier is sold</h2>
<p>The three tiers tend to come from different places, and that shapes the experience. Stock cabinets are sold at home centers and online retailers, often as ready-to-assemble boxes you or a handyman put together. Semi-custom lines are sold through kitchen dealers and showrooms that help you configure and modify a manufacturer's catalog. Full custom comes from a dedicated cabinet shop or design-build company that measures your space, designs to it, and stands behind the installation. That last model is why custom clients get a single accountable team from first sketch to final walkthrough, instead of coordinating a box supplier, an installer, and a designer separately.</p>

<h2 id="scenarios">Real-world scenarios</h2>
<p>To make it concrete, here is how the decision usually shakes out:</p>
<ul>
  <li><strong>The rental refresh:</strong> a landlord updating a standard-layout kitchen on a budget is well served by stock or entry semi-custom. Durability and price matter more than a perfect custom fit.</li>
  <li><strong>The growing family in a newer Meridian home:</strong> a mostly standard layout but a wish list for deep drawers and a pantry points to semi-custom, with a few custom touches where it counts.</li>
  <li><strong>The forever home with character:</strong> an older Boise house with tall ceilings, out-of-square walls, and a specific vision is the classic case for full custom, where exact fit and a one-of-a-kind look justify the investment.</li>
  <li><strong>The design-forward remodel:</strong> anyone chasing a particular two-tone palette, an integrated appliance look, or floor-to-ceiling cabinetry will find that only semi-custom or custom can deliver it.</li>
</ul>
<p>Most homeowners land in semi-custom or custom once they weigh how long they will keep the kitchen against how much the daily fit and storage matter.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>The stock-versus-custom decision is really a decision about how well the kitchen fits your life. Stock asks you to adapt to it; custom adapts to you. Semi-custom splits the difference. If your layout is standard, your budget is tight, or the space is temporary, stock or semi-custom is a smart, honest choice. If you have an unusual space, a specific vision, or you plan to stay, custom delivers the fit, storage, and longevity that make a kitchen feel effortless for the next decade and beyond. Either way, judge the construction, not just the label.</p>

<h2 id="installation">Installation is part of the decision</h2>
<p>It is easy to focus on the boxes and forget that installation makes or breaks the result, and the three tiers usually come with very different install experiences. With stock cabinets bought off the shelf, installation is often on you to arrange, whether that means doing it yourself or hiring a separate handyman who did not design or build the kitchen. Any gaps between the fixed sizes and your real walls get bridged with filler strips, and how well those fillers are scribed and finished depends entirely on whoever swings the drill that day. Semi-custom kitchens bought through a dealer may or may not include installation, so it is worth asking. With full custom from a design-build company, the same team that measured and built your cabinets installs them, which means the person accountable for the fit is the person who created it. That single-team model is a big part of why custom kitchens look tailored: the crew scribes to your out-of-square walls, levels every run, and finishes the details because their name is on the whole job. When you weigh the tiers, weigh the install too, not just the price of the cardboard-flat box.</p>

<h2 id="how-we-build">Custom cabinets, built for your Treasure Valley home</h2>
<p>${AUTHOR} designs, builds, and installs custom and semi-custom cabinets for <a href="/cabinets/kitchen">kitchens</a>, <a href="/cabinets/bathroom">bathrooms</a>, and built-ins across Boise, Meridian, Eagle, and Nampa — made to your exact sizes with the construction and finishes you choose. <a href="/compare">Compare our cabinets</a>, browse <a href="/door-styles">door styles</a> and <a href="/finishes">finishes</a>, then <a href="/estimate">get an instant planning range</a> or <a href="/contact">book a free in-home consultation</a>.</p>
`;

const cabinetConstructionContent = `
<p class="text-lg">A well-built cabinet comes down to four things you can inspect: a <strong>3/4-inch plywood box</strong> (not thin particleboard), <strong>solid-wood dovetailed drawer boxes</strong> on full-extension soft-close glides, <strong>six-way adjustable soft-close hinges</strong>, and <strong>sturdy joinery with a full back panel</strong>. These details — far more than the door style or finish — decide whether your cabinets still look and work great in 15 to 20 years. When you compare quotes, ask for these specs in writing; the answers separate a lasting kitchen from a bargain that ages fast.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Judge cabinets by box material, drawer boxes, hinges, and joinery — not just the door. Plywood beats particleboard; dovetailed solid-wood drawers beat stapled ones; adjustable soft-close hardware is a must. Get the specs in writing. <a href="/construction">See how we build</a> or <a href="/estimate">get a planning range</a>.</p>
</div>

<h2 id="box">The cabinet box: your foundation</h2>
<p>The box (the carcass) is the structure everything else hangs on, and it is where cost-cutting hides. The best boxes use <strong>3/4-inch furniture-grade plywood</strong>, which holds screws securely, resists moisture, and won't sag under a stone countertop or a loaded shelf. Cheaper boxes use particleboard or thin MDF, which can swell if water gets in, strip out at screw points, and bow over time. In Idaho's dry climate the difference is less about swelling and more about strength and screw-holding — a plywood box simply stays square and solid longer.</p>
<p>Also check the <strong>back panel</strong>: a full 3/4-inch (or at least substantial) back lets installers anchor firmly into wall studs and keeps the box from racking. A flimsy stapled-on back is a red flag.</p>

<h2 id="drawers">Drawer boxes: the clearest quality tell</h2>
<p>If you only inspect one thing, open a drawer. A quality drawer box is <strong>solid wood, joined with dovetails</strong>, riding on <strong>full-extension, soft-close undermount glides</strong> rated for real weight. Dovetail joints interlock and hold up to decades of daily open-and-close; stapled or glued particleboard drawer boxes loosen, sag, and eventually fail. Full-extension glides let you reach the very back of the drawer, and soft-close means no slamming. This single feature is the most reliable predictor of how "expensive" a cabinet feels day to day.</p>

<h2 id="hinges">Hinges and glides you don't see</h2>
<p>Hardware is the mechanism of the kitchen. Look for <strong>six-way adjustable, soft-close concealed hinges</strong> from a reputable maker. Six-way adjustability means an installer can perfectly align every door — and you can nudge them back into alignment years later — in three planes. Soft-close protects the doors and your ears. Cheap fixed hinges cannot be fine-tuned, so doors drift out of alignment and there is little you can do about it. The same logic applies to drawer glides: quality, weight-rated, soft-close undermounts are worth every penny.</p>

<h2 id="joinery">Joinery and assembly</h2>
<p>How the box is held together matters. <strong>Dowel or dado joinery</strong> (where panels seat into grooves) plus glue and mechanical fasteners create a rigid, square box. Staples alone into particleboard do not. On face-frame cabinets, look for solid hardwood frames; on <a href="/blog/framed-vs-frameless-cabinets">frameless cabinets</a>, the thicker panels and precise joinery do the structural work the frame would otherwise provide. Either way, the box should feel solid and stay square when you press on a corner.</p>

<h2 id="checklist">The 60-second quality inspection</h2>
<p>Whether you are in a showroom or reviewing a sample, run this quick check:</p>
<ul>
  <li>☐ Knock the side panel — plywood sounds solid, particleboard sounds dull and hollow</li>
  <li>☐ Open a drawer — solid wood? dovetails? full extension? soft close?</li>
  <li>☐ Wiggle a door — snug hinges, no rattle; ask if they are six-way adjustable</li>
  <li>☐ Check the back panel — substantial and screwed, not thin and stapled</li>
  <li>☐ Look inside — clean edges, finished interior, no exposed raw particleboard</li>
  <li>☐ Ask for the specs in writing — box material, drawer construction, hinge brand</li>
</ul>

<h2 id="comparison">Quality tiers at a glance</h2>
<table>
  <thead>
    <tr><th>Component</th><th>Budget build</th><th>Quality build</th></tr>
  </thead>
  <tbody>
    <tr><td>Box</td><td>Particleboard / thin MDF</td><td>3/4" plywood</td></tr>
    <tr><td>Drawer box</td><td>Stapled particleboard</td><td>Dovetailed solid wood</td></tr>
    <tr><td>Glides</td><td>Side-mount, partial extension</td><td>Undermount, full-extension soft-close</td></tr>
    <tr><td>Hinges</td><td>Fixed or basic</td><td>Six-way adjustable soft-close</td></tr>
    <tr><td>Back panel</td><td>Thin, stapled</td><td>Substantial, screwed to studs</td></tr>
  </tbody>
</table>

<h2 id="interior">Shelves, interiors, and edges</h2>
<p>Open a cabinet and look inside — the interior tells you how much the maker cares about the parts you do not photograph. Quality shelves are thick enough not to bow under dishes, adjustable, and supported on solid pins rather than flimsy plastic. The interior should be cleanly finished, not raw particleboard that absorbs moisture and looks unfinished. Exposed edges should be neatly banded or veneered, not chipped or rough. Adjustable shelving matters more than it sounds: as your needs change, being able to reconfigure a cabinet keeps it useful for decades. These are small details individually, but together they separate a cabinet built to last from one built to a price.</p>

<h2 id="finish-quality">Finish quality and how it is applied</h2>
<p>A finish is only as good as the prep and application beneath it. A quality painted finish is sprayed in a controlled environment over properly sanded and sealed surfaces, cured between coats, so it lays down smooth and resists chipping. A rushed, brushed-on finish over poor prep looks passable at first and then telegraphs every flaw within a year or two. You usually cannot watch the finishing happen, but you can ask how it is done and inspect a finished sample closely for a smooth, even surface with no brush marks, drips, or thin spots at the edges. On solid-wood painted doors, remember that fine seasonal movement at the joints is normal, not a defect. For more on choosing a finish, see our <a href="/blog/cabinet-finishes-colors-guide">finishes and colors guide</a>.</p>

<h2 id="assembly">Assembled vs ready-to-assemble</h2>
<p>How a cabinet arrives affects its strength. <strong>Ready-to-assemble (RTA)</strong> cabinets ship flat and are put together on site, often with cam locks and screws. Done well, RTA can be solid; done cheaply, the connections loosen over time. <strong>Pre-assembled</strong> cabinets are built and glued in a shop under controlled conditions, which generally yields a more rigid, durable box. Custom shops build and often pre-finish in-house, so the cabinet that arrives at your home is already a complete, square, tested unit. If you are comparing an RTA option to a shop-built custom cabinet, factor the assembly quality into the value, not just the sticker price.</p>

<h2 id="warranty">Warranty as a quality signal</h2>
<p>A company's warranty tells you how much it trusts its own construction. A meaningful workmanship warranty — one that covers the build, not just a token period — signals that the maker expects the cabinets to hold up. Read what is actually covered and for how long, and ask who you call if a hinge or drawer needs attention in a few years. At <a href="/warranty">${AUTHOR}</a> we back our cabinets with a written workmanship guarantee because we build them to earn it. A vague or missing warranty, by contrast, is worth asking hard questions about before you sign.</p>

<h2 id="why-it-matters">Why construction beats cosmetics</h2>
<p>It is easy to fall for a beautiful door and a trendy color, but the finish is the part you can most easily change or refresh later. The box, drawers, and hardware are not — they are the bones. A gorgeous door on a flimsy box is a kitchen that looks great in year one and feels tired by year seven. Reverse the priorities: buy the best construction you can, then choose the door and finish you love. That is how a kitchen stays satisfying for the long haul, and it is the standard we hold on every cabinet we build.</p>

<div class="summary-block">
  <p><strong>Pro tip:</strong> When two quotes are far apart in price, the gap almost always lives in construction you can't see. Ask both companies to put box material, drawer-box construction, and hinge brand in writing — then you are comparing apples to apples.</p>
</div>

<h2 id="red-flags">Construction red flags to watch for</h2>
<p>Once you know what good looks like, the warning signs are easy to spot. A side panel that sounds dull and hollow when you knock on it usually means particleboard rather than plywood. Drawer boxes made of stapled particleboard, or drawers that only pull two-thirds of the way out, tell you the maker economized where it matters most. Doors that already sag or rattle in the showroom will only get worse, and fixed hinges that cannot be adjusted mean you will live with that misalignment. Inside, raw unfinished particleboard edges, thin shelves that already bow, and a flimsy stapled-on back panel all point to a cabinet built to a price rather than to last. Perhaps the biggest red flag is a company that cannot or will not tell you the box material, drawer construction, and hinge brand in writing. Quality makers are proud of these specs and share them readily; vague answers usually mean the details would not impress you.</p>
<p>None of this means the cheapest option is always wrong, but it does mean you should know exactly what you are buying. A well-built cabinet costs more up front and far less over a 20-year life, because you are not repairing sagging drawers, realigning drifting doors, or replacing swollen boxes. Spending a little more on construction and a little less on trend-driven extras is almost always the better long-term value. If you remember nothing else from this guide, remember to open a drawer and knock on a side panel before you sign anything, because those two seconds reveal more about a cabinet's real quality than any brochure or showroom display ever will.</p>

<h2 id="how-we-build">How Boise Cabinet Co builds cabinets to last</h2>
<p>${AUTHOR} builds every cabinet with plywood boxes, dovetailed solid-wood drawers, full-extension soft-close glides, and six-way adjustable soft-close hinges — the details that keep <a href="/cabinets/kitchen">kitchens</a>, <a href="/cabinets/bathroom">baths</a>, and built-ins across Boise, Meridian, Eagle, and Nampa solid for decades. See our <a href="/construction">construction standards</a> and the <a href="/warranty">workmanship warranty</a> behind them, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free consultation</a>.</p>
`;

const costPerLinearFootContent = `
<p class="text-lg">Cabinet cost per linear foot is a rough pricing shorthand: you measure the total length of cabinet runs (in feet) and multiply by a per-foot rate. In the Boise area, custom cabinets commonly land in the range of <strong>$300 to $900+ per linear foot installed</strong>, depending on construction, finish, and accessories. It is useful for a ballpark, but it can mislead, because two kitchens of the same length can cost very differently based on drawers, specialty cabinets, and finish. Treat it as a starting estimate, not a quote.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Per-linear-foot is a ballpark, not a bid. Measure your runs, multiply by a rate, but know that drawers, tall/specialty cabinets, finish, and accessories swing the real number. For an accurate figure, you need a design and a written scope. <a href="/estimate">Get a planning range</a> in about a minute.</p>
</div>

<h2 id="what-it-means">What "per linear foot" actually measures</h2>
<p>A linear foot is one foot of horizontal cabinet run measured along the wall, regardless of height. To estimate, you add up the lengths of your base cabinets (and often count wall cabinets separately or bundle them into the rate). A galley kitchen with 20 feet of cabinets at $500 per foot pencils out to roughly $10,000 for cabinetry — as a starting point. The method is popular because it is quick and lets you compare rough scope, but it flattens a lot of important detail into a single number.</p>

<h2 id="why-it-varies">Why the per-foot number varies so much</h2>
<p>The same 20 feet can cost wildly different amounts. Here is what moves it:</p>
<ul>
  <li><strong>Drawers vs doors:</strong> a bank of dovetailed drawers costs more than a simple door-and-shelf cabinet of the same width.</li>
  <li><strong>Tall and specialty cabinets:</strong> pantries, appliance garages, and corner solutions cost more per foot than standard bases.</li>
  <li><strong>Construction:</strong> plywood boxes and soft-close everything cost more than particleboard and basic hardware — see <a href="/blog/cabinet-construction-quality-guide">construction quality</a>.</li>
  <li><strong>Finish:</strong> a painted or specialty finish typically costs more than a basic stain — see <a href="/finishes">finishes</a>.</li>
  <li><strong>Door style and hardware:</strong> inset and intricate profiles and premium <a href="/hardware">hardware</a> add up.</li>
  <li><strong>Install complexity:</strong> odd walls, tall ceilings, and tricky layouts take more labor.</li>
</ul>

<h2 id="ranges">Rough per-linear-foot ranges in the Treasure Valley</h2>
<table>
  <thead>
    <tr><th>Tier</th><th>Rough range (installed)</th><th>What you get</th></tr>
  </thead>
  <tbody>
    <tr><td>Stock / entry</td><td>$150–$300/ft</td><td>Fixed sizes, basic construction</td></tr>
    <tr><td>Semi-custom</td><td>$300–$550/ft</td><td>More options, better build</td></tr>
    <tr><td>Custom</td><td>$500–$900+/ft</td><td>Exact fit, premium construction and finish</td></tr>
  </tbody>
</table>
<p>These are planning ranges, not quotes — your actual number depends on the mix above. Use them to sanity-check a budget, then confirm with a real design.</p>

<h2 id="how-to-estimate">How to estimate your project</h2>
<ol>
  <li>Measure the total length of your base cabinet runs in feet.</li>
  <li>Pick a per-foot rate for your tier from the table above.</li>
  <li>Multiply for a rough cabinetry figure.</li>
  <li>Add for tall/specialty cabinets, an island, and premium finish or hardware.</li>
  <li>Remember countertops, appliances, and other trades are separate.</li>
</ol>
<div class="summary-block">
  <p><strong>Faster and more accurate:</strong> our <a href="/estimate">online estimator</a> turns your room, size, and style into a planning range in about a minute — no measuring math required — and it accounts for the details a flat per-foot rate can't.</p>
</div>

<h2 id="pitfalls">Where per-foot pricing misleads</h2>
<p>Be careful using per-linear-foot to compare two companies. One quote's "$400 per foot" might include plywood boxes, soft-close everything, and a painted finish, while another's includes particleboard and basic hardware. The rate looks similar; the cabinets are not. Always compare what is actually in the price — construction, finish, and included accessories — rather than the headline number. A slightly higher per-foot rate with better construction is usually the better long-term value.</p>

<h2 id="beyond-cabinets">What the number leaves out</h2>
<p>Per-linear-foot pricing covers the cabinetry, but a kitchen project has more: countertops, sink and faucet, backsplash, appliances, lighting, and any electrical or plumbing changes. When you set a budget, hold the cabinet number in one bucket and these related costs in another so nothing surprises you. For the full local picture, the <a href="/guides/boise-cabinet-cost-guide">Boise cabinet cost guide</a> breaks down every line.</p>

<h2 id="base-vs-wall">Base cabinets, wall cabinets, and the math</h2>
<p>One reason per-linear-foot estimates confuse people is that companies count them differently. Some quote a single rate that bundles base and wall cabinets together for a typical run. Others price base and wall cabinets separately, since a wall of both costs more per floor-foot than base cabinets alone. When you compare rates, ask exactly what the number includes: is it base only, base plus wall, and does it cover the toe-kick, fillers, and finished end panels? A rate that looks low may simply be counting less. The most honest way to compare is to have each company price the same drawn layout, so you are measuring the same thing rather than two different definitions of a foot.</p>

<h2 id="islands">How islands and specialty pieces change the number</h2>
<p>An island can quietly double the cabinetry in a kitchen while adding little wall length, so it breaks the per-linear-foot shortcut. Islands often carry drawers on one side, seating overhang and finished panels on the other, and sometimes a sink or cooktop cutout — all of which add cost that a simple wall measurement misses. The same goes for tall pantries, appliance panels that hide the dishwasher or fridge, glass-front display cabinets, and clever corner solutions. Each of these is worth the money for the function it adds, but each also nudges your true cost above a flat per-foot figure. When you sketch a budget, list these specialty pieces separately so they are not lost in the averages.</p>

<h2 id="size-examples">Rough examples by kitchen size</h2>
<p>To make the ranges tangible, here is how the math tends to look for custom cabinetry in the Treasure Valley. These are planning illustrations, not quotes:</p>
<ul>
  <li><strong>Small kitchen (~15 linear feet):</strong> at roughly $500–$700 per foot, cabinetry lands around $7,500–$10,500, before an island or premium finishes.</li>
  <li><strong>Mid-size kitchen (~25 linear feet):</strong> at a similar rate, roughly $12,500–$17,500, with a modest island pushing it higher.</li>
  <li><strong>Large kitchen (~35+ linear feet with an island):</strong> often $20,000–$30,000+ for custom cabinetry, driven by drawer banks, tall cabinets, and finish.</li>
</ul>
<p>Notice how quickly finish and specialty pieces move these numbers — which is exactly why a real design beats a per-foot guess. Our <a href="/estimate">estimator</a> turns your specific room and choices into a range in about a minute.</p>

<h2 id="written-quote">What a real written quote includes</h2>
<p>When you move from ballpark to a firm number, a good quote spells out far more than a rate. It should list the door style and finish, the box and drawer construction, the hinge and glide hardware, every cabinet by size and type, specialty pieces and accessories, delivery, and installation scope. That level of detail is what lets you compare two companies fairly and understand exactly what you are buying. If a quote is just a lump sum or a bare per-foot figure with no breakdown, ask for the detail — the transparency itself is a sign of how the company works. For how we structure a written scope before any fabrication begins, see <a href="/construction">how we build</a>.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>Cost per linear foot is a helpful first sketch of your cabinet budget — quick, easy, and good for a gut check. But it is a starting point, not a finish line. The real number comes from your actual layout, the mix of drawers and specialty cabinets, the construction you choose, and the finish and hardware you love. When you are ready for a figure you can plan around, a short guided estimate or an in-home design visit will get you there far more accurately than any per-foot rule of thumb.</p>

<h2 id="value-per-foot">Getting the most value per foot</h2>
<p>If you want your budget to go further, the smartest move is to spend where you touch and skimp where you do not. Put your money into construction and into the cabinets you use most — the base drawers by the range, the pantry, the everyday doors — and be more economical on cabinets that see light duty or hide behind other things. A modest, timeless door style with a great box will feel more expensive over the years than a fancy profile on a flimsy box. You can also control cost by keeping the layout efficient: every extra corner, angle, and specialty cabinet adds dollars per foot, so a clean, well-planned run stretches the budget. And because finish is one of the larger swing factors, choosing a beautiful but standard finish over an exotic one frees up budget for the construction that actually determines how long the kitchen lasts.</p>
<p>Some homeowners also phase the work: investing in quality cabinets now and adding accessories, an island upgrade, or a specialty piece later. That approach lets you buy the bones right the first time without stretching for every extra at once. Whatever path you choose, the goal is the same — a number you understand, built from your real layout and choices rather than a rule of thumb. A short conversation with a designer will turn your rough per-foot sketch into a plan you can actually budget around, and it costs you nothing to find out where your project truly lands. Even a quick online estimate will show you how your specific layout, finishes, and accessories reshape the per-foot math, which is the fastest way to trade a rough rule of thumb for a real, plannable number for your Treasure Valley kitchen.</p>

<h2 id="how-we-build">Get an accurate cabinet estimate</h2>
<p>${AUTHOR} gives Boise, Meridian, Eagle, and Nampa homeowners a real planning range and a written scope — not just a per-foot guess. Try the <a href="/estimate">online estimator</a>, read the <a href="/guides/boise-cabinet-cost-guide">cost guide</a>, or <a href="/contact">book a free in-home consultation</a> and we will measure, plan, and price your <a href="/cabinets/kitchen">kitchen</a> or <a href="/cabinets/bathroom">bath</a> accurately, with a written scope and an honest range you can actually plan around.</p>
`;

const rtaCabinetsContent = `
<p class="text-lg"><strong>RTA cabinets</strong> are "ready-to-assemble" cabinets: they ship flat in a box and you (or an installer) put them together on site with included dowels, cam locks, and screws. They are popular because flat-packing dramatically lowers shipping and storage costs, so RTA is usually cheaper than pre-assembled stock and far cheaper than custom. The trade-off is your time and skill to assemble them, fixed sizes that may not fit your space perfectly, and quality that varies widely by supplier. RTA can be a smart budget choice for a standard layout and a handy homeowner; for a precise fit, a specific look, or a forever kitchen, custom is usually the better long-term value.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> RTA = flat-pack cabinets you assemble yourself to save money. Best for tight budgets, standard layouts, and DIY-comfortable homeowners. Quality ranges from excellent to disappointing, so inspect the box, drawers, and hinges. For exact fit and premium construction, compare against <a href="/compare">custom cabinets</a>. <a href="/estimate">Get a planning range</a>.</p>
</div>

<h2 id="what-they-are">What does RTA mean?</h2>
<p>RTA stands for ready-to-assemble. Instead of arriving as finished boxes, RTA cabinets come as a kit of flat panels, doors, drawer parts, and a bag of hardware, packed tightly in a carton. You assemble each cabinet before it goes on the wall, typically using pre-drilled holes and a combination of dowels, cam-lock connectors, screws, and glue. Once assembled, a good RTA cabinet looks and functions much like a pre-built one — the difference is simply where and when the assembly happens.</p>
<p>The model exists because shipping air is expensive. A finished cabinet is mostly empty space, so it costs a lot to box, ship, and warehouse. Flattening it into a compact kit slashes those costs, and RTA suppliers pass some of that savings to you. That is the entire value proposition: you trade a few hours of assembly for a lower price.</p>

<h2 id="pros">The advantages of RTA cabinets</h2>
<p>RTA has real strengths, and for the right project they add up. The most obvious is price: because you are not paying for factory assembly or bulky shipping, RTA typically undercuts comparable pre-assembled stock cabinets. Availability is another plus — many RTA lines are in stock and ship quickly, which suits a tight timeline or a rental turnover. Flat boxes are also easier to carry through doorways and up stairs than fully built cabinets, and if you enjoy hands-on projects, assembling your own cabinets can be genuinely satisfying. For a budget-conscious kitchen with a standard layout, RTA can deliver a clean, updated look for meaningfully less money.</p>

<h2 id="cons">The drawbacks to weigh</h2>
<p>The savings come with honest trade-offs. First is your time and skill: assembling a full kitchen of cabinets is hours of careful work, and a cabinet that is assembled out of square will hang crooked and never quite look right. Second is fit — like all stock cabinets, RTA comes in fixed sizes, so gaps between the cabinets and your real walls get covered with filler strips rather than a true custom fit. Third is quality variability, which is the big one: RTA spans everything from solid plywood boxes with dovetailed drawers to flimsy particleboard held together with staples. Two RTA kitchens at similar prices can be worlds apart in how long they last. Finally, if something arrives damaged or a panel is mis-drilled, you are often the one managing the fix, without the accountability of a local company that measured, built, and installed the kitchen.</p>

<h2 id="quality">How to judge RTA quality</h2>
<p>Because RTA quality varies so much, inspecting it matters more than with almost any other cabinet. Look for a <strong>3/4-inch plywood box</strong> rather than thin particleboard, <strong>solid-wood dovetailed drawer boxes</strong> on full-extension soft-close glides, and <strong>adjustable soft-close hinges</strong>. Read reviews specifically about assembly — do the parts line up, are the pre-drilled holes accurate, is the hardware decent? A cheap RTA kit that fights you during assembly and sags within a year is not a bargain. Our full <a href="/blog/cabinet-construction-quality-guide">cabinet construction quality guide</a> walks through exactly what to check, and it applies directly to evaluating any RTA line.</p>

<h2 id="comparison">RTA vs pre-assembled vs custom</h2>
<table>
  <thead>
    <tr><th>Factor</th><th>RTA</th><th>Pre-assembled stock</th><th>Custom</th></tr>
  </thead>
  <tbody>
    <tr><td>Price</td><td>Lowest</td><td>Low-mid</td><td>Highest</td></tr>
    <tr><td>Assembly</td><td>You do it</td><td>Done</td><td>Done, installed by the builder</td></tr>
    <tr><td>Fit</td><td>Fixed sizes + fillers</td><td>Fixed sizes + fillers</td><td>Exact</td></tr>
    <tr><td>Quality</td><td>Varies widely</td><td>Varies</td><td>Best, your spec</td></tr>
    <tr><td>Lead time</td><td>Fast</td><td>Fast</td><td>Longest</td></tr>
    <tr><td>Best for</td><td>DIY, budget, standard layout</td><td>Budget, no assembly</td><td>Forever homes, odd spaces</td></tr>
  </tbody>
</table>

<h2 id="who-for">Who should buy RTA?</h2>
<p>RTA makes the most sense for a specific kind of project. If you are updating a rental, flipping a house, finishing a garage or laundry room, or working with a tight budget and a standard kitchen footprint, RTA can be a genuinely smart choice — especially if you or someone you trust is comfortable with careful assembly. It is less ideal if your walls are out of square, your ceilings are tall, you want a particular finish or two-tone look, or you simply do not want to spend a weekend building cabinets. In those cases, the money you save on RTA is often spent back in filler gaps, compromises, and the labor of assembly.</p>

<h2 id="assembly">What assembling RTA actually involves</h2>
<p>If you go the RTA route, plan for the reality of assembly. Each cabinet typically takes 20 to 45 minutes once you find a rhythm, and a full kitchen is a substantial project spread over a weekend or more. You will need basic tools, a clean flat workspace, patience, and care to keep every box perfectly square — a carpenter's square and a rubber mallet are your friends. Label parts, follow the instructions in order, and dry-fit before gluing. Rushing is where RTA kitchens go wrong: a box assembled slightly out of square throws off the doors and the whole run. Done patiently, though, quality RTA can look indistinguishable from pre-built once it is on the wall.</p>

<h2 id="cost">What RTA cabinets cost</h2>
<p>RTA is generally the least expensive way to get new cabinets, often running well below pre-assembled stock and a fraction of custom. But remember that the sticker price is only part of the story: factor in your time to assemble, any tools you need, filler strips, and installation if you are not doing that yourself. And weigh the long game — a cheaper cabinet that wears out or sags in a few years costs more than a well-built one that lasts twenty. For how RTA fits against other options in our market, see the <a href="/guides/boise-cabinet-cost-guide">Boise cabinet cost guide</a> and our comparison of <a href="/blog/stock-vs-custom-cabinets-boise">stock vs custom cabinets</a>.</p>

<h2 id="bottom-line">The bottom line on RTA</h2>
<p>RTA cabinets are a legitimate, budget-friendly option that trades your time and a perfect fit for a lower price. For a standard layout, a modest budget, and a homeowner who does not mind assembly, they can deliver a clean, updated kitchen for real savings. But RTA is not automatically a good deal — quality ranges from excellent to poor, and the cheapest kits often disappoint. If your space is tricky, your vision is specific, or you plan to stay in the home for years, the exact fit, premium construction, and single accountable team of a custom kitchen usually deliver more satisfaction and better long-term value. The right answer depends on your budget, your layout, and how much the fit and finish matter to you every day.</p>

<h2 id="where-sold">Where RTA cabinets are sold</h2>
<p>RTA cabinets come mostly from online retailers and some home centers, and the buying experience is very different from working with a local cabinet company. Online, you browse a catalog, choose door styles and sizes, and place an order that arrives on a freight truck in a stack of flat boxes. There is no one measuring your kitchen, no designer catching that a cabinet will collide with your window trim, and no installer accountable for the finished result. That do-it-yourself model is exactly why RTA is cheaper, and it works fine for a confident homeowner with a straightforward layout. But it also means the responsibility for measuring correctly, ordering the right sizes, handling any damaged or mis-drilled parts, and assembling everything square falls on you. If a piece shows up wrong, you are filing a claim and waiting on a replacement rather than calling a local team that will make it right. For some homeowners that trade-off is worth the savings; for others, the peace of mind of a single accountable company is worth paying more for. Knowing which kind of project and which kind of person you are is the key to a happy RTA experience.</p>

<h2 id="finish-durability">Finishing, durability, and the long view</h2>
<p>One detail that surprises RTA buyers is finishing. Many RTA lines arrive already finished, but the finish quality varies as much as the construction, and a thin or unevenly applied finish will show wear sooner around the sink and range where hands and moisture do their work. Before you buy, look closely at a sample or read reviews focused on how the finish holds up over a year or two of real cooking, not just how it looks on day one. Durability overall is the theme with RTA: a well-made kit with plywood boxes, dovetailed drawers, and a quality finish can serve a kitchen faithfully for many years, while a bargain kit of stapled particleboard can start sagging and chipping within a couple of seasons. The cheapest RTA is rarely the best value, because a cabinet you replace in five years costs far more than one that lasts twenty. When you compare an inexpensive RTA option against a custom quote, weigh the full lifespan, not just the opening price, and be honest about how long you intend to keep the kitchen. That single question — how long will I live with this — resolves most RTA-versus-custom decisions on its own.</p>

<h2 id="how-we-build">Considering custom instead? Talk to Boise Cabinet Co</h2>
<p>If you want the exact-fit, built-to-last alternative to RTA, ${AUTHOR} designs, builds, and installs custom cabinets for <a href="/cabinets/kitchen">kitchens</a>, <a href="/cabinets/bathroom">bathrooms</a>, and built-ins across Boise, Meridian, Eagle, and Nampa — no assembly required and no filler-gap compromises. <a href="/compare">Compare our cabinets</a>, then <a href="/estimate">get an instant planning range</a> or <a href="/contact">book a free in-home consultation</a>.</p>
`;

const customCabinetCostContent = `
<p class="text-lg">Custom kitchen cabinets typically cost <strong>$500 to $1,200+ per linear foot installed</strong>, which puts a full custom kitchen in roughly the <strong>$15,000 to $45,000+</strong> range depending on size, materials, finish, and complexity. In the Boise and Treasure Valley market, most custom kitchens land somewhere in the middle of that spread. The biggest cost drivers are the size of the kitchen, the construction and finish you choose, and how many drawers and specialty cabinets you include — not any single line item. The most accurate way to know your number is a design and a written scope, but the ranges below will get you a confident ballpark.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Custom kitchen cabinets run about $500–$1,200+ per linear foot installed, or roughly $15,000–$45,000+ for a full kitchen. Size, construction, finish, and specialty cabinets move the number most. Get a real range in about a minute with our <a href="/estimate">online estimator</a>.</p>
</div>

<h2 id="ranges">What custom kitchen cabinets cost</h2>
<p>Because every custom kitchen is different, it helps to think in ranges rather than a single price. Per linear foot — the length of your cabinet runs — custom cabinetry commonly falls between $500 and $1,200 or more installed, with the high end reflecting premium materials, intricate door styles, specialty finishes, and loaded storage. Translated to a whole kitchen, a smaller custom kitchen might start around $15,000, a mid-size kitchen often lands in the $20,000 to $30,000 range, and a large kitchen with an island, tall cabinets, and high-end finishes can climb past $45,000. These figures are for cabinetry; countertops, appliances, and other trades are separate. The wide spread is not vague pricing — it reflects how many choices go into a custom kitchen.</p>

<h2 id="drivers">What drives the cost</h2>
<p>Understanding the drivers helps you steer the budget with intention. The single biggest factor is simply <strong>size</strong> — more linear feet of cabinets means more materials and labor. After that, <strong>construction quality</strong> matters: plywood boxes, dovetailed solid-wood drawers, and soft-close everything cost more than particleboard and basic hardware, and they are worth it for longevity. <strong>Finish</strong> is a major swing factor, with painted and specialty finishes generally costing more than a basic stain. <strong>Door style</strong> plays a role too, as inset and intricate profiles cost more than simple Shaker or slab. <strong>Storage and specialty cabinets</strong> — drawer banks, pantries, appliance panels, and clever corner solutions — each add cost for the function they deliver. Finally, <strong>layout complexity and installation</strong> — odd walls, tall ceilings, and tricky spaces — add labor. Together these explain why two kitchens of the same size can cost very differently.</p>

<h2 id="tiers">Custom vs stock vs semi-custom cost</h2>
<table>
  <thead>
    <tr><th>Tier</th><th>Rough per linear foot (installed)</th><th>What you get</th></tr>
  </thead>
  <tbody>
    <tr><td>Stock / RTA</td><td>$150–$300</td><td>Fixed sizes, basic build, filler gaps</td></tr>
    <tr><td>Semi-custom</td><td>$300–$550</td><td>More options and better construction</td></tr>
    <tr><td>Custom</td><td>$500–$1,200+</td><td>Exact fit, premium construction and finish</td></tr>
  </tbody>
</table>
<p>Custom costs more up front, but for a home you will keep, the exact fit, maximized storage, and construction that lasts often make it the better long-term value. For a deeper comparison, see <a href="/blog/stock-vs-custom-cabinets-boise">stock vs custom cabinets</a> and <a href="/blog/cabinet-cost-per-linear-foot">cost per linear foot</a>.</p>

<h2 id="whats-included">What is (and isn't) in the cabinet price</h2>
<p>When you compare quotes, know what the number covers. A complete custom cabinet price generally includes the cabinets themselves, the door style and finish, hardware, delivery, and professional installation. It usually does <em>not</em> include countertops, the sink and faucet, backsplash, appliances, lighting, flooring, or any electrical and plumbing changes — those are separate line items in a kitchen budget. Setting cabinets in one bucket and these related costs in another keeps your planning honest and prevents mid-project surprises. For a full local breakdown of every line, the <a href="/guides/boise-cabinet-cost-guide">Boise cabinet cost guide</a> lays it out.</p>

<h2 id="worth-it">Are custom cabinets worth the cost?</h2>
<p>Whether custom is worth it comes down to how long you will stay and how much the details matter to you. If you plan to keep the kitchen for a decade or more, the daily payoff of a perfect fit — drawers exactly where you want them, storage maximized to your footprint, a finish you love, and construction that still looks great in fifteen years — usually justifies the investment. Custom also shines when your space is tricky or your vision is specific, because it is the only option that adapts fully to you. If you are updating a rental or a short-term home, or your layout is standard and your budget is tight, stock or semi-custom may be the smarter financial call. There is no universally right answer, only the right answer for your home and timeline.</p>

<h2 id="save">How to get the most for your budget</h2>
<p>You can build a beautiful custom kitchen without buying every upgrade. The smartest approach is to invest in the bones — quality construction and the cabinets you use most — and be selective about extras. A timeless door style and a standard-but-beautiful finish cost less than exotic options and age better. Keeping the layout efficient trims cost, since every added corner and specialty cabinet adds dollars. Some homeowners also phase the work, buying quality cabinets now and adding accessories or an island upgrade later. And because finish and hardware are big swing factors, choosing wisely there frees budget for the construction that determines how long the kitchen lasts.</p>

<h2 id="estimate">How to estimate your project</h2>
<p>For a fast, credible ballpark, measure the length of your base-cabinet runs in feet and multiply by a per-foot rate for your tier, then add for an island, tall cabinets, and premium finish or hardware. Even quicker and more accurate, our <a href="/estimate">online estimator</a> turns your room, size, and style into a planning range in about a minute, accounting for the details a flat rate misses. When you are ready for a firm number, an in-home design visit produces a written scope you can budget around with confidence.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>Custom kitchen cabinets are an investment — commonly $15,000 to $45,000 or more for a full Treasure Valley kitchen — but they are also one of the most-used, longest-lived parts of your home. The price reflects real choices about size, construction, finish, and storage, which means you have genuine control over where your budget goes. Spend on the bones and the cabinets you touch every day, be intentional about extras, and you will get a kitchen that fits your life perfectly and holds its beauty for decades. When you want to know your specific number, a quick estimate or a free design visit will replace guesswork with a plan.</p>

<h2 id="local">Why Treasure Valley costs differ from national averages</h2>
<p>You will find plenty of national cabinet cost figures online, but the number that matters is the one for your market and your kitchen. Local labor rates, delivery distances, the availability of specific finishes and materials, and the mix of homes a company serves all shift the real range. In the Boise area, a strong local custom shop can often deliver better value than a big-box special order, because you are working directly with the team that designs, builds, and installs your kitchen rather than paying for layers of markup and middlemen. Older Treasure Valley homes with out-of-square walls and newer builds with soaring ceilings both push toward custom, since standard sizes leave gaps and wasted space that custom fills. The upshot is simple: use national averages as a loose sanity check, but trust a real local quote for your actual budget. A company that measures your space and puts a written scope in your hands is giving you a number you can plan around, not a nationwide guess.</p>

<h2 id="financing">Budgeting and phasing the investment</h2>
<p>Because cabinets are a significant investment, it helps to think about how the spend fits your broader kitchen budget and timeline. Cabinets typically represent one of the largest single line items in a kitchen project, so decide early how much of your total you want to allocate there versus countertops, appliances, and finishes. If the ideal kitchen stretches beyond this year's budget, phasing is a legitimate strategy: buy quality cabinets built to last now, and add accessories, an island upgrade, or a specialty piece later, rather than compromising on the construction you cannot easily change. Some homeowners also explore financing to spread a remodel over time; whatever route you take, the principle holds — put your dollars into the parts that are hard to change later, and treat the easily-swapped details as things you can upgrade down the road. A good designer will help you prioritize so your money lands where it delivers the most daily value, and will be transparent about what each choice adds before you commit.</p>
<p>It is also worth remembering what you are actually buying. Cabinets are among the most-touched, longest-lived elements in a home, used every single day for a decade or more, and a well-planned kitchen consistently ranks among the upgrades homeowners are happiest they made. Viewed over that lifespan, the difference between a bargain kitchen and a well-built custom one is often just a few dollars a day — and those dollars buy you drawers that glide, a finish that still looks fresh in year ten, storage sized to your life, and a room you genuinely enjoy being in. That is the real return on a custom kitchen, and it is why so many Treasure Valley homeowners decide the investment is worth it once they see their specific number rather than a scary national headline.</p>

<h2 id="how-we-build">Get your custom cabinet cost from Boise Cabinet Co</h2>
<p>${AUTHOR} gives Boise, Meridian, Eagle, and Nampa homeowners a real planning range and a written scope for custom <a href="/cabinets/kitchen">kitchen cabinets</a> — built to your exact space with the construction and finishes you choose. Try the <a href="/estimate">online estimator</a>, read the <a href="/guides/boise-cabinet-cost-guide">cost guide</a>, or <a href="/contact">book a free in-home consultation</a> for an accurate, no-pressure number.</p>
`;

const standardCabinetSizesContent = `
<p class="text-lg">Standard kitchen cabinets come in predictable sizes. <strong>Base cabinets</strong> are 24 inches deep and 34.5 inches tall (36 inches with the countertop), in widths from 9 to 48 inches. <strong>Wall (upper) cabinets</strong> are 12 to 15 inches deep and 30, 36, or 42 inches tall, typically mounted 18 inches above the counter. <strong>Tall cabinets</strong> (pantries and utility) run 84 to 96 inches tall and 12 to 24 inches deep. Widths for all types come in 3-inch increments. Custom cabinets can be built to any dimension, which is how you fit odd spaces and tall ceilings that standard sizes cannot.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Base = 24" deep, 34.5" tall, 9–48" wide. Wall = 12–15" deep, 30–42" tall, mounted 18" above the counter. Tall = 84–96" tall. Widths step in 3" increments. Custom builds to any size for a perfect fit. <a href="/estimate">Plan your kitchen</a> or browse <a href="/cabinets/kitchen">kitchen cabinets</a>.</p>
</div>

<h2 id="base">Base cabinet dimensions</h2>
<p>Base cabinets sit on the floor and carry the countertop, and their dimensions are the backbone of every kitchen. The <strong>standard height is 34.5 inches</strong>, which becomes 36 inches once a typical countertop is added — the comfortable working height for most people. The <strong>standard depth is 24 inches</strong> (about 25 inches with the countertop overhang), deep enough to store most cookware and to sit under a standard countertop. <strong>Widths run from 9 to 48 inches in 3-inch increments</strong> (9, 12, 15, 18, and so on), so designers can combine cabinets to fill a run. Base cabinets come as door cabinets, drawer banks, sink bases, and specialty units like corner cabinets and cooktop bases.</p>
<table>
  <thead><tr><th>Base cabinet</th><th>Standard dimension</th></tr></thead>
  <tbody>
    <tr><td>Height (without counter)</td><td>34.5"</td></tr>
    <tr><td>Height (with counter)</td><td>36"</td></tr>
    <tr><td>Depth</td><td>24" (25" with overhang)</td></tr>
    <tr><td>Widths</td><td>9"–48" in 3" increments</td></tr>
    <tr><td>Toe kick</td><td>~4.5" tall, 3" deep</td></tr>
  </tbody>
</table>

<h2 id="wall">Wall (upper) cabinet dimensions</h2>
<p>Wall cabinets hang above the counter and hold everyday dishes and glassware. The <strong>standard depth is 12 inches</strong>, though 15- and even 24-inch-deep uppers appear over refrigerators and in some modern designs. <strong>Heights are typically 30, 36, or 42 inches</strong> — a 30-inch cabinet leaves a soffit or open space above, 36 inches is common, and 42-inch cabinets run nearly to an 8-foot ceiling for maximum storage and a built-in look. Wall cabinets are usually <strong>mounted 18 inches above the countertop</strong>, which balances reach with enough clearance for small appliances and backsplash. Like base cabinets, widths step in 3-inch increments.</p>
<table>
  <thead><tr><th>Wall cabinet</th><th>Standard dimension</th></tr></thead>
  <tbody>
    <tr><td>Depth</td><td>12" (15" or 24" for special uses)</td></tr>
    <tr><td>Heights</td><td>30", 36", 42"</td></tr>
    <tr><td>Mounting height above counter</td><td>18"</td></tr>
    <tr><td>Widths</td><td>9"–48" in 3" increments</td></tr>
  </tbody>
</table>

<h2 id="tall">Tall cabinet dimensions</h2>
<p>Tall cabinets — pantries, utility, and oven cabinets — run floor to near-ceiling for maximum storage. <strong>Heights are typically 84, 90, or 96 inches</strong> to suit 8- to 9-foot ceilings, and <strong>depths are 12 or 24 inches</strong> (12-inch for shallow pantries, 24-inch to align with base cabinets and house ovens or deep pull-outs). Widths generally range from 18 to 36 inches. Tall cabinets are workhorses for storage and are one of the clearest places custom sizing pays off, since a stock 84-inch pantry can leave an awkward gap under a 9-foot ceiling that a custom cabinet fills cleanly.</p>

<h2 id="drawers-clearances">Drawers, spacing, and clearances</h2>
<p>Beyond the boxes, a few dimensions make a kitchen work. Comfortable <strong>walkways</strong> are at least 36 to 42 inches wide, and 42 to 48 inches between opposing runs or an island so drawers and appliances can open. An <strong>island</strong> needs clearance on all sides for seating and traffic. Drawer heights vary by function — shallow for utensils, deep for pots — and are a major reason to plan a drawer-heavy base run. Standard <strong>toe kicks</strong> are about 4.5 inches tall and 3 inches deep so you can stand close to the counter comfortably. Getting these clearances right is as important as the cabinet sizes themselves, because a technically correct kitchen with cramped walkways still feels wrong.</p>

<h2 id="standard-vs-custom">Standard vs custom sizing</h2>
<p>Standard sizes exist because they cover most kitchens efficiently and keep stock and semi-custom cabinets affordable. But real homes are full of exceptions — a 9-foot ceiling, an out-of-square wall, a bump-out, a window that lands at an awkward height, or a wish for a 46-inch sink base that no stock line offers. That is where custom sizing earns its keep: cabinets built to your exact dimensions eliminate filler gaps, use every inch of an unusual space, and let you size drawers and cabinets to your actual cookware and habits. If your kitchen is standard, stock sizes may serve you well; if it is not, custom turns a compromise into a perfect fit.</p>

<h2 id="ada">Accessible and universal dimensions</h2>
<p>If accessibility matters, a few adjusted dimensions make a kitchen work for every age and ability. Lowering a section of counter to about 34 inches, providing knee clearance under a sink or cooktop, using drawers instead of low doors for easy reach, and choosing D-shaped pulls all improve usability. These universal-design touches are easy to plan into a custom kitchen and are a smart investment for aging in place. Our team can incorporate them from the first design conversation so the kitchen works beautifully now and for decades.</p>

<h2 id="how-to-measure">How to use these dimensions to plan</h2>
<p>Knowing the standards lets you sketch a realistic plan. Measure your room precisely — wall lengths, ceiling height, and the location of windows, doors, and utilities — then lay in base cabinets, uppers, and tall units using the standard sizes, keeping walkways and clearances in mind. Where standard sizes leave gaps or fight your ceiling height, that is exactly where custom cabinets solve the problem. If measuring and space-planning feels daunting, a designer does it for you: we measure, plan the layout around your real space and habits, and confirm every dimension before anything is built.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>Standard kitchen cabinet sizes — 24-inch-deep, 34.5-inch-tall bases; 12-inch-deep, 30-to-42-inch-tall uppers; 84-to-96-inch tall cabinets, all in 3-inch width increments — are the framework nearly every kitchen is built on. They are efficient and affordable, and for a standard room they work well. But the moment your ceilings, walls, or wish list step outside the standard grid, custom sizing is what turns "close enough" into a kitchen that fits perfectly and uses every inch. Whether you plan with standard sizes or build to custom dimensions, the goal is the same: comfortable clearances, smart storage, and a layout that feels effortless to live in.</p>

<h2 id="appliances">Planning cabinet sizes around appliances</h2>
<p>Appliances quietly dictate a lot of your cabinet dimensions, so plan them together rather than as an afterthought. A standard range or slide-in cooktop needs a 30- or 36-inch opening, and the base cabinets on either side must be sized to leave that gap exactly. Dishwashers require a 24-inch opening, usually beside the sink base, and refrigerators need both the right width and enough depth and height clearance — counter-depth models change the cabinet plan around them. Over-the-range microwaves and hoods set the height of the cabinet above the cooktop, and a wall oven needs a tall cabinet built to its specific cutout. Because appliance sizes are not always perfectly standard, a common frustration with stock cabinets is discovering that a new refrigerator or range does not quite fit the opening you have. Custom cabinets sidestep this by building the openings to your actual appliances, which is one more reason odd or high-end appliance packages tend to point toward custom. Confirm every appliance's specifications before finalizing the cabinet layout, and leave a little clearance for installation and airflow.</p>

<h2 id="mistakes">Common cabinet sizing mistakes to avoid</h2>
<p>A few sizing errors show up again and again, and all of them are avoidable with a little planning. The most common is forgetting clearances — packing in cabinets and an island until the walkways are too tight, so drawers and the dishwasher door collide with the island when open. Another is ignoring ceiling height: pairing 30-inch wall cabinets with a 9-foot ceiling leaves a large, awkward gap, when 42-inch cabinets or a stacked upper design would use the space beautifully. People also underestimate how much they will love drawers over low doors, and end up crouching to reach the back of a base cabinet that could have been a smooth-gliding drawer bank. Mismatched filler and end-panel details, cabinets that crowd a window casing, and toe kicks that are too shallow to stand comfortably at the counter all trace back to skipping careful measurement. The fix is the same in every case: measure precisely, plan around real clearances and your ceiling height, and when the standard grid fights your space, use custom sizing rather than forcing a compromise. A designer catches these issues on paper, long before anything is built, which is the cheapest possible place to fix them.</p>
<p>One last tip: when you measure, always note the ceiling height and the exact locations of windows, doors, outlets, switches, and plumbing, not just the wall lengths. Those details determine which standard sizes actually work and where a custom cabinet is the only clean solution. A wall that is a few inches shorter than a tidy combination of standard widths, or a window sill that lands two inches into where an upper cabinet wants to go, is exactly the kind of thing that turns a paper-perfect plan into an on-site headache. Measuring thoroughly up front, or letting a designer do it for you, is what keeps your beautiful layout from meeting an ugly surprise on installation day.</p>

<h2 id="how-we-build">Plan your kitchen with Boise Cabinet Co</h2>
<p>${AUTHOR} designs custom <a href="/cabinets/kitchen">kitchen cabinets</a> in standard and fully custom sizes for homes across Boise, Meridian, Eagle, and Nampa — measured to your exact space, with the clearances and storage planned around how you cook. <a href="/estimate">Get a planning range</a>, browse <a href="/door-styles">door styles</a> and <a href="/finishes">finishes</a>, or <a href="/contact">book a free in-home consultation</a> and we will handle the measuring and layout for you.</p>
`;

export const PREMIUM_POSTS: BlogPostData[] = [
  {
    slug: 'framed-vs-frameless-cabinets',
    title: 'Framed vs Frameless Cabinets: The Complete Guide',
    seoTitle: 'Framed vs Frameless Cabinets: Pros, Cons & Cost',
    metaDescription:
      'Framed vs frameless (European) cabinets compared: usable space, drawer access, look, durability, and cost, plus how to choose for your Treasure Valley kitchen.',
    excerpt:
      'Frameless (European) cabinets give you more usable space and a cleaner modern look, while framed cabinets offer a classic profile. Here is how to choose, with a full comparison table, pros and cons, and cost guidance.',
    content: framedVsFramelessContent,
    author: AUTHOR,
    category: 'Kitchen Cabinets',
    hubSlug: 'kitchen-cabinets',
    tags: ['frameless', 'framed', 'construction', 'kitchen', 'cabinets'],
    publishedAt: '2026-07-11',
    faqs: [
      {
        question: 'What is the difference between framed and frameless cabinets?',
        answer:
          'Framed cabinets have a solid-wood face frame across the front of the box that doors attach to; frameless (European) cabinets omit the frame so doors mount directly to the box. Frameless gives more usable interior space and wider drawers with a cleaner modern look, while framed offers a traditional profile.',
      },
      {
        question: 'Are frameless cabinets better than framed?',
        answer:
          'For most modern kitchens, frameless is better because you gain roughly 10–15% more usable space, full-access drawers, and seamless sightlines. Framed cabinets are a strong choice for traditional or historic homes, especially with inset doors. Build quality matters more than the frame type itself.',
      },
      {
        question: 'Do frameless cabinets cost more than framed?',
        answer:
          'They can, but the frame is rarely the main cost driver. Materials, finish, hardware, and layout complexity move the price far more. Entry-level stock cabinets (usually framed) are cheapest, while custom frameless with premium finishes sits at the higher end.',
      },
      {
        question: 'Are frameless cabinets more or less durable?',
        answer:
          'Frameless boxes use thicker panels (typically 3/4-inch) to make up for the missing frame, so a well-built frameless cabinet is just as durable. Durability depends on box material, joinery, drawer-box construction, and hinge quality rather than the presence of a face frame.',
      },
      {
        question: 'What are frameless cabinets also called?',
        answer:
          'Frameless cabinets are also called European cabinets, Euro-style cabinets, or full-access cabinets, because the entire box opening is usable without a face frame in the way.',
      },
      {
        question: 'Does Boise Cabinet Co build framed or frameless cabinets?',
        answer:
          'We build frameless custom cabinets for kitchens, bathrooms, and built-ins across Boise, Meridian, Eagle, Nampa, and the wider Treasure Valley, because homeowners consistently value the added space and modern lines. Schedule a free in-home consultation to plan your project.',
      },
    ],
    quickAnswer:
      'Framed cabinets have a solid-wood face frame across the front; frameless (European) cabinets skip it so doors mount to the box. Frameless gives more usable space, wider drawers, and a cleaner modern look; framed offers a traditional profile and easy installs on out-of-square walls.',
    keyTakeaways: [
      'Frameless returns ~10–15% more usable space and full-access drawers.',
      'Framed suits traditional and historic homes, especially with inset doors.',
      'Box material, drawer boxes, and hinges matter more than the frame debate.',
    ],
    relatedLinks: [
      { url: '/guides/boise-kitchen-cabinet-guide', anchor: 'Kitchen Cabinets' },
      { url: '/construction', anchor: 'How we build' },
      { url: '/door-styles', anchor: 'Door styles' },
      { url: '/guides/boise-cabinet-cost-guide', anchor: 'Boise Cabinet Cost Guide' },
      { url: '/cabinets' },
    ],
    isPillar: false,
    primaryKeyword: 'framed vs frameless cabinets',
    secondaryKeywords: [
      'frameless cabinets',
      'european cabinets',
      'full access cabinets',
      'framed cabinets',
    ],
    searchIntent: 'Informational / comparison — homeowners deciding cabinet construction type',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'cabinet-door-styles-guide',
    title: 'Cabinet Door Styles: The Complete Visual Guide',
    seoTitle: 'Cabinet Door Styles Guide: Shaker, Slab & More',
    metaDescription:
      'The complete guide to cabinet door styles — Shaker, slab, raised-panel, beadboard, and inset — with a comparison table and how to choose for your Treasure Valley kitchen.',
    excerpt:
      'Shaker, slab, and raised-panel are the most popular cabinet door styles. Here is how each looks, which home it suits, and how to choose — with a comparison table and designer tips.',
    content: cabinetDoorStylesContent,
    author: AUTHOR,
    category: 'Kitchen Cabinets',
    hubSlug: 'kitchen-cabinets',
    tags: ['door styles', 'shaker', 'slab', 'design', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What is the most popular cabinet door style?', answer: 'Shaker is the most popular cabinet door style. Its clean recessed-panel look is versatile enough for modern, transitional, and traditional kitchens, which is why it has the broadest appeal and best resale value.' },
      { question: 'What is the difference between Shaker and slab doors?', answer: 'A Shaker door has a flat recessed center panel inside a square frame; a slab (flat-panel) door is a single unbroken flat surface with no frame or panel. Shaker reads transitional and timeless; slab reads modern and minimalist.' },
      { question: 'Which cabinet door style is best for a modern kitchen?', answer: 'Slab (flat-panel) doors are best for modern kitchens, especially in frameless construction with long seamless runs. Flat Shaker doors also work well for a slightly softer modern-transitional look.' },
      { question: 'Do cabinet door styles affect cost?', answer: 'Yes, but usually less than finish and construction. Slab and Shaker are typically the most cost-effective; raised-panel, inset, and glass-front doors add cost for extra machining and fitting.' },
      { question: 'Should cabinet doors match throughout the house?', answer: 'Coordinating one door style across the kitchen, bath, laundry, and built-ins creates a cohesive, high-end feel. You can vary finish or color between rooms while keeping the same door profile.' },
      { question: 'What door style does Boise Cabinet Co build?', answer: 'We build custom cabinets in every major door style — Shaker, slab, raised-panel, beadboard, and inset — for kitchens, baths, and built-ins across Boise, Meridian, Eagle, Nampa, and the Treasure Valley.' },
    ],
    quickAnswer:
      'The most popular cabinet door styles are Shaker (recessed panel, versatile), slab or flat-panel (modern, minimal), and raised-panel (traditional, warm). Shaker fits almost any Treasure Valley home; pick the profile that matches your architecture, then coordinate finish and hardware.',
    keyTakeaways: [
      'Shaker is the most versatile, timeless, best-resale choice.',
      'Slab is best for modern kitchens; raised-panel for traditional.',
      'Carry one door style across kitchen, bath, and built-ins for cohesion.',
    ],
    relatedLinks: [
      { url: '/guides/boise-kitchen-cabinet-guide', anchor: 'Kitchen Cabinets' },
      { url: '/door-styles', anchor: 'Door styles' },
      { url: '/blog/cabinet-hardware-guide', anchor: 'Cabinet hardware guide' },
      { url: '/finishes', anchor: 'Finishes' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'cabinet door styles',
    secondaryKeywords: ['shaker cabinets', 'slab cabinet doors', 'raised panel cabinets', 'cabinet door types'],
    searchIntent: 'Informational — homeowners choosing a cabinet door style',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'cabinet-hardware-guide',
    title: 'Cabinet Hardware Guide: Knobs, Pulls & Placement',
    seoTitle: 'Cabinet Hardware Guide: Knobs vs Pulls & Sizing',
    metaDescription:
      'How to choose cabinet hardware: knobs vs pulls, sizing, placement, finishes, and matching to your door style — a complete guide for Treasure Valley kitchens.',
    excerpt:
      'Knobs on doors, pulls on drawers — or pulls everywhere for a modern look. Here is how to size, place, and finish cabinet hardware so your kitchen feels intentional.',
    content: cabinetHardwareContent,
    author: AUTHOR,
    category: 'Kitchen Cabinets',
    hubSlug: 'kitchen-cabinets',
    tags: ['hardware', 'knobs', 'pulls', 'hinges', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'Should you use knobs or pulls on cabinets?', answer: 'The classic rule is knobs on doors and pulls on drawers, because drawers are heavier and a horizontal pull grips better. The modern approach is pulls everywhere for a consistent, easy-to-grab look. Both are correct — it comes down to the style you want.' },
      { question: 'How do you size cabinet pulls?', answer: 'A good rule is to make the pull about one-third the width of the drawer front. Small drawers take 3–4 inch pulls, wide drawers look best with 8–12 inch pulls (or two pulls), and knobs are typically 1.25–1.5 inches.' },
      { question: 'Where should cabinet hardware be placed?', answer: 'Place door hardware on the stile opposite the hinge — near the top corner on lower cabinets and the bottom corner on uppers. Center drawer pulls horizontally, and use a template so every piece lands consistently.' },
      { question: 'What is the most popular cabinet hardware finish?', answer: 'Brushed or satin nickel is the most popular because it is warm, forgiving, and hides fingerprints. Matte black is the leading modern choice, and brass or champagne bronze suits transitional and classic kitchens.' },
      { question: 'Should cabinet hardware match the faucet?', answer: 'It should coordinate, not perfectly match. Keep the same temperature (all warm or all cool metals) across hardware, faucet, and lighting; mixing finishes intentionally, like matte black and brushed nickel, can look layered and custom.' },
      { question: 'What hardware does a quality cabinet include?', answer: 'Beyond knobs and pulls, quality cabinets use six-way adjustable soft-close concealed hinges and full-extension soft-close undermount drawer glides, which keep doors and drawers aligned and quiet for years.' },
    ],
    quickAnswer:
      'Put pulls on drawers and knobs or pulls on doors, size pulls to about one-third the drawer width, and coordinate (not perfectly match) the finish with your faucet and lighting. Hardware is a small part of the budget but defines how the kitchen feels daily.',
    keyTakeaways: [
      'Pulls on drawers; knobs or pulls on doors — stay consistent.',
      'Size pulls to ~1/3 the drawer width; use a template for placement.',
      'Coordinate finish temperature across hardware, faucet, and lighting.',
    ],
    relatedLinks: [
      { url: '/guides/boise-kitchen-cabinet-guide', anchor: 'Kitchen Cabinets' },
      { url: '/hardware', anchor: 'Hardware' },
      { url: '/blog/cabinet-door-styles-guide', anchor: 'Cabinet door styles' },
      { url: '/construction', anchor: 'How we build' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'cabinet hardware guide',
    secondaryKeywords: ['knobs vs pulls', 'cabinet pulls sizing', 'cabinet hardware placement', 'cabinet handle finishes'],
    searchIntent: 'Informational — homeowners choosing and placing cabinet hardware',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'cabinet-finishes-colors-guide',
    title: 'Cabinet Finishes and Colors: The Complete Guide',
    seoTitle: 'Cabinet Finishes & Colors Guide: Paint, Stain & Trends',
    metaDescription:
      'Painted vs stained vs specialty cabinet finishes, the most popular colors, two-tone kitchens, sheen, and how to choose — a complete guide for Treasure Valley homes.',
    excerpt:
      'Painted, stained, or specialty? White, greige, or trending sage green? Here is how to choose cabinet finishes and colors that last, with a sheen chart and designer tips.',
    content: cabinetFinishesContent,
    author: AUTHOR,
    category: 'Kitchen Cabinets',
    hubSlug: 'kitchen-cabinets',
    tags: ['finishes', 'color', 'paint', 'stain', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What is the difference between painted and stained cabinets?', answer: 'Painted cabinets have a smooth, opaque, uniform finish that hides the grain and comes in unlimited colors. Stained cabinets use a translucent finish that lets the natural wood grain and character show through. Painted reads modern and clean; stained reads warm and traditional.' },
      { question: 'What is the most popular cabinet color?', answer: 'White and off-white remain the most popular for their timeless, bright look and strong resale value. Warm greige neutrals are close behind, and sage green is the leading trend color, especially on lower cabinets and islands.' },
      { question: 'Are two-tone kitchens still in style?', answer: 'Yes. Two-tone kitchens — such as white uppers with sage-green or stained-wood lowers, or a contrasting island — are one of the strongest current trends. They add depth and let you use a bolder color without overwhelming the space.' },
      { question: 'What sheen is best for kitchen cabinets?', answer: 'Satin or eggshell is the most popular because it has a subtle glow and cleans easily. Matte is on-trend and hides imperfections; semi-gloss is more durable and traditional; high-gloss is bold but shows fingerprints.' },
      { question: 'Do painted cabinets crack in a dry climate?', answer: 'Painted finishes on solid wood can show fine hairline lines at the joints as the wood expands and contracts through Idaho’s dry winters and warm summers. This is normal wood movement, not a defect. Painted engineered panels and specialty finishes stay the most uniform.' },
      { question: 'How do I choose a cabinet color?', answer: 'Order full door samples, not chips, and view them in your own kitchen morning and evening. Choose one quiet main color with an optional accent for the island or lowers, and coordinate with your countertop, backsplash, and hardware before committing.' },
    ],
    quickAnswer:
      'Cabinet finishes are painted (smooth, versatile), stained (shows wood grain), or specialty like thermofoil (durable, affordable). White and greige are the safest colors; sage green and two-tone kitchens are the strongest trends. Always sample the finish in your own kitchen light before deciding.',
    keyTakeaways: [
      'Painted = modern; stained = warm; specialty = durable value.',
      'White and greige are timeless; sage green and two-tone are trending.',
      'Sample full doors in your real kitchen light before you commit.',
    ],
    relatedLinks: [
      { url: '/guides/boise-kitchen-cabinet-guide', anchor: 'Kitchen Cabinets' },
      { url: '/finishes', anchor: 'Finishes' },
      { url: '/blog/cabinet-door-styles-guide', anchor: 'Cabinet door styles' },
      { url: '/blog/cabinet-hardware-guide', anchor: 'Cabinet hardware' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'cabinet finishes and colors',
    secondaryKeywords: ['kitchen cabinet colors', 'painted vs stained cabinets', 'sage green cabinets', 'two tone kitchen cabinets'],
    searchIntent: 'Informational — homeowners choosing cabinet finish and color',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'stock-vs-custom-cabinets-boise',
    title: 'Stock vs Custom Cabinets: Which Is Right for You?',
    seoTitle: 'Stock vs Custom Cabinets: Cost, Fit & How to Choose',
    metaDescription:
      'Stock vs semi-custom vs custom cabinets compared — cost, fit, quality, and lead time — plus how to choose for your Treasure Valley kitchen.',
    excerpt:
      'Stock is cheapest and fastest; custom fits your space exactly; semi-custom splits the difference. Here is how to choose, with a full comparison table and a quality warning.',
    content: stockVsCustomContent,
    author: AUTHOR,
    category: 'Choosing a Cabinet Company',
    hubSlug: 'choosing-cabinet-company',
    tags: ['stock', 'custom', 'semi-custom', 'compare', 'boise'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What is the difference between stock and custom cabinets?', answer: 'Stock cabinets are pre-built in fixed standard sizes and finishes; custom cabinets are built to your exact dimensions, layout, and finish with no size limits. Stock is cheapest and fastest but requires filler strips where sizes do not line up, while custom fits your space precisely and lets you specify construction quality.' },
      { question: 'Are custom cabinets worth the extra cost?', answer: 'For a home you will keep 10 or more years, or a space with tricky walls, tall ceilings, or a specific look, custom is usually worth it for the exact fit, maximized storage, and higher construction quality. For short-term or standard-layout projects, stock or semi-custom can be the smarter value.' },
      { question: 'What are semi-custom cabinets?', answer: 'Semi-custom cabinets start from standard catalog sizes but allow door styles, finishes, and modifications like added depth, height, or roll-outs. They are the popular middle ground — more fit and personality than stock, at a lower cost and shorter lead time than full custom.' },
      { question: 'Do custom cabinets take longer?', answer: 'Yes. Because each piece is made to order, custom cabinets have the longest lead time, followed by semi-custom, with stock the fastest. A good cabinet company builds a realistic timeline into your project plan from the start.' },
      { question: 'Does custom always mean higher quality?', answer: 'No. Custom is about fit and options, not automatically about quality — there are well-built semi-custom lines and poorly built custom shops. Whatever tier you choose, inspect the box material, drawer-box construction, and hinges to judge real quality.' },
      { question: 'Which cabinet tier is best for resale?', answer: 'Well-built semi-custom or custom cabinets in a timeless door and neutral finish appeal to the widest pool of buyers. Very cheap stock cabinets can read as a downgrade to buyers, so if resale matters, prioritize fit and construction over the lowest price.' },
    ],
    quickAnswer:
      'Stock cabinets are pre-built, fixed-size, and cheapest; semi-custom adds finish and modification options; custom is built to your exact dimensions with unlimited finishes and the best construction. Choose based on budget, layout, look, and how long you will keep the kitchen — custom usually wins for long-term homes and tricky spaces.',
    keyTakeaways: [
      'Stock = budget/standard layouts; custom = exact fit and best quality.',
      'Semi-custom is the popular middle ground for most kitchens.',
      'Tier is about fit and options — always judge construction separately.',
    ],
    relatedLinks: [
      { url: '/guides/choose-cabinet-company-boise', anchor: 'Choosing a Cabinet Company' },
      { url: '/compare', anchor: 'Compare our cabinets' },
      { url: '/blog/cabinet-construction-quality-guide', anchor: 'Cabinet construction quality' },
      { url: '/guides/boise-cabinet-cost-guide', anchor: 'Boise Cabinet Cost Guide' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'stock vs custom cabinets',
    secondaryKeywords: ['semi-custom cabinets', 'custom cabinets cost', 'are custom cabinets worth it', 'stock cabinets'],
    searchIntent: 'Commercial / comparison — homeowners choosing a cabinet tier',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'cabinet-construction-quality-guide',
    title: 'Cabinet Construction Quality: How to Judge a Well-Built Cabinet',
    seoTitle: 'Cabinet Construction Quality: How to Judge a Cabinet',
    metaDescription:
      'How to judge cabinet quality — plywood boxes, dovetailed drawers, soft-close hinges, and joinery. A hands-on inspection guide for Treasure Valley homeowners.',
    excerpt:
      'A well-built cabinet is about the box, drawers, hinges, and joinery — not just the door. Here is exactly what to inspect, with a 60-second quality check and a comparison table.',
    content: cabinetConstructionContent,
    author: AUTHOR,
    category: 'Choosing a Cabinet Company',
    hubSlug: 'choosing-cabinet-company',
    tags: ['construction', 'quality', 'plywood', 'drawers', 'boise'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What makes a cabinet high quality?', answer: 'High-quality cabinets use a 3/4-inch plywood box, solid-wood dovetailed drawer boxes on full-extension soft-close undermount glides, six-way adjustable soft-close hinges, and solid joinery with a substantial back panel. These details matter far more than the door style or finish.' },
      { question: 'Is plywood or particleboard better for cabinets?', answer: 'Plywood is better. Three-quarter-inch furniture-grade plywood holds screws securely, resists moisture, and stays square under a stone countertop, while particleboard can swell if it gets wet, strip out at screws, and sag over time.' },
      { question: 'How can I tell if a drawer box is good quality?', answer: 'Open the drawer: a quality box is solid wood joined with dovetails, riding on full-extension soft-close undermount glides. Stapled or glued particleboard drawer boxes loosen and sag over years, so dovetailed solid-wood drawers are the clearest sign of quality.' },
      { question: 'What are six-way adjustable hinges?', answer: 'Six-way adjustable hinges let an installer align a door in three planes — height, depth, and side to side — so every door lines up perfectly, and you can fine-tune them years later. Cheap fixed hinges cannot be adjusted, so doors drift out of alignment.' },
      { question: 'Why do two cabinet quotes differ so much in price?', answer: 'The gap almost always lives in construction you cannot see — box material, drawer-box construction, and hinge quality. Ask both companies to put those specs in writing so you are comparing equivalent cabinets, not just headline prices.' },
      { question: 'Does construction matter more than the door style?', answer: 'Yes. Finishes and door styles can be refreshed later, but the box, drawers, and hardware are the bones of the cabinet and are not easily changed. Prioritize construction quality first, then choose the door and finish you love.' },
    ],
    quickAnswer:
      'Judge a cabinet by its 3/4-inch plywood box, solid-wood dovetailed drawer boxes on full-extension soft-close glides, six-way adjustable soft-close hinges, and solid joinery with a full back panel. These details decide whether cabinets last 15 to 20 years — ask for them in writing when comparing quotes.',
    keyTakeaways: [
      'Plywood box beats particleboard; dovetailed solid-wood drawers beat stapled.',
      'Six-way adjustable soft-close hinges and full-extension glides are must-haves.',
      'Get box, drawer, and hinge specs in writing to compare quotes fairly.',
    ],
    relatedLinks: [
      { url: '/guides/choose-cabinet-company-boise', anchor: 'Choosing a Cabinet Company' },
      { url: '/construction', anchor: 'How we build' },
      { url: '/blog/stock-vs-custom-cabinets-boise', anchor: 'Stock vs custom cabinets' },
      { url: '/warranty', anchor: 'Warranty' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'cabinet construction quality',
    secondaryKeywords: ['plywood vs particleboard cabinets', 'dovetail drawer boxes', 'well built cabinets', 'how to judge cabinet quality'],
    searchIntent: 'Informational — homeowners evaluating cabinet quality',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'cabinet-cost-per-linear-foot',
    title: 'Cabinet Cost Per Linear Foot in Boise: What It Really Means',
    seoTitle: 'Cabinet Cost Per Linear Foot in Boise (2026 Ranges)',
    metaDescription:
      'What cabinet cost per linear foot means, Treasure Valley ranges by tier, why it varies, and how to estimate your kitchen accurately (not just a per-foot guess).',
    excerpt:
      'Cabinet cost per linear foot is a quick ballpark — roughly $300–$900+ installed for custom in Boise. Here is what it measures, why it varies, and how to estimate accurately.',
    content: costPerLinearFootContent,
    author: AUTHOR,
    category: 'Boise Cabinet Costs',
    hubSlug: 'cabinet-costs',
    tags: ['cost', 'linear foot', 'budget', 'boise', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What does cabinet cost per linear foot mean?', answer: 'It is a pricing shorthand: you measure the total horizontal length of your cabinet runs in feet and multiply by a per-foot rate. It gives a quick ballpark for cabinetry cost but does not account for the mix of drawers, specialty cabinets, finish, and hardware that move the real price.' },
      { question: 'How much do cabinets cost per linear foot in Boise?', answer: 'As a rough guide in the Treasure Valley, stock runs about $150–$300 per foot installed, semi-custom about $300–$550, and custom about $500–$900 or more, depending on construction, finish, and accessories. These are planning ranges, not quotes.' },
      { question: 'Why does per-linear-foot cost vary so much?', answer: 'Two kitchens of the same length can cost very differently based on how many drawers versus doors you have, tall and specialty cabinets, box construction, finish, door style, hardware, and install complexity. That is why the same rate can hide very different cabinets.' },
      { question: 'Is per-linear-foot a reliable way to compare quotes?', answer: 'Not by itself. One per-foot rate may include plywood boxes and soft-close everything, while another at the same rate includes particleboard and basic hardware. Always compare what is actually in the price, meaning construction, finish, and accessories, not just the headline number.' },
      { question: 'How do I estimate my cabinet cost?', answer: 'Measure your base-cabinet runs in feet, multiply by a per-foot rate for your tier, then add for tall or specialty cabinets, an island, and premium finish or hardware. For an accurate figure, use a guided estimator or an in-home design visit that accounts for the details.' },
      { question: 'What does per-linear-foot pricing leave out?', answer: 'It covers cabinetry only. Countertops, sink and faucet, backsplash, appliances, lighting, and any electrical or plumbing changes are separate. Budget those in their own bucket so nothing surprises you.' },
    ],
    quickAnswer:
      'Cabinet cost per linear foot is a ballpark: measure the length of your cabinet runs and multiply by a rate — roughly $300 to $900+ per foot installed for custom in the Boise area. It is useful for a first estimate, but drawers, specialty cabinets, finish, and hardware swing the real number, so confirm with a design.',
    keyTakeaways: [
      'Per-linear-foot is a ballpark, not a quote.',
      'Boise custom commonly runs ~$300–$900+ per foot installed.',
      'Drawers, specialty cabinets, construction, and finish move the real price.',
    ],
    relatedLinks: [
      { url: '/guides/boise-cabinet-cost-guide', anchor: 'Boise Cabinet Cost Guide' },
      { url: '/estimate', anchor: 'Online estimator' },
      { url: '/blog/stock-vs-custom-cabinets-boise', anchor: 'Stock vs custom cabinets' },
      { url: '/blog/cabinet-construction-quality-guide', anchor: 'Cabinet construction quality' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'cabinet cost per linear foot',
    secondaryKeywords: ['kitchen cabinet cost per foot', 'cabinet pricing boise', 'how much do cabinets cost', 'custom cabinet cost'],
    searchIntent: 'Commercial / cost — homeowners budgeting cabinets',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'what-are-rta-cabinets',
    title: 'What Are RTA Cabinets? (Pros, Cons & Alternatives)',
    seoTitle: 'What Are RTA Cabinets? Pros, Cons & How to Choose',
    metaDescription:
      'RTA (ready-to-assemble) cabinets explained: what they are, the pros and cons, how to judge quality, cost, and when custom is the better choice.',
    excerpt:
      'RTA cabinets ship flat and you assemble them to save money. Here is how they work, their real pros and cons, how to judge quality, and when custom is worth it instead.',
    content: rtaCabinetsContent,
    author: AUTHOR,
    category: 'Kitchen Cabinets',
    hubSlug: 'kitchen-cabinets',
    tags: ['rta', 'ready to assemble', 'budget', 'compare', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What does RTA mean for cabinets?', answer: 'RTA stands for ready-to-assemble. The cabinets ship flat in a box as a kit of panels, doors, and hardware, and you or an installer assemble each cabinet on site using included dowels, cam locks, and screws before mounting them.' },
      { question: 'Are RTA cabinets good quality?', answer: 'It varies widely. RTA spans everything from solid plywood boxes with dovetailed drawers to flimsy particleboard held together with staples. Judge each line by its box material, drawer construction, and hinges rather than assuming RTA is either good or bad.' },
      { question: 'Are RTA cabinets cheaper than custom?', answer: 'Yes, significantly. Because you assemble them yourself and flat-packing lowers shipping costs, RTA is usually the least expensive option and a fraction of the price of custom cabinets built to your exact space.' },
      { question: 'How long do RTA cabinets take to assemble?', answer: 'Each cabinet typically takes 20 to 45 minutes, so a full kitchen is a weekend-or-more project. Keeping every box perfectly square is critical, since an out-of-square cabinet will hang crooked and throw off the doors.' },
      { question: 'Who should buy RTA cabinets?', answer: 'RTA suits tight budgets, standard layouts, rentals and flips, and homeowners comfortable with careful assembly. It is less ideal for out-of-square walls, tall ceilings, specific finishes, or anyone who does not want to build cabinets themselves.' },
      { question: 'What is the alternative to RTA cabinets?', answer: 'The main alternative is custom (or semi-custom) cabinets, which are built to your exact dimensions, come pre-assembled and professionally installed, and let you specify premium construction and finishes. Custom costs more but delivers an exact fit and longer life.' },
    ],
    quickAnswer:
      'RTA (ready-to-assemble) cabinets ship flat and you assemble them yourself to save money. They suit tight budgets, standard layouts, and DIY-comfortable homeowners, but quality varies widely and sizes are fixed. For an exact fit and premium construction, custom cabinets are the better long-term value.',
    keyTakeaways: [
      'RTA = flat-pack cabinets you assemble to save money.',
      'Quality ranges from excellent to poor — inspect box, drawers, hinges.',
      'Best for budget/standard layouts; custom wins for fit and longevity.',
    ],
    relatedLinks: [
      { url: '/guides/boise-kitchen-cabinet-guide', anchor: 'Kitchen Cabinets' },
      { url: '/compare', anchor: 'Compare our cabinets' },
      { url: '/blog/stock-vs-custom-cabinets-boise', anchor: 'Stock vs custom cabinets' },
      { url: '/blog/cabinet-construction-quality-guide', anchor: 'Cabinet construction quality' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'what are rta cabinets',
    secondaryKeywords: ['rta cabinets', 'ready to assemble cabinets', 'rta vs custom cabinets', 'are rta cabinets good'],
    searchIntent: 'Informational — homeowners researching RTA cabinets',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'custom-kitchen-cabinet-cost',
    title: 'How Much Do Custom Kitchen Cabinets Cost? (2026 Guide)',
    seoTitle: 'How Much Do Custom Kitchen Cabinets Cost? (2026)',
    metaDescription:
      'Custom kitchen cabinets cost about $500–$1,200+ per linear foot, or $15,000–$45,000+ for a kitchen. What drives the price, tier comparison, and how to estimate.',
    excerpt:
      'Custom kitchen cabinets run about $15,000–$45,000+ installed. Here is what drives the cost, how tiers compare, whether custom is worth it, and how to estimate your project.',
    content: customCabinetCostContent,
    author: AUTHOR,
    category: 'Boise Cabinet Costs',
    hubSlug: 'cabinet-costs',
    tags: ['cost', 'custom', 'budget', 'kitchen', 'boise'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'How much do custom kitchen cabinets cost?', answer: 'Custom kitchen cabinets typically cost about $500 to $1,200 or more per linear foot installed, which puts a full custom kitchen in the range of roughly $15,000 to $45,000+ depending on size, materials, finish, and complexity.' },
      { question: 'What drives the cost of custom cabinets?', answer: 'The biggest factors are the size of the kitchen, construction quality (plywood boxes and dovetailed drawers cost more), finish (painted and specialty finishes cost more than basic stain), door style, and the number of drawers and specialty cabinets. Layout complexity and installation also add labor.' },
      { question: 'Are custom kitchen cabinets worth the money?', answer: 'For a home you will keep 10 or more years, custom is usually worth it for the exact fit, maximized storage, finish you love, and construction that lasts. For short-term homes or standard layouts on a tight budget, stock or semi-custom can be the smarter financial choice.' },
      { question: 'What is included in a custom cabinet price?', answer: 'A complete price generally includes the cabinets, door style and finish, hardware, delivery, and professional installation. It usually does not include countertops, sink and faucet, backsplash, appliances, lighting, or electrical and plumbing changes.' },
      { question: 'How can I lower my custom cabinet cost?', answer: 'Invest in construction and the cabinets you use most, choose a timeless door style and a standard-but-beautiful finish over exotic options, keep the layout efficient, and consider phasing extras like accessories or an island upgrade for later.' },
      { question: 'How do I get an accurate cabinet estimate?', answer: 'Measure your base-cabinet runs and multiply by a per-foot rate for your tier, then add for an island, tall cabinets, and premium finish or hardware. For accuracy, use a guided online estimator or an in-home design visit that produces a written scope.' },
    ],
    quickAnswer:
      'Custom kitchen cabinets typically cost $500 to $1,200+ per linear foot installed, or roughly $15,000 to $45,000+ for a full kitchen, depending on size, construction, finish, and specialty cabinets. The most accurate number comes from a design and a written scope.',
    keyTakeaways: [
      'Custom runs ~$500–$1,200+ per linear foot, ~$15k–$45k+ per kitchen.',
      'Size, construction, finish, and specialty cabinets drive the price.',
      'Spend on the bones and daily-use cabinets; be selective on extras.',
    ],
    relatedLinks: [
      { url: '/guides/boise-cabinet-cost-guide', anchor: 'Boise Cabinet Cost Guide' },
      { url: '/estimate', anchor: 'Online estimator' },
      { url: '/blog/cabinet-cost-per-linear-foot', anchor: 'Cost per linear foot' },
      { url: '/blog/stock-vs-custom-cabinets-boise', anchor: 'Stock vs custom cabinets' },
      { url: '/cabinets/kitchen' },
    ],
    primaryKeyword: 'custom kitchen cabinet cost',
    secondaryKeywords: ['how much do custom cabinets cost', 'cost of custom kitchen cabinets', 'custom cabinet price', 'kitchen cabinet cost 2026'],
    searchIntent: 'Commercial / cost — homeowners budgeting custom cabinets',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'standard-kitchen-cabinet-sizes',
    title: 'Standard Kitchen Cabinet Sizes and Dimensions (Charts)',
    seoTitle: 'Standard Kitchen Cabinet Sizes & Dimensions (Charts)',
    metaDescription:
      'Standard kitchen cabinet sizes: base, wall, and tall cabinet dimensions, widths, mounting heights, and clearances — with charts and when to go custom.',
    excerpt:
      'Base cabinets are 24" deep and 34.5" tall; wall cabinets 12" deep; tall cabinets 84–96". Here are the standard kitchen cabinet dimensions with charts, plus clearances and when custom sizing wins.',
    content: standardCabinetSizesContent,
    author: AUTHOR,
    category: 'Kitchen Cabinets',
    hubSlug: 'kitchen-cabinets',
    tags: ['sizes', 'dimensions', 'base cabinets', 'wall cabinets', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What is the standard depth of kitchen base cabinets?', answer: 'Standard base cabinets are 24 inches deep (about 25 inches with the countertop overhang) and 34.5 inches tall, which becomes 36 inches once a typical countertop is added.' },
      { question: 'What are standard wall cabinet dimensions?', answer: 'Standard wall (upper) cabinets are 12 inches deep and come in 30, 36, or 42 inch heights, mounted about 18 inches above the countertop. Deeper 15- or 24-inch uppers are used over refrigerators and in some designs.' },
      { question: 'How tall are kitchen cabinets?', answer: 'Base cabinets are 34.5 inches tall (36 with counter). Wall cabinets are 30 to 42 inches tall and mounted 18 inches above the counter. Tall pantry and utility cabinets run 84 to 96 inches to suit 8- to 9-foot ceilings.' },
      { question: 'What increments do cabinet widths come in?', answer: 'Standard cabinet widths step in 3-inch increments, typically from 9 to 48 inches (9, 12, 15, 18, and so on), so designers can combine cabinets to fill a run. Custom cabinets can be built to any width.' },
      { question: 'How much space should be between cabinets and an island?', answer: 'Allow at least 36 to 42 inches of walkway, and 42 to 48 inches between opposing cabinet runs or an island, so drawers, doors, and appliances can open comfortably and two people can pass.' },
      { question: 'When should I use custom cabinet sizes instead of standard?', answer: 'Custom sizing is worth it when your ceilings are tall, your walls are out of square, you have a bump-out or awkward window, or you want a cabinet no stock line offers. Custom eliminates filler gaps and uses every inch of an unusual space.' },
    ],
    quickAnswer:
      'Standard base cabinets are 24 inches deep and 34.5 inches tall (36 with counter); wall cabinets are 12 inches deep and 30 to 42 inches tall, mounted 18 inches above the counter; tall cabinets run 84 to 96 inches. Widths step in 3-inch increments, and custom cabinets can be any size for a perfect fit.',
    keyTakeaways: [
      'Base: 24" deep, 34.5" tall; Wall: 12" deep, 30–42" tall; Tall: 84–96".',
      'Widths come in 3" increments; uppers mount 18" above the counter.',
      'Custom sizing fits tall ceilings and odd walls that standards cannot.',
    ],
    relatedLinks: [
      { url: '/guides/boise-kitchen-cabinet-guide', anchor: 'Kitchen Cabinets' },
      { url: '/cabinets/kitchen', anchor: 'Kitchen cabinets' },
      { url: '/blog/cabinet-door-styles-guide', anchor: 'Cabinet door styles' },
      { url: '/estimate', anchor: 'Plan your kitchen' },
      { url: '/cabinets' },
    ],
    primaryKeyword: 'standard kitchen cabinet sizes',
    secondaryKeywords: ['kitchen cabinet dimensions', 'base cabinet dimensions', 'wall cabinet height', 'standard cabinet sizes'],
    searchIntent: 'Informational — homeowners planning kitchen cabinet dimensions',
    wordCountTarget: 'pillar',
  },
];
