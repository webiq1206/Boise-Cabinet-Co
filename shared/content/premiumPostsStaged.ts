/**
 * STAGED premium blog posts — written ahead while the image-generation MCP
 * workspace is out of credits (2026-07-12). These are complete, validated
 * BlogPostData objects, but they are intentionally NOT imported anywhere, so
 * nothing renders with a placeholder image.
 *
 * TO SHIP each post when image credits return:
 *   1. Generate its featured image using the IMAGE PROMPT noted above the object
 *      (keep the authentic/varied/relevant standard — see feedback-image-variety).
 *   2. Download → build 1600x900 png + 1920x1080 webp bases in public/images/blog/.
 *   3. Move the content const + object into shared/content/premiumPosts.ts (the
 *      PREMIUM_POSTS array), and add its registry ENTRY (source:"blog") in
 *      scripts/generate-blog-image-registry.mjs, bumping EXPECTED_BLOG by 1.
 *   4. Run images:variants + images:blur + images:blog + og:generate:force <slug>.
 *   5. verify-content, then commit + push to main.
 *
 * All six below already clear 1,600 words and the SEO checklist (verified via a
 * standalone word/link/H2 pass; verify-content only checks shipped posts).
 */
import type { BlogPostData } from '../blogContent';

const AUTHOR = 'Boise Cabinet Co';

/* ============================================================================
 * 1) inset-vs-overlay-cabinets
 * IMAGE PROMPT: Authentic professional real-estate photograph of a real,
 * completed upscale kitchen in a Treasure Valley Idaho home with crisp white
 * painted INSET cabinets (doors sitting flush within the face frame, visible
 * small even reveals and exposed knife-hinges), classic beaded-inset detail,
 * polished nickel knobs and bin latches, white marble counters, a farmhouse
 * sink. Warm natural window light, true-to-life, full-frame DSLR. Not a render,
 * not CGI, not a stock photo. No people, no text, no watermarks.
 * ========================================================================== */
const insetVsOverlayContent = `
<p class="text-lg">The difference between inset and overlay cabinets is where the door sits relative to the cabinet frame: <strong>inset doors sit flush inside the face frame, while overlay doors sit on top of (over) the frame</strong>. Inset is the classic, tailored, higher-cost look with a furniture-like precision; overlay — especially full overlay — is the more common, more affordable choice that maximizes door size and gives a cleaner, more modern face. Neither is "better"; they suit different styles, budgets, and priorities. Here is exactly how they differ in look, cost, storage, and durability, so you can choose the right one for your kitchen.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Inset doors sit flush inside the frame (tailored, premium, higher cost); overlay doors sit over the frame (common, affordable, more storage). Inset suits classic kitchens, overlay suits most budgets and modern looks. <a href="/blog/framed-vs-frameless-cabinets">See framed vs frameless</a> or <a href="/estimate">plan your project</a>.</p>
</div>

<h2 id="what-is">What inset and overlay actually mean</h2>
<p>Both terms describe how the door and drawer front relate to the cabinet's face frame — the flat frame across the front of a framed cabinet box. With <strong>inset</strong> construction, the doors and drawer fronts are set inside the frame opening, sitting flush with the frame so the whole face is one smooth plane, like fine furniture. With <strong>overlay</strong> construction, the doors sit on top of the frame and cover part or all of it. Overlay comes in two forms: <strong>partial overlay</strong>, where the doors cover only part of the frame and leave a visible band of frame between doors, and <strong>full overlay</strong>, where the doors cover almost the entire frame with only a thin reveal between them. These three — inset, partial overlay, and full overlay — are the main ways a door can meet a framed cabinet, and the choice sets much of the kitchen's character.</p>

<h2 id="inset">Inset cabinets: the tailored classic</h2>
<p>Inset is the oldest and most precise style, prized for its clean, built-in-furniture look. Because each door is fitted flush within its opening, inset cabinets have a crisp, tailored appearance with even reveals all around — a hallmark of high-end, traditional, and transitional kitchens. That precision comes at a price: inset requires more skilled labor and tighter tolerances to build, since every door must fit its opening exactly, and wood movement across seasons has to be accounted for. Inset is therefore the most expensive of the three options. It is also where you often see beautiful details like beaded frames and exposed decorative hinges. If you want a timeless, elevated, furniture-quality look and the budget allows, inset delivers a refinement the overlay styles cannot quite match.</p>

<h2 id="overlay">Overlay cabinets: common and versatile</h2>
<p>Overlay is the dominant style in kitchens today because it is more affordable and more forgiving to build while still looking great. <strong>Full overlay</strong> has become especially popular: with doors covering nearly the whole frame and only a thin reveal between them, it delivers a clean, contemporary, almost frameless look on a framed box — the best of both worlds for many homeowners. <strong>Partial overlay</strong>, the traditional builder-grade standard, leaves more frame showing between doors; it is the most economical option and perfectly serviceable, though it reads as more basic. Because overlay doors do not have to fit precisely inside an opening, they are less labor-intensive and less sensitive to wood movement, which keeps costs down. For most kitchens and budgets, overlay — particularly full overlay — is the practical, attractive default.</p>

<h2 id="comparison">Inset vs overlay at a glance</h2>
<table>
  <thead><tr><th>Feature</th><th>Inset</th><th>Full overlay</th><th>Partial overlay</th></tr></thead>
  <tbody>
    <tr><td>Door position</td><td>Flush inside frame</td><td>Covers most of frame</td><td>Covers part of frame</td></tr>
    <tr><td>Look</td><td>Tailored, furniture-like</td><td>Clean, modern</td><td>Traditional, basic</td></tr>
    <tr><td>Cost</td><td>Highest</td><td>Mid to high</td><td>Lowest</td></tr>
    <tr><td>Storage access</td><td>Slightly reduced</td><td>Generous</td><td>Generous</td></tr>
    <tr><td>Best for</td><td>Classic, high-end kitchens</td><td>Most kitchens, modern looks</td><td>Budget projects</td></tr>
  </tbody>
</table>

<h2 id="storage">Storage and access differences</h2>
<p>The way the door meets the frame affects how much you can fit and reach. With <strong>inset</strong>, because the door sits inside the frame, the opening is slightly smaller and the frame edges intrude a bit more into the access — a minor reduction in usable opening, most noticeable for wide items and pull-outs. With <strong>overlay</strong>, especially full overlay, the doors cover the frame and the openings feel more generous, giving easier access to the interior and to drawers and roll-outs. The practical difference is modest in most kitchens, but if maximizing every inch of access and fitting large pull-outs matters to you, overlay has a slight edge. It is one reason frameless (which has no face frame at all) and full overlay have grown popular in storage-focused modern kitchens. See our <a href="/blog/framed-vs-frameless-cabinets">framed vs frameless guide</a> for the related comparison.</p>

<h2 id="cost">The cost difference</h2>
<p>Cost is often the deciding factor. <strong>Partial overlay</strong> is the least expensive, which is why it has long been the builder-grade standard. <strong>Full overlay</strong> costs a bit more for its cleaner look but remains affordable and mainstream. <strong>Inset</strong> is the most expensive by a meaningful margin — often significantly more than overlay — because of the precise fitting, extra labor, and tighter tolerances it demands. If you love the inset look but not the price, full overlay is the common compromise: it captures much of the clean, tailored feel at a fraction of the upcharge. As always, the door-to-frame style is only one factor in total cost, alongside construction quality, materials, and whether the cabinets are stock, semi-custom, or custom. Our <a href="/blog/custom-kitchen-cabinet-cost">custom cabinet cost guide</a> puts it in context.</p>

<h2 id="durability">Durability and seasonal movement</h2>
<p>Both styles are durable when well built, but they behave a little differently. Inset doors, fitted precisely within their openings, can be more sensitive to seasonal wood movement — in very humid or very dry conditions, a solid-wood inset door can swell or shrink enough to affect the fit, which is why quality inset construction and stable materials matter. Overlay doors, sitting over the frame rather than inside it, have more tolerance for movement since a slight change in size does not affect how they close. In practice, a well-built inset kitchen from a quality shop performs beautifully for decades, but it is worth knowing that inset asks more of the builder and the materials. For either style, quality boxes, hinges, and finish are what determine how the kitchen holds up. See our <a href="/blog/cabinet-construction-quality-guide">construction quality guide</a>.</p>

<h2 id="hardware">Hardware, hinges, and details</h2>
<p>The door-to-frame style also shapes the hardware and detailing that complete the look. <strong>Inset cabinets</strong> often showcase beautiful traditional details: exposed decorative hinges (sometimes butt hinges or knife hinges that are part of the aesthetic), a beaded frame around each opening, and classic knobs and bin latches that suit the tailored, furniture-like feel. Because the door sits flush, everything about an inset cabinet reads as crafted and intentional, and homeowners often lean into that with period-appropriate hardware. <strong>Overlay cabinets</strong>, by contrast, use concealed hinges hidden behind the doors, which suits their cleaner, more modern face and lets long minimalist pulls or simple knobs take center stage. Full overlay in particular pairs beautifully with contemporary hardware for a sleek look. Neither approach is better, but knowing that inset invites classic, visible detailing while overlay favors clean, concealed hardware helps you picture the finished kitchen — and it is worth choosing the hardware in step with the door-to-frame style so the whole cabinet reads as one coherent design rather than a mismatch of eras.</p>

<h2 id="style">Which style suits your kitchen?</h2>
<p>The right choice comes down to look, budget, and priorities. Choose <strong>inset</strong> if you want a classic, tailored, furniture-quality kitchen with the finest detailing and you have the budget for it — it shines in traditional, transitional, and high-end homes. Choose <strong>full overlay</strong> if you want a clean, current look with generous storage at a mainstream price — it suits the majority of kitchens, modern and transitional alike. Choose <strong>partial overlay</strong> if budget is the top priority and you are comfortable with a more traditional, basic appearance. Because the door style pairs with your door design (Shaker, slab, raised panel) and finish, think about the whole look together. For most homeowners, full overlay is the sweet spot; for those chasing a timeless premium kitchen, inset is worth the investment. See our <a href="/blog/cabinet-door-styles-guide">door styles guide</a>.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>Inset and overlay describe where a cabinet door sits relative to the face frame — flush inside it (inset) or over it (overlay). Inset is the tailored, furniture-quality classic with the highest cost and the finest detailing; full overlay is the clean, modern, storage-friendly mainstream choice; and partial overlay is the economical, traditional standard. None is universally best — inset rewards a classic kitchen and a bigger budget, while overlay serves most homes beautifully and affordably. Decide based on the look you love, the storage you want, and what you can spend, and pair it with a door style and finish that complete the kitchen you are after. And remember that the door-to-frame style is just one of several decisions — the box construction, the wood, and the finish all shape the final result as much as whether the door sits inside or over the frame, so weigh inset versus overlay as one part of a coherent whole rather than in isolation.</p>

<h2 id="how-we-build">Build it right with Boise Cabinet Co</h2>
<p>${AUTHOR} builds custom <a href="/cabinets/kitchen">kitchen cabinets</a> in inset, full overlay, and partial overlay — with the quality boxes, hinges, and finishes that make each style perform — for homes across Boise, Meridian, Eagle, and Nampa. Explore <a href="/catalog">our door styles and finishes</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free in-home consultation</a>. We will walk you through the look, cost, and storage trade-offs of inset versus overlay and build the style that fits your kitchen and budget, with the craftsmanship to last for decades.</p>
`;

