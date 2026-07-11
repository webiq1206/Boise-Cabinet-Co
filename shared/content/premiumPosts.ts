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
];
