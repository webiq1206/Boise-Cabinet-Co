/**
 * Published buyer guide on cabinet box materials, TSCA Title VI labels,
 * and KCMA certification. Copy is the approved P4 draft with editor notes,
 * source citations, and open questions removed.
 */
import type { BlogPostData } from '../blogContent';

const content = `
<p>Door style and finish get most of the attention in a cabinet project, and they should. You see them every day. What you <em>don't</em> see is the <a href="/blog/cabinet-construction-quality-guide">cabinet box</a>: the sides, bottom, back, and shelves that hold everything up. That's where materials, emissions labels, and testing programs come in, and where a few questions before fabrication can save you from surprises.</p>
<p>Here's a plain guide to what goes into cabinet boxes, what the labels mean, and what to ask before anything is built.</p>

<h2>The four box materials you'll hear about</h2>
<p><strong>Plywood.</strong> Thin layers of wood veneer glued in alternating directions. Plywood is light for its strength, and it's the material many people picture when they hear "solid" cabinet construction.</p>
<p><strong>Particleboard.</strong> Wood particles bonded with resin and pressed into panels. It's dense, flat, and economical. It's often used as the core of laminated or melamine-faced panels.</p>
<p><strong>MDF (medium-density fiberboard).</strong> Fine wood fibers pressed with resin into a very smooth, uniform panel. MDF is common in painted parts because it machines cleanly and has no grain to telegraph through paint.</p>
<p><strong>Melamine-faced panels.</strong> A durable decorative surface fused to a composite core, usually particleboard or MDF. "Melamine" describes the face, not the core, so ask what's underneath.</p>
<p>Each has trade-offs. The right choice depends on where the cabinet goes, how it will be finished, and how it's built and installed. What matters most is that you know which material you're getting for each part of the box, and that it's written down.</p>

<h2>What a "TSCA Title VI" label means</h2>
<p>Plywood, particleboard, and MDF are all <strong>composite wood products</strong>, which means they're made with adhesives. Under the federal Formaldehyde Standards for Composite Wood Products Act, the EPA sets formaldehyde emission limits for these panels.</p>
<p>According to the EPA:</p>
<ul>
  <li>The final national rule was published on <strong>December 12, 2016</strong>. EPA worked with the California Air Resources Board (CARB) to keep it consistent with California's existing requirements.</li>
  <li><strong>After March 22, 2019</strong>, regulated composite wood products must be <strong>labeled as TSCA Title VI compliant.</strong> That includes hardwood plywood, MDF, and particleboard, <em>and</em> household and other finished goods that contain them.</li>
  <li>Compliance is certified through a <strong>third-party certification program</strong> for laboratory testing and oversight of emissions.</li>
</ul>
<p><strong>In practice:</strong> composite panels used in cabinets, and finished goods made with them, are subject to the TSCA Title VI rule. If a supplier mentions "CARB Phase 2," that's the California standard. EPA describes the two emission standards as set at identical levels, but after March 22, 2019, EPA requires the TSCA Title VI label.</p>

<h2>What KCMA certification means</h2>
<p>The Kitchen Cabinet Manufacturers Association (KCMA) runs <strong>voluntary</strong> third-party certification programs. A cabinet line doesn't need them to be sold, but they're useful to know about:</p>
<ul>
  <li><strong>A161.1 Quality Certification.</strong> KCMA says certified cabinets have passed tests of structural strength, drawer and door integrity, and finish durability. It describes 14 tests, including a 600-pound load test.</li>
  <li><strong>Environmental Stewardship Program (ESP).</strong> This certifies <em>manufacturers</em> that follow KCMA's sustainability practices.</li>
  <li><strong>Severe Use Certification.</strong> Originally developed by HUD for cabinets that face very heavy wear, like apartment kitchens.</li>
</ul>
<p>KCMA also notes that certified cabinets exist at every price point. A cabinet without a KCMA seal isn't automatically lower quality, though. Many custom and small-shop cabinets are never submitted for certification. Treat the seal as one piece of evidence, not the only one.</p>

<h2>Questions to ask before your cabinets are built</h2>
<p>Whether you're comparing <a href="/blog/how-to-compare-cabinet-quotes">quotes</a> across the <a href="/guides/treasure-valley-cabinet-guide">Treasure Valley</a> or finalizing a design, these <a href="/blog/questions-to-ask-cabinet-company">questions</a> are fair to ask any cabinet company, including us:</p>
<ol>
  <li><strong>What is each part of the box made of?</strong> Sides, bottom, back, shelves, and drawer boxes can all be different materials. Ask for each one.</li>
  <li><strong>What's the core under any melamine or laminate?</strong></li>
  <li><strong>Do the composite panels carry TSCA Title VI compliance labeling, and can you show me the documentation?</strong></li>
  <li><strong>Are any parts of this line KCMA-certified?</strong> If not, what testing or warranty stands behind them?</li>
  <li><strong>Is all of this in my written scope before the build starts?</strong> Materials belong in the same written document as door style, finish, and hardware, so there's nothing to reinterpret later.</li>
  <li><strong>What does the <a href="/warranty">warranty</a> cover for the box itself,</strong> as opposed to doors, hardware, and finish?</li>
</ol>

<h2>The short version</h2>
<p>You'll touch the doors every day, but the box is what you're really paying to last. Know the material for each part, look for the TSCA Title VI label on composite panels, treat KCMA seals as helpful extra evidence, and get it all in writing before the build starts.</p>
<p>Planning a <a href="/guides/boise-kitchen-cabinet-guide">kitchen</a>, a <a href="/guides/boise-bathroom-vanity-guide">vanity</a>, or <a href="/guides/built-in-cabinet-guide">built-ins</a>? Share your project with our team and we'll walk through the materials, finishes, and written scope together. <strong><a href="/estimate">Start my estimate →</a></strong></p>
<p>Product details vary by manufacturer and line; confirm specifics in your written quote.</p>
<p><strong>Boise Cabinet Co · A P5 Home Company</strong></p>
`;