/* ============================================================================
 * 2) white-vs-greige-vs-off-white-cabinets
 * IMAGE PROMPT: Authentic professional real-estate photograph of a real,
 * completed kitchen in a mid-range Treasure Valley Idaho home with warm
 * off-white / creamy painted Shaker cabinets and a subtly greige-toned island,
 * brushed brass hardware, warm white quartz counters, a natural stone
 * backsplash, warm wood floors. Warm natural window light, true-to-life,
 * full-frame DSLR. Not a render, not CGI, not a stock photo. No people, no text.
 * ========================================================================== */
const whiteGreigeContent = `
<p class="text-lg">White, off-white, and greige are the three most popular neutral cabinet colors, and the difference comes down to warmth and undertone: <strong>white is the brightest and cleanest, off-white (cream) adds warmth and softness, and greige (gray-beige) is the deepest and most versatile of the three</strong>. All three are timeless and resale-friendly; the right one depends on your kitchen's light, your counters and floors, and how warm you want the room to feel. Here is exactly how they compare, how to choose between them, and how to avoid the undertone mistakes that trip people up.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> White is brightest and crispest, off-white adds cozy warmth, greige (gray-beige) is the most versatile deeper neutral. All three are timeless. Match to your light and undertones, and always test samples. <a href="/blog/best-kitchen-cabinet-colors">See all cabinet colors</a> or <a href="/cabinets/kitchen">explore kitchen cabinets</a>.</p>
</div>

<h2 id="white">White cabinets</h2>
<p>White is the brightest, cleanest, and most popular cabinet color, and it remains the timeless default for good reason: it makes a kitchen feel open and airy, pairs with any counter and backsplash, and appeals to the widest range of buyers. The nuance is that "white" spans a range from cool, stark bluish whites to soft, warm whites — and for today's kitchens, warmer whites are the trend, since the cold stark whites of the past can feel clinical. A crisp white is ideal if you want maximum brightness and a clean, classic backdrop, especially in kitchens that get plenty of light. It is the safest, most flexible choice, though it shows everyday life (smudges, splatters) a little more than a warmer or deeper neutral.</p>

<h2 id="offwhite">Off-white and cream</h2>
<p>Off-white and cream are white with warmth added — a soft, creamy tone that feels cozier and less stark than pure white while keeping much of its brightness. These shades suit homeowners who love the light, timeless quality of white but find true white too cold or sterile. Off-white flatters warm elements beautifully — wood floors, brass hardware, natural stone — and gives a kitchen a soft, inviting, slightly traditional feel. It also hides everyday life a touch better than stark white. The main thing to watch is that cream reads distinctly warm, so it pairs best with warm-toned counters and finishes; against very cool grays and stark whites elsewhere in the room, it can look yellowed. Chosen with warm surroundings, off-white is a soft, elegant, timeless choice.</p>

<h2 id="greige">Greige</h2>
<p>Greige — a blend of gray and beige — is the deepest and arguably most versatile of the three neutrals, and it has become a go-to for exactly that reason. It bridges warm and cool: the gray keeps it current and sophisticated, while the beige keeps it warm and inviting, so it pairs with an unusually wide range of counters, floors, and backsplashes. Greige gives a kitchen more depth and a calm, grounded feel than white or cream, without committing to a real color. It also hides everyday life better than lighter neutrals. Because greige leans slightly warmer or cooler depending on the specific shade and your light, the key is choosing the version whose undertone suits your room. For "neutral but not boring," greige is often the sweet spot.</p>

<h2 id="comparison">How they compare</h2>
<table>
  <thead><tr><th>Color</th><th>Warmth</th><th>Brightness</th><th>Best with</th><th>Hides wear</th></tr></thead>
  <tbody>
    <tr><td>White</td><td>Cool to neutral</td><td>Brightest</td><td>Anything; cooler palettes</td><td>Least</td></tr>
    <tr><td>Off-white / cream</td><td>Warm</td><td>Bright</td><td>Wood, brass, warm stone</td><td>Moderate</td></tr>
    <tr><td>Greige</td><td>Balanced (warm-cool)</td><td>Medium</td><td>Almost anything</td><td>Most</td></tr>
  </tbody>
</table>

<h2 id="undertones">Understanding undertones</h2>
<p>The single most important — and most overlooked — factor in choosing among neutrals is undertone. Every white, cream, and greige has a subtle underlying tone: whites can lean blue, gray, yellow, or pink; creams lean yellow or beige; greiges lean warmer (more beige) or cooler (more gray). These undertones are what make a color look "right" or subtly "off" in a room, because they either harmonize or clash with the undertones of your counters, floors, and backsplash. A cream with a yellow undertone can look dingy next to a cool gray quartz; a greige that leans too gray can feel cold against warm wood floors. Identifying the undertone of both your cabinets and your fixed elements — and making sure they agree — is the secret to a neutral kitchen that looks intentional rather than mismatched.</p>

<h2 id="light">How light changes everything</h2>
<p>Natural and artificial light dramatically shift how these neutrals read, which is why testing in your own kitchen is non-negotiable. North-facing kitchens get cool, indirect light that can make cool whites feel gray and flat, so a warmer off-white or greige often looks better there. South- and west-facing kitchens get warm light that can push creams toward yellow but keeps whites feeling crisp. The same greige can look warm and inviting in the morning and cooler by evening. Overhead and under-cabinet lighting (warm vs cool bulbs) shifts it further. The practical rule: get large samples of your top choices, put them up in your actual kitchen, and look at them at different times of day and under your lights before deciding. A chip in a showroom tells you almost nothing about how the color will live in your room.</p>

<h2 id="pairings">Pairing neutrals with counters and floors</h2>
<p>Because these neutrals are so often chosen as a backdrop, how they pair with counters and floors is what makes or breaks the kitchen. <strong>White cabinets</strong> are the most flexible, working with virtually any counter — cool white quartz, warm marble-look, bold granite, or butcher block — and any floor, which is a big part of their enduring appeal. <strong>Off-white and cream</strong> shine alongside warm elements: honey and medium wood floors, brass hardware, warm-toned quartz or natural stone, and creamy backsplashes all reinforce the cozy warmth, while cool gray counters can fight the cream's yellow undertone and should be approached carefully. <strong>Greige</strong> is the great mediator, pairing with warm and cool counters alike, though the specific undertone of your greige should still agree with your surfaces — a warmer greige with warm wood floors, a cooler greige with gray-toned stone. In every case, the goal is undertone harmony: when the cabinet neutral and the fixed surfaces share a warm or cool direction, the kitchen feels cohesive; when they pull against each other, even a beautiful color can look subtly wrong. Choosing the counter and floor undertones together with the cabinet neutral — rather than in isolation — is how the whole palette comes together. See our <a href="/blog/cabinet-hardware-guide">hardware guide</a> for finishes that complete each neutral.</p>

<h2 id="choose">How to choose between them</h2>
<p>With undertones and light in mind, the choice gets easier. Choose <strong>white</strong> if you want maximum brightness and a crisp, classic look, especially in a well-lit kitchen, and you do not mind showing a bit more everyday wear. Choose <strong>off-white or cream</strong> if you love white's timelessness but want warmth and softness, and your palette (wood, brass, warm stone) leans warm. Choose <strong>greige</strong> if you want a versatile, grounded neutral with more depth that hides wear and pairs with almost anything — a great choice when you are unsure or want flexibility. In two-tone kitchens, these neutrals also pair beautifully with each other or with a bolder island color. Whatever you lean toward, let your fixed elements and your light make the final call. See our <a href="/blog/best-kitchen-cabinet-colors">best cabinet colors guide</a> and <a href="/blog/two-tone-kitchen-cabinets">two-tone guide</a>.</p>

<h2 id="mistakes">Common mistakes to avoid</h2>
<p>A few missteps undo an otherwise good neutral. Ignoring undertones and ending up with cabinets that clash subtly with the counters or floors. Choosing off-white in a cool-toned room, where it reads yellow and dingy. Picking a greige that is too gray for a warm home, making it feel cold. Judging the color from a small chip instead of large samples in your own light. And pairing a warm neutral with cool finishes (or vice versa) so the palette feels disjointed. Every one of these traces back to the same two ideas — undertones and light — so getting those right is most of the battle. Test thoroughly, match undertones to your fixed elements, and any of the three neutrals will look beautiful.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>White, off-white, and greige are all timeless, resale-friendly neutrals that differ mainly in warmth and undertone: white is the brightest and crispest, off-white adds cozy warmth, and greige is the deepest and most versatile. The best choice depends less on trends and more on your kitchen's light and the undertones of the counters and floors you are keeping. Identify those undertones, test large samples in your actual light at different times of day, and match warmth to warmth, and you will land on a neutral that looks intentional and elegant for years. When in doubt, greige's versatility makes it the safest bet, but a well-chosen white or cream is just as timeless. The reassuring truth is that there is no wrong choice among these three neutrals — each has anchored beautiful kitchens for decades — so the goal is simply to pick the one whose warmth and undertone suit your particular room, and then commit to it with confidence knowing it will still look right years from now. Bring home the largest samples you can, live with them on your cabinets for a few days, and let your own eyes in your own light settle it — that simple test is worth more than any trend report or showroom chip.</p>

<h2 id="how-we-build">Find your perfect neutral with Boise Cabinet Co</h2>
<p>${AUTHOR} builds custom <a href="/cabinets/kitchen">kitchen cabinets</a> in every neutral from crisp white to warm cream to versatile greige, for homes across Boise, Meridian, Eagle, and Nampa. Explore <a href="/catalog">our finishes and colors</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free in-home consultation</a>. We will help you test your top neutrals in your real kitchen light, match their undertones to your counters and floors, and choose the white, off-white, or greige that looks timeless and intentional in your home for years to come.</p>
`;

/* ============================================================================
 * 3) cost-to-replace-kitchen-cabinets
 * IMAGE PROMPT: Authentic professional real-estate photograph of a real,
 * completed straightforward kitchen in a modest-to-mid-range Treasure Valley
 * Idaho home with brand-new crisp white Shaker cabinets, simple brushed-nickel
 * hardware, laminate or quartz counters, a stainless range — a fresh, clean
 * standard remodel. Warm natural window light, true-to-life, full-frame DSLR.
 * Not a render, not CGI, not a stock photo. No people, no text, no watermarks.
 * ========================================================================== */
const costToReplaceContent = `
<p class="text-lg">The cost to replace kitchen cabinets depends most on <strong>the size of your kitchen, the cabinet type (stock, semi-custom, or custom), and whether you count materials only or full installation</strong>. As a planning framework, cabinets are usually priced per linear foot, and a typical kitchen replacement spans a wide range from budget stock to high-end custom. The biggest cost drivers are how many cabinets you need, the construction quality you choose, and labor for removal and installation. Here is how to think about the cost, what moves the number up or down, and how to get an accurate figure for your kitchen.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Cabinet replacement cost is driven by kitchen size, cabinet type (stock/semi-custom/custom), and whether you include installation. Cabinets are priced per linear foot; construction quality and labor move the number most. <a href="/blog/cabinet-cost-per-linear-foot">See cost per linear foot</a> or <a href="/estimate">get a planning range</a>.</p>
</div>

<h2 id="how-priced">How cabinet cost is measured</h2>
<p>Kitchen cabinets are most often priced by the <strong>linear foot</strong> — the length of wall the cabinets run along, measured along the base and upper runs. This gives a consistent way to compare kitchens of different sizes and cabinet lines. A small galley kitchen has far fewer linear feet than a large kitchen with an island, so it costs proportionally less to outfit. When you get a quote, it typically reflects your kitchen's linear footage times a per-foot price for the cabinet line you choose, plus specialty cabinets, accessories, and labor. Understanding the linear-foot basis helps you compare quotes fairly and see why kitchen size is the single biggest factor in the total. Our <a href="/blog/cabinet-cost-per-linear-foot">cost-per-linear-foot guide</a> explains this pricing in depth.</p>

<h2 id="type">Cabinet type is the biggest lever</h2>
<p>After size, the type of cabinets you choose has the largest effect on cost. <strong>Stock cabinets</strong> come in fixed sizes and finishes and are the most affordable, ideal for tight budgets and standard layouts. <strong>Semi-custom cabinets</strong> offer more sizes, finishes, and modifications for a moderate step up in price — a popular middle ground. <strong>Custom cabinets</strong> are built to your exact specifications, materials, and finishes, using every inch of your space, and sit at the top of the range. The gap between budget stock and high-end custom is large, so deciding which tier fits your priorities is the most important cost decision you will make. If maximizing space, storage, and a specific look matters, custom is worth it; if budget and speed lead, stock or semi-custom may serve you well. See our <a href="/blog/stock-vs-custom-cabinets-boise">stock vs custom guide</a>.</p>

<h2 id="drivers">What drives the cost up or down</h2>
<p>Within any cabinet type, several factors move the number:</p>
<ul>
  <li><strong>Kitchen size</strong> — more linear feet means more cabinets and higher cost.</li>
  <li><strong>Construction quality</strong> — plywood boxes, solid-wood dovetailed drawers, and soft-close hardware cost more than particleboard and basic parts, but last far longer.</li>
  <li><strong>Materials and finish</strong> — premium woods, painted finishes, and specialty colors add cost over basic options.</li>
  <li><strong>Door style</strong> — intricate or inset doors cost more than plain slab or partial-overlay doors.</li>
  <li><strong>Accessories and inserts</strong> — pull-outs, organizers, and specialty cabinets add up.</li>
  <li><strong>Labor</strong> — removal of old cabinets and installation of new ones, plus any layout changes.</li>
</ul>
<p>Each of these is a lever you can adjust to fit a budget, which is why two kitchens of the same size can differ widely in price.</p>

<h2 id="installation">Materials vs full installation</h2>
<p>An important distinction in any cabinet quote is whether it includes just the cabinets or the full installed project. <strong>Materials only</strong> is the price of the cabinets themselves. <strong>Full installation</strong> adds labor to remove the old cabinets, install the new ones, and handle any adjustments — plus, in a full remodel, coordination with countertops, plumbing, and electrical. Installation is a meaningful part of the total, so when comparing quotes, make sure you are comparing like for like: an attractive materials-only price is not comparable to an installed price. Replacing cabinets also usually means new countertops (since old tops rarely survive removal), which is a separate but related cost to budget for. A clear, itemized quote is the best way to understand exactly what you are paying for.</p>

<h2 id="replace-vs">Replace vs reface vs refinish</h2>
<p>Before committing to full replacement, it is worth knowing that replacing is the most expensive of three options — and not always necessary. <strong>Refinishing</strong> (repainting or re-staining your existing doors and boxes) is the cheapest and works when your boxes and layout are sound and you just want a new color. <strong>Refacing</strong> (new doors and a matching skin on your existing boxes) sits in the middle and changes the door style and finish without new boxes. <strong>Replacing</strong> is the most expensive but the only option that lets you change the layout, upgrade the box construction, and reconfigure storage. If your boxes are solid and your layout works, refinishing or refacing may get you the look you want for far less. Replace when the layout is wrong, the boxes are failing, or you want a fundamental upgrade. Our <a href="/blog/cabinet-refacing-vs-refinishing-vs-replacing">reface vs refinish vs replace guide</a> compares them fully.</p>

<h2 id="save">How to save on cabinet replacement</h2>
<p>If budget is a concern, there are smart ways to control cost without gutting quality. Keep your existing layout to avoid moving plumbing and electrical, which adds expense. Choose a more affordable cabinet tier (stock or semi-custom) but do not skimp on the construction quality that determines longevity — spend on the boxes and hardware, economize on cosmetic extras. Limit specialty cabinets and accessories to the few that genuinely help. Consider refacing or refinishing if your boxes are sound. And get multiple itemized quotes so you can compare fairly and see where the money goes. The goal is to spend where it lasts — construction and layout — and save on the extras that are nice but not essential. Our <a href="/blog/custom-kitchen-cabinet-cost">custom cabinet cost guide</a> has more budgeting detail.</p>

<h2 id="signs">Signs it's time to replace</h2>
<p>Because replacement is the biggest cabinet investment, it helps to know when it is genuinely warranted rather than a lesser update. Clear signs point to replacement over refacing or refinishing. If the <strong>boxes themselves are failing</strong> — particleboard swelling from moisture, shelves sagging, frames loosening, or water damage under the sink — a new finish or new doors on failing boxes is money wasted. If your <strong>layout does not work</strong> — too little counter space, a bad work triangle, no island where you need one, wasted corners — only replacement lets you change it, since refacing and refinishing keep the existing configuration. If you want to <strong>upgrade construction quality</strong> from builder-grade to solid plywood boxes and soft-close everything, that means new cabinets. And if the cabinets are simply <strong>at the end of their life</strong> — decades old, worn out, and no longer functioning well — replacement is the reset. On the other hand, if your boxes are solid and your layout works and you mainly dislike the color or door style, refinishing or refacing will likely serve you better and cheaper. Matching the solution to the actual problem is what keeps you from overspending on replacement when a lesser update would do — or underspending on a refinish when the real issue is a failing, badly laid-out kitchen.</p>

<h2 id="accurate">Getting an accurate number</h2>
<p>Because so many factors affect the total, the only way to know what your kitchen will cost is a real quote based on your actual space and choices. A good cabinet company will measure your kitchen, discuss your priorities and cabinet tier, and give you an itemized estimate covering cabinets, accessories, and installation. This is far more reliable than a per-square-foot rule of thumb, because your linear footage, cabinet choices, and any layout changes are specific to you. Getting a professional measure and quote early — before you fall in love with finishes — also helps you set a realistic budget and make trade-offs deliberately. A free in-home consultation and planning estimate is the best first step toward an accurate number.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>The cost to replace kitchen cabinets comes down to your kitchen's size, the cabinet tier you choose (stock, semi-custom, or custom), the construction quality and finishes, and whether you include installation. Cabinets are priced per linear foot, so kitchen size sets the baseline, and your choices move it up or down from there. Before committing to full replacement, consider whether refinishing or refacing could deliver the look you want for less. And because the range is wide, the only reliable number is an itemized quote based on your real kitchen. Plan the tier and priorities first, spend on the lasting elements, and you will get a kitchen you love at a cost you understand. The homeowners who feel best about what they spent are the ones who decided deliberately where their money went — into quality boxes, a layout that works, and the features they use every day — rather than being surprised by a number after the fact, which is exactly why an itemized quote and a clear set of priorities are worth the time up front. Take the time to get a real measure and a line-by-line estimate before you commit, and the final number becomes a plan you chose rather than a surprise you absorb.</p>

<h2 id="how-we-build">Get a real number from Boise Cabinet Co</h2>
<p>${AUTHOR} builds and installs custom <a href="/cabinets/kitchen">kitchen cabinets</a> across every tier — and gives you a clear, itemized quote based on your actual kitchen — for homes across Boise, Meridian, Eagle, and Nampa. Explore <a href="/catalog">our cabinets and finishes</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free in-home consultation</a>. We will measure your space, talk through your priorities and budget, and help you decide whether replacing, refacing, or refinishing gives you the best result for your money — with no surprises on the final number.</p>
`;

/* ============================================================================
 * 4) painted-vs-stained-cabinets
 * IMAGE PROMPT: Authentic professional real-estate photograph of a real,
 * completed kitchen in a Treasure Valley Idaho home that clearly shows BOTH
 * finishes: crisp white PAINTED perimeter cabinets paired with a rich natural
 * STAINED walnut island, Shaker doors, matte black hardware, white quartz
 * counters. Warm natural window light, true-to-life, full-frame DSLR. Not a
 * render, not CGI, not a stock photo. No people, no text, no watermarks.
 * ========================================================================== */