export const CABINET_MATERIALS_LABELS_POST: BlogPostData = {
  slug: 'cabinet-materials-labels-certifications',
  title: "What's inside your cabinet boxes? Materials, labels, and certifications",
  seoTitle: "What's Inside Your Cabinet Boxes? Materials, Labels & Certifications",
  metaDescription:
    'Plywood, particleboard, MDF and melamine explained, plus what a TSCA Title VI label and KCMA certification mean, and the questions to ask before Treasure Valley cabinets are built.',
  excerpt:
    "Here's a plain guide to what goes into cabinet boxes, what the labels mean, and what to ask before anything is built.",
  content,
  author: 'Boise Cabinet Co',
  category: 'Choosing a Cabinet Company',
  hubSlug: 'choosing-cabinet-company',
  tags: ['materials', 'labels', 'certifications', 'cabinets'],
  publishedAt: '2026-10-16',
  faqs: [
    {
      question: 'What are the four cabinet box materials?',
      answer:
        'Plywood is thin layers of wood veneer glued in alternating directions. Particleboard is wood particles bonded with resin and pressed into panels. MDF (medium-density fiberboard) is fine wood fibers pressed with resin into a very smooth, uniform panel. Melamine-faced panels are a durable decorative surface fused to a composite core, usually particleboard or MDF. Melamine describes the face, not the core.',
    },
    {
      question: 'What does a TSCA Title VI label mean?',
      answer:
        'Plywood, particleboard, and MDF are composite wood products made with adhesives. Under the federal Formaldehyde Standards for Composite Wood Products Act, the EPA sets formaldehyde emission limits for these panels. After March 22, 2019, regulated composite wood products must be labeled as TSCA Title VI compliant. That includes hardwood plywood, MDF, and particleboard, and household and other finished goods that contain them. Compliance is certified through a third-party certification program.',
    },
    {
      question: 'How does CARB Phase 2 relate to TSCA Title VI?',
      answer:
        "If a supplier mentions CARB Phase 2, that's the California standard. EPA describes the two emission standards as set at identical levels, but after March 22, 2019, EPA requires the TSCA Title VI label.",
    },
    {
      question: 'What does KCMA certification mean?',
      answer:
        "The Kitchen Cabinet Manufacturers Association (KCMA) runs voluntary third-party certification programs. A cabinet line doesn't need them to be sold. A161.1 Quality Certification means KCMA says certified cabinets have passed tests of structural strength, drawer and door integrity, and finish durability (14 tests, including a 600-pound load test). The Environmental Stewardship Program certifies manufacturers that follow KCMA's sustainability practices. Severe Use Certification was originally developed by HUD for cabinets that face very heavy wear, like apartment kitchens.",
    },
    {
      question: 'Does a missing KCMA seal mean lower quality?',
      answer:
        "A cabinet without a KCMA seal isn't automatically lower quality. KCMA notes that certified cabinets exist at every price point, and many custom and small-shop cabinets are never submitted for certification. Treat the seal as one piece of evidence, not the only one.",
    },
    {
      question: 'What should I ask before my cabinets are built?',
      answer:
        'Ask what each part of the box is made of (sides, bottom, back, shelves, and drawer boxes), what the core is under any melamine or laminate, whether the composite panels carry TSCA Title VI compliance labeling and whether the documentation can be shown, whether any parts of the line are KCMA-certified and if not what testing or warranty stands behind them, whether all of this is in the written scope before the build starts, and what the warranty covers for the box itself.',
    },
  ],
  relatedLinks: [
    { url: '/guides/choose-cabinet-company-boise', anchor: 'Choosing a Cabinet Company' },
    { url: '/blog/cabinet-construction-quality-guide', anchor: 'Cabinet construction quality' },
    { url: '/blog/questions-to-ask-cabinet-company', anchor: 'Questions to ask a cabinet company' },
    { url: '/blog/how-to-compare-cabinet-quotes', anchor: 'How to compare cabinet quotes' },
    { url: '/blog/cabinet-warranty-guide', anchor: 'Cabinet warranty' },
    { url: '/guides/treasure-valley-cabinet-guide', anchor: 'Treasure Valley cabinet guide' },
    { url: '/guides/boise-kitchen-cabinet-guide', anchor: 'Kitchen cabinets' },
    { url: '/guides/boise-bathroom-vanity-guide', anchor: 'Bathroom vanities' },
    { url: '/guides/built-in-cabinet-guide', anchor: 'Built-ins' },
  ],
  quickAnswer:
    "You'll touch the doors every day, but the box is what you're really paying to last. Know the material for each part, look for the TSCA Title VI label on composite panels, treat KCMA seals as helpful extra evidence, and get it all in writing before the build starts.",
  keyTakeaways: [
    'Know the material for each part.',
    'Look for the TSCA Title VI label on composite panels.',
    'Treat KCMA seals as helpful extra evidence.',
    'Get it all in writing before the build starts.',
  ],
  primaryKeyword: 'cabinet box materials',
  secondaryKeywords: ['TSCA Title VI', 'KCMA certification', 'melamine cabinet boxes', 'particleboard vs plywood cabinets'],
  searchIntent: 'Informational: what cabinet box materials, TSCA Title VI labels, and KCMA certification mean before a build',
  wordCountTarget: 'cluster',
};