const paintedVsStainedContent = `
<p class="text-lg">The choice between painted and stained cabinets comes down to look, maintenance, and the wood itself: <strong>painted cabinets give a smooth, clean, color-flexible finish that hides the grain, while stained cabinets show off the natural wood grain and warmth</strong>. Painted is the more popular, more modern choice and works in any color; stained is the choice for showcasing beautiful wood and adding organic warmth. Neither is more durable in every way — each has trade-offs in how it wears, touches up, and ages. Here is exactly how painted and stained compare so you can choose the right finish for your kitchen.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Painted gives a smooth, color-flexible finish that hides grain; stained shows off natural wood grain and warmth. Painted suits modern and colorful looks; stained suits warm, natural kitchens. Each ages and touches up differently. <a href="/blog/cabinet-finishes-colors-guide">See finishes and colors</a> or <a href="/estimate">plan your project</a>.</p>
</div>

<h2 id="painted">Painted cabinets</h2>
<p>Painted cabinets are finished with an opaque, colored coating that covers the wood entirely, giving a smooth, uniform, furniture-like surface. Their biggest advantages are flexibility and a clean look: paint comes in any color, from timeless white to bold navy or sage, so painted cabinets suit modern, traditional, and colorful kitchens alike. The smooth finish reads crisp and current, which is why painted white is the most popular kitchen in America. Because paint hides the wood, the species underneath matters less for looks (smooth, tight-grained woods like maple or MDF panels are ideal for a flawless finish). The trade-offs: painted finishes can show chips and wear at edges and touch up less invisibly than stain, and a quality painted finish costs a bit more due to the extra prep and coats involved. Overall, painted is the versatile, on-trend choice.</p>

<h2 id="stained">Stained cabinets</h2>
<p>Stained cabinets are finished with a translucent color that soaks into the wood, enhancing rather than hiding the natural grain. Their defining advantage is warmth and character: stain shows off the beauty of the wood — oak's bold grain, cherry's rich depth, hickory's dramatic variation — giving a kitchen an organic, timeless feel that paint cannot replicate. Stained finishes also tend to hide minor wear, scratches, and everyday life better than paint, because the grain and tone camouflage small marks, and they touch up more invisibly. The trade-offs: stain locks you into the wood's natural tones (you cannot get a true white or a bold color), and the look depends heavily on the wood species and its grain. For homeowners who love natural wood and want warmth and easy upkeep, stained is a beautiful, forgiving choice.</p>

<h2 id="comparison">Painted vs stained at a glance</h2>
<table>
  <thead><tr><th>Factor</th><th>Painted</th><th>Stained</th></tr></thead>
  <tbody>
    <tr><td>Look</td><td>Smooth, uniform, any color</td><td>Natural grain, warm tones</td></tr>
    <tr><td>Color options</td><td>Unlimited</td><td>Wood tones only</td></tr>
    <tr><td>Hides wear</td><td>Less well; chips show</td><td>Better; grain hides marks</td></tr>
    <tr><td>Touch-ups</td><td>Harder to match</td><td>Easier, more invisible</td></tr>
    <tr><td>Best for</td><td>Modern, colorful, clean looks</td><td>Warm, natural, traditional looks</td></tr>
  </tbody>
</table>

<h2 id="durability">Durability and wear</h2>
<p>Durability is often misunderstood here, because each finish wears differently rather than one being simply tougher. A quality painted finish is hard and durable, but when it does chip or ding — usually at edges and high-contact spots — the damage is more visible against the solid color, and touch-ups are harder to blend. A stained finish, because it works with the grain and tone, tends to hide small scratches and everyday wear better and touches up more invisibly, so it often ages more gracefully in a busy kitchen. Neither is fragile when well made; the difference is in how wear shows and how easily it is fixed. If you have a hard-working family kitchen and want wear to disappear, stain has an edge; if you want a specific color or smooth modern look, painted is worth its slightly higher upkeep. Construction and finish quality matter more than the paint-vs-stain choice itself. See our <a href="/blog/cabinet-construction-quality-guide">construction quality guide</a>.</p>

<h2 id="cost">Cost differences</h2>
<p>Painted finishes generally cost a bit more than stained, because achieving a smooth, flawless painted surface requires more preparation, more coats, and a tight-grained wood or MDF panel to paint over. Stained finishes let the wood show, so they involve fewer steps, though a premium wood species (cherry, walnut) can push a stained kitchen's cost up on the materials side. In practice the finish is only one factor in the total cost, alongside wood species, door style, construction quality, and cabinet tier. If budget is tight, a stained finish on a moderate wood can be economical; if you want a painted color, expect a modest upcharge for the finish. Our <a href="/blog/custom-kitchen-cabinet-cost">custom cabinet cost guide</a> puts finish cost in context.</p>

<h2 id="wood">The role of the wood</h2>
<p>Your finish choice and your wood choice are linked, and deciding painted-vs-stained first narrows the wood dramatically. For <strong>painted</strong> cabinets, you want a smooth, tight-grained wood that will not telegraph through the finish — maple is the classic pick, with MDF common for flat center panels; paying for a beautiful grain under paint that hides it makes little sense. For <strong>stained</strong> cabinets, the grain is the whole point, so you choose the wood by the look you love: oak for bold open grain, cherry for warm elegance, hickory for drama, walnut for dark luxury. This is why the finish decision comes first — it tells you which woods make sense. See our guide to the <a href="/blog/best-wood-for-kitchen-cabinets">best wood for kitchen cabinets</a>.</p>

<h2 id="maintenance">Living with each finish</h2>
<p>Beyond how they look, painted and stained cabinets live a little differently day to day, and knowing that helps you choose for your real life. <strong>Painted cabinets</strong> wipe clean easily and show a bright, crisp face, but they reveal fingerprints, smudges, and cooking splatter more readily against the solid color, so high-touch areas around handles and the stove need regular wiping to stay looking their best. Over years, the spots that take the most contact — edges, the sink and trash cabinet, around knobs — are where a painted finish eventually shows wear, and touch-ups, while possible, can be hard to blend perfectly. <strong>Stained cabinets</strong> are more forgiving in daily life: the grain and tone hide fingerprints, minor scratches, and everyday marks, so they look "clean" with less fuss, and when they do get nicked, the damage blends into the wood and touches up more invisibly. Neither is high-maintenance, but if your kitchen is busy with kids and heavy cooking and you want wear to disappear, stained is the more forgiving companion; if you love a bright painted color and do not mind a quick regular wipe, painted rewards that small effort with a crisp, current look. Either way, gentle cleaning and prompt attention to spills protect the finish — see our <a href="/blog/how-to-clean-kitchen-cabinets">cabinet cleaning guide</a>.</p>

<h2 id="both">Why not both? Two-tone kitchens</h2>
<p>You do not always have to choose — combining painted and stained finishes in one kitchen is one of the most popular looks today. A painted perimeter with a natural stained-wood island (or vice versa) brings together the clean, color-flexible quality of paint and the warmth and grain of stain, giving a kitchen depth and interest that a single finish cannot. This two-tone, two-finish approach lets you have the bright, current feel of painted cabinets and the organic warmth of wood at the same time, and it is a great way to introduce wood tones without committing the whole kitchen to stain. The keys are keeping one finish neutral and tying the two together with consistent hardware. See our <a href="/blog/two-tone-kitchen-cabinets">two-tone kitchen guide</a>.</p>

<h2 id="choose">How to choose</h2>
<p>The right finish comes down to the look and lifestyle you want. Choose <strong>painted</strong> if you want a smooth, clean, current look, a specific color (especially white or a bold hue), or a modern aesthetic — and you are comfortable with slightly more careful upkeep. Choose <strong>stained</strong> if you love natural wood and want warmth, character, and a finish that hides everyday wear and touches up easily. Choose <strong>both</strong> if you want the best of each in a two-tone kitchen. Consider your style, how hard your kitchen works, and whether color flexibility or natural warmth matters more to you. Either finish, well made on a quality box, will look beautiful and last for decades — this is a choice about aesthetics and upkeep, not about one being right and the other wrong.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>Painted and stained cabinets offer two different kinds of beauty: painted gives a smooth, uniform, color-flexible finish ideal for modern and colorful kitchens, while stained showcases natural wood grain and warmth and hides everyday wear more forgivingly. Painted costs a little more and shows chips more visibly; stained locks you into wood tones but ages gracefully and touches up easily. Decide based on whether color flexibility and a clean look or natural warmth and easy upkeep matter more — or combine them in a two-tone kitchen for both. Whichever you choose, pair it with the right wood and a quality build, and your cabinets will look right and last for years. And if you truly cannot decide, that is often a sign a two-tone kitchen is your answer — letting you enjoy the crisp color of paint and the natural warmth of wood in the same room, so you never have to give up one for the other.</p>

<h2 id="how-we-build">Choose your finish with Boise Cabinet Co</h2>
<p>${AUTHOR} builds custom <a href="/cabinets/kitchen">kitchen cabinets</a> in painted, stained, and two-tone finishes, with the right wood and a quality build behind each, for homes across Boise, Meridian, Eagle, and Nampa. Explore <a href="/catalog">our finishes, colors, and woods</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free in-home consultation</a>. We will help you weigh painted versus stained for your style and how hard your kitchen works, pair the finish with the right wood, and build cabinets that look beautiful and hold up for decades.</p>
`;

/* ============================================================================
 * 5) prefab-cabinets-explained
 * IMAGE PROMPT: Authentic professional real-estate photograph of a real,
 * completed simple, clean kitchen in a modest Treasure Valley Idaho home with
 * straightforward light gray flat-panel cabinets, basic brushed-nickel bar
 * pulls, laminate counters, a stainless range — an affordable, tidy standard
 * kitchen. Warm natural window light, true-to-life, full-frame DSLR. Not a
 * render, not CGI, not a stock photo. No people, no text, no watermarks.
 * ========================================================================== */
const prefabContent = `
<p class="text-lg">Prefab (prefabricated) cabinets are <strong>mass-produced cabinets made in standard sizes and finishes, built in advance and sold ready to install</strong> — either fully assembled or as ready-to-assemble (RTA) flat packs. Their appeal is price and speed: because they are made in bulk to set specifications, they cost far less than custom and are available quickly. The trade-off is limited sizes, finishes, and flexibility, which can mean filler gaps and compromises in an irregular kitchen. Here is exactly what prefab cabinets are, their real pros and cons, and how to decide whether they fit your project — or whether semi-custom or custom is the better call.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Prefab cabinets are mass-produced in standard sizes and finishes, sold assembled or as RTA flat packs. They are affordable and fast but limited in sizing and flexibility. Great for budgets and standard layouts; less ideal for irregular kitchens. <a href="/blog/stock-vs-custom-cabinets-boise">See stock vs custom</a> or <a href="/estimate">plan your project</a>.</p>
</div>

<h2 id="what-are">What are prefab cabinets?</h2>
<p>Prefab cabinets are cabinets manufactured in advance in standardized sizes, styles, and finishes, rather than built to order for a specific kitchen. They are essentially the same thing people mean by <strong>stock cabinets</strong>: produced in bulk to fixed specifications and sold off the shelf. They come in two main forms — <strong>pre-assembled</strong>, arriving fully built and ready to hang, and <strong>ready-to-assemble (RTA)</strong>, arriving as flat-packed parts you or an installer put together. Because they are mass-produced, prefab cabinets are widely available, inexpensive, and quick to get, which is exactly why they are so common in budget remodels, rentals, flips, and standard-layout kitchens. What you gain in price and speed you give up in customization, since you are choosing from a fixed menu of sizes and finishes rather than specifying your own.</p>

<h2 id="pros">The advantages of prefab</h2>
<p>Prefab cabinets earn their popularity with real benefits:</p>
<ul>
  <li><strong>Lower cost</strong> — mass production makes them the most affordable cabinet option, a major advantage for tight budgets.</li>
  <li><strong>Fast availability</strong> — because they are made in advance, there is little or no lead time compared to built-to-order cabinets.</li>
  <li><strong>Predictable</strong> — you see exactly what you are getting in standard sizes and finishes, with no custom surprises.</li>
  <li><strong>Good for standard layouts</strong> — in a kitchen whose dimensions suit standard sizes, prefab can fit well with minimal compromise.</li>
  <li><strong>RTA shipping savings</strong> — flat-packed RTA cabinets ship cheaply and compactly, lowering cost further.</li>
</ul>
<p>For a budget project, a rental or flip, or a kitchen with a straightforward layout, these advantages make prefab a sensible, cost-effective choice.</p>

<h2 id="cons">The drawbacks of prefab</h2>
<p>The limitations are the flip side of standardization:</p>
<ul>
  <li><strong>Limited sizes</strong> — standard increments (often 3 inches) mean cabinets may not fit your walls exactly, leaving filler gaps or wasted space.</li>
  <li><strong>Limited finishes and styles</strong> — you choose from a fixed menu, not your own colors or door styles.</li>
  <li><strong>Less flexibility</strong> — awkward walls, sloped ceilings, and unusual layouts are hard to accommodate.</li>
  <li><strong>Variable construction quality</strong> — some prefab lines use particleboard and basic hardware; quality ranges widely, so inspect the boxes and drawers.</li>
  <li><strong>Assembly required (RTA)</strong> — flat packs need assembly, which takes time and care for a solid result.</li>
</ul>
<p>None of these is a dealbreaker in the right kitchen, but they explain why prefab is not ideal when you want a precise fit, specific finishes, or maximum use of an irregular space.</p>

<h2 id="quality">Prefab construction quality varies</h2>
<p>One of the most important things to know about prefab cabinets is that quality ranges enormously from line to line. Some prefab and RTA cabinets are well built, with plywood boxes, solid-wood doors, and soft-close hardware; others cut costs with particleboard boxes, thin panels, and basic hinges that wear out. Because the price is attractive, it is tempting to assume all prefab is the same, but the box construction, drawer joinery, and hardware make a huge difference in how long the cabinets last. If you go the prefab route, inspect the actual construction — look for plywood over particleboard, dovetailed or well-built drawers, and quality soft-close hardware — rather than choosing on price alone. A well-built prefab cabinet can serve for years; a cheap one can disappoint quickly. See our <a href="/blog/cabinet-construction-quality-guide">construction quality guide</a> for what to look for.</p>

<h2 id="vs-custom">Prefab vs semi-custom vs custom</h2>
<p>Prefab sits at one end of a spectrum. <strong>Prefab/stock</strong> is the most affordable and fastest but the least flexible, in fixed sizes and finishes. <strong>Semi-custom</strong> offers more sizes, finishes, and modifications on a stock platform for a moderate step up — a good middle ground when prefab does not quite fit. <strong>Custom</strong> is built to your exact dimensions, storage needs, and finishes, using every inch of an irregular space, at the top of the range. The right choice depends on your kitchen and priorities: if your layout is standard and budget leads, prefab may fit; if you have awkward walls, want specific finishes, or need to maximize space, semi-custom or custom is worth the investment. Many kitchens that start with prefab in mind end up semi-custom once the filler gaps and finish limits become clear. Our <a href="/blog/stock-vs-custom-cabinets-boise">stock vs custom guide</a> compares all three.</p>

<h2 id="buy-wisely">How to buy prefab cabinets wisely</h2>
<p>If prefab fits your project, a few habits get you the best result. First, <strong>measure carefully and plan the layout to standard sizes</strong>, so you minimize the filler strips that fill the gaps where standard cabinets do not reach the wall — a little planning here avoids wasted space and an awkward look. Second, <strong>inspect the actual construction before buying</strong>: open drawers to check the joinery, look for plywood rather than particleboard boxes, and confirm the hinges and slides are soft-close and solid, since these determine how long the cabinets last. Third, <strong>account for assembly if you choose RTA</strong> — building flat packs well takes time and care, and a rushed assembly shows in misaligned doors, so be honest about whether you or your installer will do it right. Fourth, <strong>order a little early and check for damage</strong>, because mass-produced cabinets occasionally arrive with dinged parts that need exchanging. And finally, <strong>compare the real installed cost</strong>, not just the sticker price: once you add assembly, installation, and any fillers or modifications, a bargain prefab kitchen can end up closer to semi-custom than expected. Buying prefab well is mostly about planning to its standard sizes and verifying the construction, rather than assuming the lowest price is the best value.</p>

<h2 id="cost-reality">The real cost picture</h2>
<p>Prefab's headline advantage is price, but it is worth understanding the full cost picture before deciding. The cabinets themselves are inexpensive, especially in RTA form, which is genuinely appealing for a tight budget. However, the total project cost also includes assembly (for RTA), installation labor, filler strips and trim to bridge the gaps standard sizes leave, and often new countertops. When those are added, the gap between a prefab kitchen and a semi-custom one can narrow, particularly if your kitchen has any irregular walls that require extra fillers or compromises. This does not mean prefab is a bad deal — for a standard layout and a modest budget it can be excellent value — but it does mean you should compare fully installed costs rather than cabinet-only prices. Sometimes the small step up to semi-custom buys a much better fit and finish for not much more, and sometimes prefab is clearly the right budget call; only a real, itemized comparison tells you which. See our <a href="/blog/custom-kitchen-cabinet-cost">cost guide</a> to compare tiers.</p>

<h2 id="who">Who should choose prefab?</h2>
<p>Prefab makes the most sense for specific situations. It is a strong choice for <strong>tight budgets</strong>, where cost is the top priority. It suits <strong>rentals, flips, and secondary spaces</strong>, where you want a clean, functional result without a custom investment. It works well in <strong>standard-layout kitchens</strong> whose dimensions happen to suit standard sizes, minimizing filler and compromise. And it appeals to <strong>DIYers</strong> comfortable assembling and installing RTA cabinets to save on labor. If, on the other hand, you have an irregular kitchen, want specific colors or door styles, care about maximizing every inch, or want the longest-lasting construction, you will likely be happier stepping up to semi-custom or custom. Matching the cabinet type to your situation is what makes the project a success.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>Prefab cabinets are mass-produced, standard-size cabinets sold ready to install, either pre-assembled or as RTA flat packs. Their strengths are clear — low cost, fast availability, and predictability — which make them a smart choice for budget projects, rentals and flips, and standard-layout kitchens. Their limits are equally clear: fixed sizes and finishes, less flexibility for irregular spaces, and construction quality that varies widely and must be inspected. If your layout is standard and budget leads, quality prefab can serve you well; if you want a precise fit, specific finishes, or maximum storage, semi-custom or custom is the better investment. Know what you are getting, check the construction, and choose the tier that fits your kitchen and priorities. The homeowners who are happiest with prefab are the ones who went in with clear eyes — a standard layout, a realistic budget, and a careful look at the box quality — rather than assuming the lowest price automatically meant the best value, which is the one trap worth avoiding on the budget end of the cabinet market.</p>

<h2 id="how-we-build">Explore your options with Boise Cabinet Co</h2>
<p>${AUTHOR} builds custom and semi-custom <a href="/cabinets/kitchen">kitchen cabinets</a> — and can help you weigh them honestly against prefab — for homes across Boise, Meridian, Eagle, and Nampa. Explore <a href="/catalog">our cabinets and finishes</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free in-home consultation</a>. If prefab fits your budget and layout, we will tell you; if a semi-custom or custom approach would fit your space and last longer for not much more, we will show you the difference, so you choose the cabinets that are right for your kitchen and budget.</p>
`;

/* ============================================================================
 * 6) kitchen-cabinet-height-guide
 * IMAGE PROMPT: Authentic professional real-estate photograph of a real,
 * completed kitchen in a mid-range Treasure Valley Idaho home with soft
 * blue-gray painted Shaker cabinets running FLOOR TO CEILING (tall upper
 * cabinets stacked to the ceiling), brushed brass hardware, white quartz
 * counters, showing the full height of base and wall cabinets. Warm natural
 * window light, true-to-life, full-frame DSLR. Not a render, not CGI, not a
 * stock photo. No people, no text, no watermarks.
 * ========================================================================== */
const heightGuideContent = `
<p class="text-lg">Standard kitchen cabinet heights are well established: <strong>base cabinets are 34.5 inches tall (36 inches with the countertop), upper (wall) cabinets are 30, 36, or 42 inches tall, and tall/pantry cabinets are 84, 90, or 96 inches</strong>. The standard gap between the countertop and the bottom of the upper cabinets is 18 inches. These heights are based on ergonomics and standard appliances, but they can be customized for your ceiling height, your own height, and accessibility. Here is a clear breakdown of every cabinet height, why the standards exist, and when it makes sense to adjust them.</p>

<div class="summary-block">
  <p><strong>Key takeaways:</strong> Base cabinets are 34.5" (36" with counter), uppers 30/36/42", tall cabinets 84/90/96", with an 18" gap above the counter. Heights can be customized for ceilings, your height, and accessibility. <a href="/blog/standard-kitchen-cabinet-sizes">See all cabinet sizes</a> or <a href="/blog/how-deep-are-kitchen-cabinets">cabinet depths</a>.</p>
</div>

<h2 id="base">Base cabinet height: 34.5 inches</h2>
<p>Standard base cabinets are <strong>34.5 inches tall</strong> on their own, and with a standard countertop added, the finished counter height comes to <strong>36 inches</strong> — the near-universal kitchen counter height. This measurement is based on ergonomics: 36 inches is a comfortable working height for food prep, cooking, and cleanup for people of average height, which is why it has become the standard that appliances and countertops are designed around. The 34.5-inch box plus a roughly 1.5-inch countertop gets you there. Standard dishwashers and ranges are built to fit flush under a 36-inch counter, which is another reason the standard endures. When people talk about "counter height" seating or appliances, this 36-inch finished height is the reference.</p>

<h2 id="upper">Upper (wall) cabinet heights: 30, 36, 42 inches</h2>
<p>Upper or wall cabinets come in three standard heights, and the choice affects both storage and how the kitchen feels. <strong>30-inch</strong> uppers are the traditional standard, leaving a gap above the cabinets to the ceiling (often filled with a soffit or left open for display). <strong>36-inch</strong> uppers give more storage and suit slightly taller ceilings. <strong>42-inch</strong> uppers are increasingly popular for taking cabinets nearly to or all the way to the ceiling in standard 8-to-9-foot rooms, maximizing storage and giving a clean, built-in look without a soffit. Taller uppers add valuable storage but put the top shelves out of easy reach, so they are best for less-used items. The right height depends on your ceiling and how much storage and reach you want.</p>

<h2 id="gap">The 18-inch backsplash gap</h2>
<p>The standard distance between the countertop and the bottom of the upper cabinets is <strong>18 inches</strong>. This gap is another ergonomic standard: it gives you enough room to work on the counter, use small appliances, and see and reach the backsplash area, while keeping the upper cabinets low enough to access comfortably. Eighteen inches is the typical default, though it can be adjusted slightly — a taller cook or a desire for more open backsplash might push it to 19 or 20 inches, while a shorter person might prefer a bit less. Getting this gap right matters for daily comfort: too little and the uppers feel cramped over the counter; too much and the upper shelves become hard to reach. Eighteen inches is the tested sweet spot for most kitchens.</p>

<h2 id="tall">Tall and pantry cabinet heights: 84, 90, 96 inches</h2>
<p>Tall cabinets — pantry, utility, and oven cabinets — come in standard heights of <strong>84, 90, and 96 inches</strong> to suit different ceiling heights. An 84-inch tall cabinet fits a standard 8-foot ceiling with some space above; 90- and 96-inch cabinets take fuller advantage of 9-foot and taller ceilings, running nearly to the ceiling for maximum storage and a built-in look. These cabinets typically align at the top with the upper cabinets for a cohesive line. Choosing the tall-cabinet height to match your ceiling — and to align with your uppers — is part of designing a kitchen that looks intentional and uses its vertical space well. A tall pantry that runs to the ceiling adds enormous storage in a small footprint.</p>

<h2 id="ceiling">Cabinets and ceiling height</h2>
<p>Your ceiling height shapes your cabinet height choices, especially for the uppers. In a standard <strong>8-foot ceiling</strong>, 30-inch uppers leave about a foot of space above (for a soffit or open display), while 42-inch uppers run nearly to the ceiling for a clean, storage-maximizing look. In <strong>9-foot and taller</strong> ceilings, you have options: take the cabinets to the ceiling with taller uppers or stacked cabinets for a dramatic, storage-rich look, or stop them lower and leave open wall space above. Taking cabinets to the ceiling maximizes storage and avoids the dust-collecting gap on top, but the highest shelves need a step stool. Deciding how to handle the space between the uppers and the ceiling is one of the key height decisions in a kitchen, and it significantly affects both storage and style.</p>

<h2 id="island">Island and seating heights</h2>
<p>Islands introduce their own height decisions, because they often serve more than one purpose. A standard island worktop matches the counter at <strong>36 inches</strong>, which keeps it consistent with the rest of the kitchen for prep and cooking. But many islands include seating, and seating comes at different heights: <strong>counter-height seating</strong> uses 36-inch counters with 24- to 26-inch stools, keeping the whole island at one level; <strong>bar-height seating</strong> raises part of the island to about 42 inches with taller 28- to 30-inch stools, creating a raised bar that also hides kitchen clutter from view. A two-level island combines a 36-inch work zone with a 42-inch bar, while a single-level island keeps everything at counter height for a sleeker, more modern look. Whichever you choose, plan the stool height to match — the gap between the seat and the underside of the counter should be comfortable, typically 10 to 12 inches. Deciding your island's height and seating style early ensures the stools fit and the island works for both cooking and gathering.</p>

<h2 id="ergonomics">Comfort and ergonomics</h2>
<p>The standard heights exist because they are comfortable for people of average height, but comfort is personal, and small adjustments make a real difference day to day. If you are noticeably taller or shorter than average, the standard 36-inch counter may leave you hunching or reaching, and raising or lowering it even an inch or two can transform how the kitchen feels to work in. Bakers often prefer a slightly lower surface for kneading and rolling, where more leverage helps. The height of the uppers and the 18-inch backsplash gap affect how easily you reach everyday dishes without straining. And for anyone planning to age in place, thinking about reach and height now — accessible counter heights, lower or pull-down uppers, drawers instead of deep low cabinets — makes the kitchen usable for far longer. Because these heights are built into the cabinet order and hard to change later, matching them to your body and habits during planning is one of the highest-value things custom cabinetry lets you do. See our <a href="/blog/how-to-plan-a-kitchen-cabinet-project">planning guide</a> for how height fits the bigger picture.</p>

<h2 id="customize">When to customize cabinet heights</h2>
<p>Standard heights fit most people and kitchens, but custom cabinetry lets you tune them. If you are <strong>taller or shorter than average</strong>, adjusting the counter height (up from 36 inches for tall cooks, down for shorter ones or for baking) can make the kitchen dramatically more comfortable. For <strong>accessibility</strong>, counters and work surfaces can be lowered for seated users, and uppers mounted lower or fitted with pull-down shelves to bring contents within reach. In <strong>tall or short ceilings</strong>, upper and tall cabinet heights flex to fit the space well. And a <strong>baking station</strong> or a specific task area might call for a lower counter. The standards are a great starting point because they suit most people, but the ability to adjust height to your body and your ceiling is exactly what makes custom cabinetry fit so well. See our <a href="/blog/standard-kitchen-cabinet-sizes">standard cabinet sizes guide</a>.</p>

<h2 id="planning">Why height matters in planning</h2>
<p>Cabinet heights interact with your appliances, your comfort, and the look of the kitchen, so they belong in the planning stage. Base height determines whether appliances fit flush and whether the counter is comfortable to work at. Upper height and the 18-inch gap affect daily reach and how open the kitchen feels. Tall-cabinet and ceiling decisions shape storage and the overall style. Because heights are built into the cabinet order, they are not easily changed later, which is why they should be settled early alongside layout, sizing, and depth. Nail the heights up front — matched to your appliances, your body, and your ceiling — and the finished kitchen will feel comfortable and look intentional. Pair this with our guide to <a href="/blog/how-deep-are-kitchen-cabinets">cabinet depths</a> and <a href="/blog/how-to-plan-a-kitchen-cabinet-project">planning your project</a>.</p>

<h2 id="bottom-line">The bottom line</h2>
<p>Standard kitchen cabinet heights are straightforward: base cabinets are 34.5 inches (36 inches with the counter), upper cabinets are 30, 36, or 42 inches, and tall cabinets are 84, 90, or 96 inches, with an 18-inch gap between counter and uppers. These heights are rooted in ergonomics and standard appliances, which is why they work for most kitchens. But they can and should be customized when your height, your ceiling, or accessibility needs call for it. Know the standards, decide how to handle the space up to your ceiling, and adjust for your body and appliances where it helps — and your cabinets will be comfortable to use and look right in the room for years.</p>

<h2 id="how-we-build">Get the heights right with Boise Cabinet Co</h2>
<p>${AUTHOR} builds custom <a href="/cabinets/kitchen">kitchen cabinets</a> at standard heights — or tuned to your ceiling, your height, and how you cook — for homes across Boise, Meridian, Eagle, and Nampa. Explore <a href="/catalog">our cabinets and finishes</a>, then <a href="/estimate">get a planning range</a> or <a href="/contact">book a free in-home consultation</a>. We measure precisely and plan every height around your appliances, your comfort, and your ceiling, so your base cabinets, uppers, and tall cabinets all work together and feel right to use for years to come.</p>
`;

export const STAGED_POSTS: BlogPostData[] = [
  {
    slug: 'inset-vs-overlay-cabinets',
    title: 'Inset vs Overlay Cabinets: Differences, Cost & How to Choose',
    seoTitle: 'Inset vs Overlay Cabinets: Look, Cost & How to Choose',
    metaDescription:
      'Inset vs overlay cabinets compared: inset doors sit flush inside the frame (tailored, premium), overlay doors sit over it (common, affordable). Look, cost, storage, and how to choose.',
    excerpt:
      'Inset doors sit flush inside the cabinet frame for a tailored, premium look; overlay doors sit over the frame and cost less. Here is how they compare on look, cost, storage, and durability.',
    content: insetVsOverlayContent,
    author: AUTHOR,
    category: 'Types & Construction',
    hubSlug: 'kitchen-cabinets',
    tags: ['inset', 'overlay', 'construction', 'door styles', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What is the difference between inset and overlay cabinets?', answer: 'Inset doors sit flush inside the cabinet face frame for a smooth, tailored, furniture-like look; overlay doors sit on top of (over) the frame. Inset is the premium, higher-cost classic; overlay — especially full overlay — is the more common, affordable choice that gives generous storage and a cleaner modern face.' },
      { question: 'Are inset cabinets worth the extra cost?', answer: 'Inset is worth it if you want a classic, tailored, furniture-quality kitchen with the finest detailing and have the budget, since it requires more skilled labor and tighter tolerances. If you love the clean look but not the price, full overlay captures much of the tailored feel for far less.' },
      { question: 'What is full overlay vs partial overlay?', answer: 'Full overlay doors cover nearly the entire face frame with only a thin reveal between them, giving a clean, contemporary, almost frameless look. Partial overlay doors cover only part of the frame, leaving a visible band between doors — the traditional, most economical builder-grade standard.' },
      { question: 'Do inset cabinets have less storage?', answer: 'Slightly. Because inset doors sit inside the frame, the opening is a bit smaller and the frame edges intrude more into access, a minor reduction most noticeable for wide items and pull-outs. Overlay, especially full overlay, offers more generous openings and easier access to the interior.' },
      { question: 'Which is more expensive, inset or overlay?', answer: 'Inset is the most expensive by a meaningful margin because of the precise fitting, extra labor, and tighter tolerances it requires. Partial overlay is the least expensive, and full overlay sits in the middle — a bit more than partial for its cleaner look but far less than inset.' },
      { question: 'Are inset cabinets more prone to problems?', answer: 'Inset doors, fitted precisely within their openings, can be more sensitive to seasonal wood movement, so quality construction and stable materials matter. Overlay doors have more tolerance since a slight size change does not affect how they close. A well-built inset kitchen from a quality shop performs beautifully for decades.' },
    ],
    quickAnswer:
      'Inset cabinet doors sit flush inside the face frame for a tailored, furniture-quality look at the highest cost; overlay doors sit over the frame and are more common and affordable. Full overlay gives a clean, modern face with generous storage, while partial overlay is the economical traditional standard. Inset suits classic, high-end kitchens; overlay serves most homes and budgets beautifully.',
    keyTakeaways: [
      'Inset doors sit flush inside the frame; overlay doors sit over it.',
      'Inset is premium and priciest; full overlay is clean and mainstream; partial overlay is budget.',
      'Choose based on look, budget, and storage priorities.',
    ],
    relatedLinks: [
      { url: '/blog/framed-vs-frameless-cabinets', anchor: 'Framed vs frameless' },
      { url: '/blog/cabinet-door-styles-guide', anchor: 'Cabinet door styles' },
      { url: '/blog/cabinet-construction-quality-guide', anchor: 'Construction quality' },
      { url: '/blog/custom-kitchen-cabinet-cost', anchor: 'Custom cabinet cost' },
      { url: '/cabinets/kitchen' },
    ],
    primaryKeyword: 'inset vs overlay cabinets',
    secondaryKeywords: ['inset cabinets', 'full overlay cabinets', 'partial overlay cabinets', 'overlay vs inset'],
    searchIntent: 'Commercial / comparison — homeowners choosing a door-to-frame style',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'white-vs-greige-vs-off-white-cabinets',
    title: 'White vs Greige vs Off-White Cabinets: How to Choose',
    seoTitle: 'White vs Greige vs Off-White Cabinets: How to Choose',
    metaDescription:
      'White vs greige vs off-white cabinets compared: warmth, undertones, brightness, and how to choose. Match your neutral to your kitchen light, counters, and floors.',
    excerpt:
      'White is brightest, off-white adds warmth, and greige is the most versatile deeper neutral. Here is how the three compare, how undertones and light change everything, and how to choose.',
    content: whiteGreigeContent,
    author: AUTHOR,
    category: 'Colors & Finishes',
    hubSlug: 'kitchen-cabinets',
    tags: ['white', 'greige', 'off-white', 'colors', 'neutrals'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What is the difference between white, off-white, and greige cabinets?', answer: 'White is the brightest and cleanest, ranging from cool to warm; off-white (cream) is white with warmth added, softer and cozier; and greige is a gray-beige blend that is the deepest and most versatile of the three, bridging warm and cool. All are timeless; the difference is warmth and undertone.' },
      { question: 'Is greige better than white for cabinets?', answer: 'Neither is universally better. Greige is more versatile and hides everyday wear better, pairing with almost any counter and floor, which makes it a safe choice when unsure. White is brighter and crisper. Choose based on your kitchen light and the undertones of the elements you are keeping.' },
      { question: 'What are undertones and why do they matter?', answer: 'Every neutral has a subtle underlying tone — whites can lean blue, gray, yellow, or pink; creams lean yellow; greiges lean warmer or cooler. Undertones make a color look right or subtly off depending on whether they harmonize with your counters, floors, and backsplash. Matching undertones is the secret to a cohesive neutral kitchen.' },
      { question: 'Why do my cabinets look different in my kitchen than the store?', answer: 'Light changes everything. North-facing kitchens get cool light that can make cool whites look gray; south- and west-facing rooms get warm light that can push creams toward yellow. Bulb color shifts it further. Always test large samples in your own kitchen at different times of day before deciding.' },
      { question: 'Which neutral hides dirt and wear best?', answer: 'Greige hides everyday life best thanks to its deeper, blended tone, followed by off-white, with crisp white showing smudges and splatters most. If low-maintenance appearance matters, a greige or warm off-white is more forgiving than a stark white, though all clean easily with gentle care.' },
      { question: 'Are white or greige cabinets more timeless?', answer: 'Both are timeless. White has the longest track record and the broadest resale appeal, while greige has proven durable for its versatility and warmth. Neither is a fad. The more important question is which suits your light and undertones, since a well-chosen version of either will look current for years.' },
    ],
    quickAnswer:
      'White, off-white, and greige are all timeless neutral cabinet colors that differ in warmth and undertone: white is the brightest and crispest, off-white (cream) adds cozy warmth, and greige (gray-beige) is the deepest and most versatile, hiding wear best. Choose based on your kitchen light and the undertones of your counters and floors, and always test large samples in your own light before deciding.',
    keyTakeaways: [
      'White is brightest, off-white is warm, greige is the most versatile.',
      'Undertones and light determine which looks right in your kitchen.',
      'All three are timeless; test large samples in your own light.',
    ],
    relatedLinks: [
      { url: '/blog/best-kitchen-cabinet-colors', anchor: 'Best cabinet colors' },
      { url: '/blog/cabinet-finishes-colors-guide', anchor: 'Cabinet colors and finishes' },
      { url: '/blog/two-tone-kitchen-cabinets', anchor: 'Two-tone kitchens' },
      { url: '/blog/sage-green-kitchen-cabinets', anchor: 'Sage green cabinets' },
      { url: '/cabinets/kitchen' },
    ],
    primaryKeyword: 'white vs greige cabinets',
    secondaryKeywords: ['kitchen cabinet colors', 'off-white cabinets', 'greige cabinets', 'cream cabinets'],
    searchIntent: 'Informational / comparison — homeowners choosing a neutral cabinet color',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'cost-to-replace-kitchen-cabinets',
    title: 'Cost to Replace Kitchen Cabinets: Full Breakdown',
    seoTitle: 'Cost to Replace Kitchen Cabinets: What Drives the Price',
    metaDescription:
      'The cost to replace kitchen cabinets depends on kitchen size, cabinet type (stock, semi-custom, custom), and installation. Here is what drives the price and how to get an accurate number.',
    excerpt:
      'Cabinet replacement cost is driven by kitchen size, cabinet tier, construction quality, and installation. Here is the full breakdown, what moves the number, and how to save.',
    content: costToReplaceContent,
    author: AUTHOR,
    category: 'Cost & Budget',
    hubSlug: 'kitchen-cabinets',
    tags: ['cost', 'replace', 'budget', 'remodel', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'How much does it cost to replace kitchen cabinets?', answer: 'It depends most on kitchen size, cabinet type (stock, semi-custom, or custom), and whether you include installation. Cabinets are priced per linear foot, so a small galley kitchen costs far less than a large kitchen with an island. The range is wide from budget stock to high-end custom, so an itemized quote for your kitchen is the only reliable number.' },
      { question: 'How are kitchen cabinets priced?', answer: 'Most often by the linear foot — the length of wall the cabinets run along. Your quote typically reflects your kitchen’s linear footage times a per-foot price for the cabinet line, plus specialty cabinets, accessories, and labor. This makes kitchen size the single biggest factor in the total.' },
      { question: 'What is the biggest factor in cabinet replacement cost?', answer: 'After kitchen size, the cabinet type is the biggest lever: stock is the most affordable, semi-custom is a moderate step up, and custom sits at the top. The gap between budget stock and high-end custom is large, so choosing the tier that fits your priorities is the most important cost decision.' },
      { question: 'Does replacing cabinets include new countertops?', answer: 'Usually, yes, as a related cost. Old countertops rarely survive cabinet removal, so replacing cabinets typically means new counters too — a separate line to budget for. Make sure any quote is clear about whether it is cabinets only or a full installed project including related work.' },
      { question: 'Is it cheaper to reface or replace cabinets?', answer: 'Refacing (new doors and a skin on existing boxes) and refinishing (repainting existing doors) are both cheaper than full replacement and work when your boxes and layout are sound. Replace only when the layout is wrong, the boxes are failing, or you want to reconfigure — it is the most expensive but the only option that changes the layout and box quality.' },
      { question: 'How can I save money replacing kitchen cabinets?', answer: 'Keep your existing layout to avoid moving plumbing and electrical, choose a more affordable cabinet tier but do not skimp on construction quality, limit specialty accessories to the few that help, consider refacing if your boxes are sound, and get multiple itemized quotes. Spend where it lasts — construction and layout — and save on the extras.' },
    ],
    quickAnswer:
      'The cost to replace kitchen cabinets depends most on your kitchen size, the cabinet type (stock, semi-custom, or custom), the construction quality and finishes, and whether you include installation. Cabinets are priced per linear foot, so kitchen size sets the baseline. Before replacing, consider whether refinishing or refacing could deliver the look for less, and get an itemized quote for an accurate number.',
    keyTakeaways: [
      'Cost is driven by kitchen size, cabinet tier, and installation.',
      'Cabinets are priced per linear foot; construction and labor move the number.',
      'Consider refacing or refinishing first; get an itemized quote.',
    ],
    relatedLinks: [
      { url: '/blog/cabinet-cost-per-linear-foot', anchor: 'Cost per linear foot' },
      { url: '/blog/stock-vs-custom-cabinets-boise', anchor: 'Stock vs custom' },
      { url: '/blog/cabinet-refacing-vs-refinishing-vs-replacing', anchor: 'Reface vs refinish vs replace' },
      { url: '/blog/custom-kitchen-cabinet-cost', anchor: 'Custom cabinet cost' },
      { url: '/guides/boise-cabinet-cost-guide', anchor: 'Boise Cabinet Cost Guide' },
    ],
    primaryKeyword: 'cost to replace kitchen cabinets',
    secondaryKeywords: ['how much does it cost to replace kitchen cabinets', 'kitchen cabinet replacement cost', 'new kitchen cabinets cost', 'cabinet installation cost'],
    searchIntent: 'Commercial / cost — homeowners budgeting cabinet replacement',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'painted-vs-stained-cabinets',
    title: 'Painted vs Stained Cabinets: Which Is Right for You?',
    seoTitle: 'Painted vs Stained Cabinets: Look, Durability & How to Choose',
    metaDescription:
      'Painted vs stained cabinets compared: painted gives a smooth, color-flexible finish that hides grain; stained shows natural wood grain and hides wear. Look, durability, cost, and how to choose.',
    excerpt:
      'Painted cabinets give a smooth, color-flexible finish; stained cabinets show off natural wood grain and hide wear. Here is how they compare on look, durability, cost, and upkeep.',
    content: paintedVsStainedContent,
    author: AUTHOR,
    category: 'Colors & Finishes',
    hubSlug: 'kitchen-cabinets',
    tags: ['painted', 'stained', 'finish', 'colors', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What is the difference between painted and stained cabinets?', answer: 'Painted cabinets have an opaque colored coating that covers the wood for a smooth, uniform finish in any color; stained cabinets have a translucent color that soaks in and enhances the natural grain and warmth. Painted suits modern and colorful looks; stained suits warm, natural kitchens.' },
      { question: 'Are painted or stained cabinets more durable?', answer: 'Each wears differently rather than one being simply tougher. A quality painted finish is hard, but chips at edges show more against the solid color and are harder to touch up. Stained finishes hide small scratches and everyday wear better and touch up more invisibly, so they often age more gracefully in a busy kitchen.' },
      { question: 'Are painted cabinets more expensive than stained?', answer: 'Generally, yes. Achieving a smooth, flawless painted finish requires more prep, more coats, and a tight-grained wood or MDF panel, which adds cost. Stained finishes involve fewer steps, though a premium wood species can raise a stained kitchen’s material cost. The finish is only one factor in the total.' },
      { question: 'Do painted or stained cabinets hide wear better?', answer: 'Stained cabinets hide wear better because the grain and tone camouflage small scratches and marks, and they touch up more invisibly. Painted cabinets show chips and dings more against the solid color. For a hard-working family kitchen where you want wear to disappear, stained has an edge.' },
      { question: 'Can you have both painted and stained cabinets?', answer: 'Yes — combining them in a two-tone kitchen is very popular. A painted perimeter with a natural stained-wood island (or vice versa) blends the clean, color-flexible quality of paint with the warmth and grain of wood. Keep one finish neutral and tie them together with consistent hardware.' },
      { question: 'Should I choose painted or stained cabinets?', answer: 'Choose painted for a smooth, clean, current look or a specific color, especially white or a bold hue, if you accept slightly more careful upkeep. Choose stained if you love natural wood, want warmth and character, and value a finish that hides wear and touches up easily. Or combine them in a two-tone kitchen.' },
    ],
    quickAnswer:
      'Painted cabinets have an opaque coating that covers the wood for a smooth, color-flexible finish ideal for modern and colorful kitchens; stained cabinets have a translucent color that shows off the natural wood grain and warmth and hides everyday wear more forgivingly. Painted costs a little more and shows chips; stained locks you into wood tones but ages gracefully. Choose based on color flexibility versus natural warmth — or combine them in a two-tone kitchen.',
    keyTakeaways: [
      'Painted hides grain and comes in any color; stained shows grain and warmth.',
      'Stained hides wear and touches up more easily; painted shows chips more.',
      'Combine both in a two-tone kitchen for the best of each.',
    ],
    relatedLinks: [
      { url: '/blog/cabinet-finishes-colors-guide', anchor: 'Cabinet colors and finishes' },
      { url: '/blog/best-wood-for-kitchen-cabinets', anchor: 'Best wood for cabinets' },
      { url: '/blog/two-tone-kitchen-cabinets', anchor: 'Two-tone kitchens' },
      { url: '/blog/cabinet-construction-quality-guide', anchor: 'Construction quality' },
      { url: '/cabinets/kitchen' },
    ],
    primaryKeyword: 'painted vs stained cabinets',
    secondaryKeywords: ['painted cabinets', 'stained cabinets', 'painted or stained kitchen cabinets', 'cabinet finish comparison'],
    searchIntent: 'Commercial / comparison — homeowners choosing a cabinet finish',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'prefab-cabinets-explained',
    title: 'Prefab Cabinets Explained: Pros, Cons & Alternatives',
    seoTitle: 'Prefab Cabinets Explained: Pros, Cons & Alternatives',
    metaDescription:
      'Prefab cabinets are mass-produced in standard sizes and finishes, sold assembled or as RTA flat packs. Here are the real pros and cons, quality to check, and how they compare to custom.',
    excerpt:
      'Prefab cabinets are mass-produced in standard sizes, sold assembled or as RTA flat packs. Affordable and fast but limited. Here are the pros, cons, and how they compare to semi-custom and custom.',
    content: prefabContent,
    author: AUTHOR,
    category: 'Types & Construction',
    hubSlug: 'kitchen-cabinets',
    tags: ['prefab', 'rta', 'stock', 'construction', 'budget'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'What are prefab cabinets?', answer: 'Prefab (prefabricated) cabinets are mass-produced in standard sizes, styles, and finishes, built in advance and sold ready to install — either fully assembled or as ready-to-assemble (RTA) flat packs. They are essentially stock cabinets: affordable, quick to get, and predictable, but limited to a fixed menu of sizes and finishes.' },
      { question: 'Are prefab cabinets good quality?', answer: 'Quality varies enormously from line to line. Some prefab and RTA cabinets are well built with plywood boxes and soft-close hardware; others use particleboard and basic parts that wear out. Do not assume all prefab is the same — inspect the box construction, drawer joinery, and hardware rather than choosing on price alone.' },
      { question: 'What is the difference between prefab and RTA cabinets?', answer: 'RTA (ready-to-assemble) is a form of prefab that ships flat-packed as parts you or an installer put together, which lowers shipping cost. Other prefab cabinets arrive fully assembled and ready to hang. Both are mass-produced in standard sizes; RTA simply trades assembly time for lower cost.' },
      { question: 'Are prefab cabinets cheaper than custom?', answer: 'Yes, significantly. Because they are mass-produced to fixed specifications, prefab/stock cabinets are the most affordable option, while custom cabinets built to your exact specs sit at the top of the range. Semi-custom falls in between. The trade-off for prefab’s lower price is limited sizes, finishes, and flexibility.' },
      { question: 'What are the downsides of prefab cabinets?', answer: 'Limited standard sizes that may not fit your walls exactly (leaving filler gaps), a fixed menu of finishes and styles, less flexibility for irregular layouts, construction quality that varies widely, and assembly required for RTA. They are not ideal when you want a precise fit, specific finishes, or maximum use of an awkward space.' },
      { question: 'Should I buy prefab or semi-custom cabinets?', answer: 'Prefab suits tight budgets, rentals and flips, standard-layout kitchens, and DIYers. Step up to semi-custom or custom if you have irregular walls, want specific colors or door styles, need to maximize every inch, or want the longest-lasting construction. Many kitchens that start with prefab in mind end up semi-custom once filler gaps and finish limits become clear.' },
    ],
    quickAnswer:
      'Prefab cabinets are mass-produced in standard sizes and finishes, sold either fully assembled or as ready-to-assemble (RTA) flat packs. Their strengths are low cost, fast availability, and predictability, making them ideal for budget projects, rentals, and standard-layout kitchens. Their limits are fixed sizes and finishes, less flexibility for irregular spaces, and construction quality that varies widely and must be inspected.',
    keyTakeaways: [
      'Prefab = mass-produced, standard-size cabinets, assembled or RTA flat-pack.',
      'Affordable and fast but limited in sizing, finishes, and flexibility.',
      'Quality varies widely — inspect boxes, drawers, and hardware.',
    ],
    relatedLinks: [
      { url: '/blog/stock-vs-custom-cabinets-boise', anchor: 'Stock vs custom' },
      { url: '/blog/what-are-rta-cabinets', anchor: 'What are RTA cabinets' },
      { url: '/blog/cabinet-construction-quality-guide', anchor: 'Construction quality' },
      { url: '/blog/custom-kitchen-cabinet-cost', anchor: 'Custom cabinet cost' },
      { url: '/cabinets/kitchen' },
    ],
    primaryKeyword: 'prefab cabinets',
    secondaryKeywords: ['prefab kitchen cabinets', 'prefabricated cabinets', 'rta cabinets', 'stock cabinets'],
    searchIntent: 'Informational — homeowners researching prefab/stock cabinets',
    wordCountTarget: 'pillar',
  },
  {
    slug: 'kitchen-cabinet-height-guide',
    title: 'Kitchen Cabinet Height Guide (Base, Wall & Tall Cabinets)',
    seoTitle: 'Kitchen Cabinet Height Guide: Base, Wall & Tall Cabinet Heights',
    metaDescription:
      'Kitchen cabinet height guide: base cabinets are 34.5 inches (36 with counter), uppers 30/36/42 inches, tall cabinets 84/90/96 inches, with an 18-inch gap. Standards and when to customize.',
    excerpt:
      'Base cabinets are 34.5 inches (36 with the counter), uppers 30/36/42 inches, and tall cabinets 84/90/96 inches, with an 18-inch backsplash gap. Here is every standard height and when to customize.',
    content: heightGuideContent,
    author: AUTHOR,
    category: 'Sizes & Dimensions',
    hubSlug: 'kitchen-cabinets',
    tags: ['height', 'sizes', 'dimensions', 'planning', 'kitchen'],
    publishedAt: '2026-07-11',
    faqs: [
      { question: 'How tall are standard kitchen cabinets?', answer: 'Base cabinets are 34.5 inches tall (36 inches with the countertop), upper (wall) cabinets come in 30, 36, or 42 inches, and tall/pantry cabinets are 84, 90, or 96 inches. The standard gap between the countertop and the bottom of the upper cabinets is 18 inches.' },
      { question: 'How tall are upper kitchen cabinets?', answer: 'Upper cabinets come in three standard heights: 30 inches (traditional, leaving space to the ceiling), 36 inches (more storage, taller ceilings), and 42 inches (increasingly popular for taking cabinets to the ceiling in standard rooms). Taller uppers add storage but put the top shelves out of easy reach.' },
      { question: 'What is the standard height between counter and upper cabinets?', answer: 'The standard gap is 18 inches. This ergonomic distance gives enough room to work on the counter and use small appliances while keeping the uppers accessible. It can be adjusted slightly — a taller cook might prefer 19 to 20 inches — but 18 inches is the tested sweet spot for most kitchens.' },
      { question: 'How tall is a kitchen counter?', answer: 'Standard finished counter height is 36 inches — a 34.5-inch base cabinet plus a roughly 1.5-inch countertop. This height is based on ergonomics as a comfortable working height for average-height people, and standard appliances like dishwashers and ranges are built to fit flush under it.' },
      { question: 'How tall are pantry and tall cabinets?', answer: 'Tall cabinets — pantry, utility, and oven cabinets — come in standard heights of 84, 90, and 96 inches to suit different ceilings. An 84-inch cabinet fits a standard 8-foot ceiling; 90- and 96-inch cabinets take fuller advantage of 9-foot ceilings, running nearly to the ceiling for maximum storage.' },
      { question: 'Can kitchen cabinet heights be customized?', answer: 'Yes. Counter height can be raised for tall cooks or lowered for shorter people, baking stations, or seated accessibility; uppers can be mounted lower or fitted with pull-down shelves; and upper and tall cabinet heights flex to fit your ceiling. Standard heights suit most people, but customizing to your body and ceiling is a benefit of custom cabinetry.' },
    ],
    quickAnswer:
      'Standard kitchen cabinet heights are: base cabinets 34.5 inches (36 inches with the countertop), upper cabinets 30, 36, or 42 inches, and tall/pantry cabinets 84, 90, or 96 inches, with an 18-inch gap between the counter and the bottom of the uppers. These heights are based on ergonomics and standard appliances but can be customized for your ceiling, your height, and accessibility.',
    keyTakeaways: [
      'Base 34.5" (36" with counter); uppers 30/36/42"; tall 84/90/96".',
      'Standard counter-to-upper gap is 18 inches.',
      'Heights can be customized for ceilings, your height, and accessibility.',
    ],
    relatedLinks: [
      { url: '/blog/standard-kitchen-cabinet-sizes', anchor: 'Standard cabinet sizes' },
      { url: '/blog/how-deep-are-kitchen-cabinets', anchor: 'Cabinet depths' },
      { url: '/blog/how-to-plan-a-kitchen-cabinet-project', anchor: 'Plan a kitchen project' },
      { url: '/blog/kitchen-cabinet-organization-ideas', anchor: 'Organization ideas' },
      { url: '/cabinets/kitchen' },
    ],
    primaryKeyword: 'kitchen cabinet height',
    secondaryKeywords: ['how tall are kitchen cabinets', 'standard cabinet height', 'upper cabinet height', 'kitchen counter height'],
    searchIntent: 'Informational — homeowners researching cabinet heights',
    wordCountTarget: 'pillar',
  },
];
