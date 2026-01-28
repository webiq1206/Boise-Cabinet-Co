/**
 * Static HTML Mirror Generator
 * Generates SEO-optimized HTML pages for all public content
 * Run: npx tsx scripts/generate-html-mirror.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { BLOG_POSTS, type BlogPostData } from '../shared/blogContent';
import { PRIORITY_SERVICES, CITIES, type ServiceData, type CityData } from '../shared/contentData';
import {
  htmlDocument,
  faqSectionHtml,
  contactInfoHtml,
  listHtml,
  processStepsHtml,
  convertToHtmlLinks,
  escapeHtml,
  localBusinessSchema,
  webSiteSchema,
  serviceSchema,
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  webPageSchema,
  type PageMeta,
} from './html-templates';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'html');
const BASE_URL = 'https://lawncarekuna.com';

// Statistics for verification
const stats = {
  corePages: 0,
  servicePages: 0,
  geoPages: 0,
  blogPages: 0,
  areaPages: 0,
  commercialPages: 0,
  total: 0,
};

/**
 * Ensure directory exists
 */
function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Write HTML file
 */
function writeHtml(filePath: string, content: string): void {
  fs.writeFileSync(filePath, content, 'utf-8');
  stats.total++;
}

/**
 * Clean output directory
 */
function cleanOutputDir(): void {
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true });
  }
  ensureDir(OUTPUT_DIR);
}

// ============================================
// CORE PAGES
// ============================================

function generateHomePage(): void {
  const meta: PageMeta = {
    title: 'Lawn Care Kuna | Professional Landscaping | Free Quotes',
    description: 'Professional lawn care & landscaping in Kuna, Boise, Meridian & Treasure Valley. Licensed, insured, top-rated. Call (208) 352-2011 for your free quote today!',
    canonicalPath: '/',
    schemaData: [localBusinessSchema(), webSiteSchema()],
  };

  const content = `
    <h1>Professional Lawn Care & Landscaping in Treasure Valley, Idaho</h1>
    
    <p>Welcome to <strong>Lawn Care Kuna</strong>, the Treasure Valley's trusted provider of professional lawn care and landscaping services since 2017. We proudly serve homeowners and businesses throughout <a href="/html/areas/kuna.html">Kuna</a>, <a href="/html/areas/boise.html">Boise</a>, <a href="/html/areas/meridian.html">Meridian</a>, <a href="/html/areas/eagle.html">Eagle</a>, <a href="/html/areas/star.html">Star</a>, and <a href="/html/areas/middleton.html">Middleton</a>, Idaho.</p>
    
    <h2>Our Services</h2>
    <p>From routine lawn maintenance to complete landscape transformations, we offer comprehensive outdoor services tailored to Idaho's unique climate:</p>
    
    <h3>Lawn Care Services</h3>
    <ul>
      <li><a href="/html/services/lawn-mowing.html">Professional Lawn Mowing</a> - Weekly and bi-weekly service</li>
      <li><a href="/html/services/fertilization.html">Fertilization Programs</a> - Custom nutrient plans for Idaho soil</li>
      <li><a href="/html/services/aeration.html">Core Aeration</a> - Essential for clay soil health</li>
      <li><a href="/html/services/weed-control.html">Weed Control</a> - Eliminate dandelions and crabgrass</li>
      <li><a href="/html/services/overseeding.html">Overseeding</a> - Thicken thin, patchy lawns</li>
      <li><a href="/html/services/dethatching.html">Dethatching</a> - Remove thatch buildup</li>
    </ul>
    
    <h3>Landscaping Services</h3>
    <ul>
      <li><a href="/html/services/landscaping.html">Landscape Design & Installation</a></li>
      <li><a href="/html/services/sod-installation.html">Sod Installation</a> - New lawn installation</li>
      <li><a href="/html/services/mulch-installation.html">Mulch Installation</a> - Beds and borders</li>
      <li><a href="/html/services/tree-trimming.html">Tree Trimming</a> - Professional pruning</li>
      <li><a href="/html/services/hedge-trimming.html">Hedge Trimming</a> - Shape and maintain</li>
      <li><a href="/html/services/retaining-walls.html">Retaining Walls</a> - Structural landscaping</li>
    </ul>
    
    <h3>Irrigation Services</h3>
    <ul>
      <li><a href="/html/services/sprinkler-system-installation.html">Sprinkler System Installation</a></li>
      <li><a href="/html/services/irrigation-repair.html">Irrigation Repair</a></li>
      <li><a href="/html/services/sprinkler-blowout.html">Sprinkler Blowout</a> - Winterization</li>
      <li><a href="/html/services/irrigation-maintenance.html">Irrigation Maintenance</a></li>
    </ul>
    
    <h3>Seasonal Services</h3>
    <ul>
      <li><a href="/html/services/seasonal-cleanup.html">Spring & Fall Cleanup</a></li>
      <li><a href="/html/services/christmas-lights.html">Christmas Light Installation</a></li>
    </ul>
    
    <h2>Why Choose Lawn Care Kuna?</h2>
    <ul>
      <li><strong>Licensed & Insured</strong> - Full liability coverage for your protection</li>
      <li><strong>Local Expertise</strong> - We understand Idaho's unique soil and climate</li>
      <li><strong>Transparent Pricing</strong> - Free quotes with no hidden fees</li>
      <li><strong>Reliable Service</strong> - Consistent, professional care every time</li>
      <li><strong>Satisfaction Guaranteed</strong> - We stand behind our work</li>
    </ul>
    
    <h2>Service Areas</h2>
    <p>We proudly serve residential and commercial properties throughout the Treasure Valley:</p>
    <ul>
      <li><a href="/html/areas/kuna.html">Kuna, Idaho</a> - Our home base</li>
      <li><a href="/html/areas/boise.html">Boise, Idaho</a> - Idaho's capital city</li>
      <li><a href="/html/areas/meridian.html">Meridian, Idaho</a> - Fast-growing community</li>
      <li><a href="/html/areas/eagle.html">Eagle, Idaho</a> - Premium properties</li>
      <li><a href="/html/areas/star.html">Star, Idaho</a> - Rural and suburban</li>
      <li><a href="/html/areas/middleton.html">Middleton, Idaho</a> - Canyon County</li>
    </ul>
    
    ${contactInfoHtml()}
    
    <h2>Latest from Our Blog</h2>
    <p>Get expert lawn care tips and seasonal guides for Idaho homeowners:</p>
    <ul>
      <li><a href="/html/blog/index.html">Browse All Articles</a></li>
    </ul>
  `;

  writeHtml(path.join(OUTPUT_DIR, 'index.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generateAboutPage(): void {
  const meta: PageMeta = {
    title: 'About Us | Lawn Care Kuna | Professional Landscaping',
    description: 'Learn about Lawn Care Kuna - professional lawn care and landscaping serving the Treasure Valley since 2017. Licensed, insured, locally owned.',
    canonicalPath: '/about',
    schemaData: [localBusinessSchema(), webPageSchema('About Lawn Care Kuna', 'Professional lawn care company serving Idaho since 2017', `${BASE_URL}/about`)],
  };

  const content = `
    <h1>About Lawn Care Kuna</h1>
    
    <p>Professional lawn care and landscaping services serving the Treasure Valley since 2017.</p>
    
    <h2>Our Story</h2>
    <p>Since 2017, Lawn Care Kuna has been providing professional lawn care and landscaping services to homeowners and businesses throughout the Treasure Valley. What started as a local lawn mowing service has grown into a comprehensive landscaping company offering everything from basic lawn maintenance to complex hardscaping projects.</p>
    
    <p>We understand Idaho's unique climate challenges - from scorching summer heat to freezing winter temperatures. Our team has the local expertise to ensure your lawn and landscape thrives year-round in our high-desert climate.</p>
    
    <p>Today, we proudly serve residential and commercial properties across <a href="/html/areas/kuna.html">Kuna</a>, <a href="/html/areas/boise.html">Boise</a>, <a href="/html/areas/meridian.html">Meridian</a>, <a href="/html/areas/eagle.html">Eagle</a>, <a href="/html/areas/star.html">Star</a>, and <a href="/html/areas/middleton.html">Middleton</a>, maintaining our commitment to honest service, quality workmanship, and customer satisfaction.</p>
    
    <h2>Our Values</h2>
    <ul>
      <li><strong>Quality First</strong> - We never compromise on quality. Every job is done right the first time with attention to detail.</li>
      <li><strong>Integrity</strong> - Honest pricing, transparent communication, and ethical business practices you can trust.</li>
      <li><strong>Customer Focus</strong> - Your satisfaction is our priority. We listen, deliver, and exceed expectations.</li>
      <li><strong>Excellence</strong> - Continuous improvement and dedication to being the best in lawn care services.</li>
    </ul>
    
    <h2>Credentials & Certifications</h2>
    <ul>
      <li>Licensed Idaho Contractor</li>
      <li>Pesticide Applicator License</li>
      <li>ISA Certified Arborist</li>
      <li>NALP Certified Landscape Professional</li>
      <li>Fully Insured - $2M Liability Coverage</li>
    </ul>
    
    <h2>Our Service Area</h2>
    <p>We serve the entire Treasure Valley including:</p>
    <ul>
      <li><a href="/html/areas/kuna.html">Kuna</a> (Primary)</li>
      <li><a href="/html/areas/boise.html">Boise</a></li>
      <li><a href="/html/areas/meridian.html">Meridian</a></li>
      <li><a href="/html/areas/eagle.html">Eagle</a></li>
      <li><a href="/html/areas/star.html">Star</a></li>
      <li><a href="/html/areas/middleton.html">Middleton</a></li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'about.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generateContactPage(): void {
  const meta: PageMeta = {
    title: 'Contact Us | Lawn Care Kuna | Free Quotes',
    description: 'Contact Lawn Care Kuna for a free lawn care quote. Call (208) 352-2011 or email hello@lawncarekuna.com. Serving Kuna, Boise, Meridian & Treasure Valley.',
    canonicalPath: '/contact',
    schemaData: [localBusinessSchema()],
  };

  const content = `
    <h1>Contact Lawn Care Kuna</h1>
    
    <p>Ready to transform your outdoor space? Contact us today for a free, no-obligation quote on any of our lawn care and landscaping services.</p>
    
    <h2>Get in Touch</h2>
    <div class="contact-info">
      <p><strong>Phone:</strong> <a href="tel:+12083522011">(208) 352-2011</a></p>
      <p><strong>Email:</strong> <a href="mailto:hello@lawncarekuna.com">hello@lawncarekuna.com</a></p>
      <p><strong>Address:</strong> 2283 N Coopers Hawk Ave, Kuna, Idaho 83634</p>
    </div>
    
    <h2>Business Hours</h2>
    <table>
      <tr><th>Day</th><th>Hours</th></tr>
      <tr><td>Monday - Friday</td><td>7:00 AM - 6:00 PM</td></tr>
      <tr><td>Saturday</td><td>8:00 AM - 4:00 PM</td></tr>
      <tr><td>Sunday</td><td>Closed</td></tr>
    </table>
    
    <h2>Service Areas</h2>
    <p>We provide lawn care and landscaping services throughout the Treasure Valley:</p>
    <ul>
      <li><a href="/html/areas/kuna.html">Kuna, Idaho</a></li>
      <li><a href="/html/areas/boise.html">Boise, Idaho</a></li>
      <li><a href="/html/areas/meridian.html">Meridian, Idaho</a></li>
      <li><a href="/html/areas/eagle.html">Eagle, Idaho</a></li>
      <li><a href="/html/areas/star.html">Star, Idaho</a></li>
      <li><a href="/html/areas/middleton.html">Middleton, Idaho</a></li>
    </ul>
    
    <h2>Request a Quote</h2>
    <p>For the fastest service, visit our online quote wizard:</p>
    <p><a href="/html/get-quote.html" class="cta">Get a Free Quote Online</a></p>
    
    <p>Or call us directly at <a href="tel:+12083522011">(208) 352-2011</a> to speak with a lawn care specialist.</p>
  `;

  writeHtml(path.join(OUTPUT_DIR, 'contact.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generateServicesIndexPage(): void {
  const meta: PageMeta = {
    title: 'Services | Lawn Care Kuna | Professional Landscaping',
    description: 'Complete lawn care and landscaping services in Treasure Valley Idaho. Mowing, fertilization, aeration, landscaping, irrigation, and seasonal services.',
    canonicalPath: '/services',
    schemaData: [localBusinessSchema()],
  };

  // Group services by category
  const categories: Record<string, ServiceData[]> = {};
  PRIORITY_SERVICES.forEach(service => {
    if (!categories[service.category]) {
      categories[service.category] = [];
    }
    categories[service.category].push(service);
  });

  const categoryTitles: Record<string, string> = {
    'lawn-care': 'Lawn Care Services',
    'landscaping-softscape': 'Softscape & Planting',
    'landscaping-hardscape': 'Hardscape & Construction',
    'landscaping-water': 'Water Features',
    'landscaping-fire': 'Fire Features',
    'landscaping-structures': 'Outdoor Structures',
    'landscaping-lighting': 'Landscape Lighting',
    'landscaping-irrigation': 'Irrigation Services',
    'landscaping-rock': 'Rock & Stone Work',
    'landscaping-specialty': 'Specialty Services',
    'christmas-lights': 'Holiday Services',
    'commercial': 'Commercial Services',
  };

  let categoryContent = '';
  for (const [category, services] of Object.entries(categories)) {
    const title = categoryTitles[category] || category;
    const serviceLinks = services.map(s => 
      `<li><a href="/html/services/${s.slug}.html">${escapeHtml(s.name)}</a> - ${escapeHtml(s.shortDescription)}</li>`
    ).join('\n');
    
    categoryContent += `
      <h3>${escapeHtml(title)}</h3>
      <ul>
        ${serviceLinks}
      </ul>
    `;
  }

  const content = `
    <h1>Our Lawn Care & Landscaping Services</h1>
    
    <p>Lawn Care Kuna offers comprehensive outdoor services for residential and commercial properties throughout the Treasure Valley. From routine lawn maintenance to complete landscape transformations, our licensed professionals deliver quality results.</p>
    
    <h2>All Services</h2>
    ${categoryContent}
    
    <h2>Service Categories</h2>
    <ul>
      <li><a href="/html/services/lawn-care.html">Lawn Care</a> - Mowing, fertilization, aeration, weed control</li>
      <li><a href="/html/services/landscaping.html">Landscaping</a> - Design, installation, hardscaping</li>
      <li><a href="/html/services/christmas-lights.html">Christmas Lights</a> - Professional holiday lighting</li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'services.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generatePricingPage(): void {
  const meta: PageMeta = {
    title: 'Pricing | Lawn Care Kuna | Free Quotes',
    description: 'Transparent lawn care pricing in Treasure Valley Idaho. Get instant quotes for mowing, fertilization, aeration, and landscaping services. No hidden fees.',
    canonicalPath: '/pricing',
    schemaData: [localBusinessSchema()],
  };

  const content = `
    <h1>Lawn Care Pricing</h1>
    
    <p>At Lawn Care Kuna, we believe in transparent, honest pricing. Get a free quote customized to your property's specific needs.</p>
    
    <h2>How Our Pricing Works</h2>
    <p>Every property is unique, which is why we provide personalized quotes based on:</p>
    <ul>
      <li>Lawn size (square footage)</li>
      <li>Services requested</li>
      <li>Property complexity</li>
      <li>Service frequency</li>
    </ul>
    
    <h2>Typical Price Ranges</h2>
    <table>
      <tr><th>Service</th><th>Typical Range</th><th>Notes</th></tr>
      <tr><td><a href="/html/services/lawn-mowing.html">Lawn Mowing</a></td><td>$35-65/visit</td><td>Weekly or bi-weekly</td></tr>
      <tr><td><a href="/html/services/aeration.html">Core Aeration</a></td><td>$100-150</td><td>Per treatment</td></tr>
      <tr><td><a href="/html/services/fertilization.html">Fertilization</a></td><td>$40-80/application</td><td>4-5 applications/year</td></tr>
      <tr><td><a href="/html/services/weed-control.html">Weed Control</a></td><td>$50-100/treatment</td><td>Seasonal programs</td></tr>
      <tr><td><a href="/html/services/sprinkler-blowout.html">Sprinkler Blowout</a></td><td>$65-100</td><td>Annual winterization</td></tr>
      <tr><td><a href="/html/services/seasonal-cleanup.html">Seasonal Cleanup</a></td><td>$150-350</td><td>Spring or fall</td></tr>
    </table>
    <p><em>Prices are estimates for typical residential properties (5,000-8,000 sq ft). Actual pricing based on your specific property.</em></p>
    
    <h2>Get Your Free Quote</h2>
    <p>Use our online quote wizard for an instant estimate, or call us for a personalized consultation:</p>
    <p><a href="/html/get-quote.html" class="cta">Get a Free Quote</a></p>
    
    <h2>Why Choose Lawn Care Kuna?</h2>
    <ul>
      <li><strong>No Hidden Fees</strong> - The price we quote is the price you pay</li>
      <li><strong>Free Estimates</strong> - No obligation quotes for all services</li>
      <li><strong>Recurring Discounts</strong> - Save with weekly or seasonal packages</li>
      <li><strong>Satisfaction Guaranteed</strong> - We stand behind our work</li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'pricing.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generateGetQuotePage(): void {
  const meta: PageMeta = {
    title: 'Get a Free Quote | Lawn Care Kuna',
    description: 'Get a free lawn care quote in minutes. Instant estimates for mowing, aeration, fertilization, landscaping and more. Serving Kuna, Boise, Meridian & Treasure Valley.',
    canonicalPath: '/get-quote',
    schemaData: [localBusinessSchema()],
  };

  const content = `
    <h1>Get a Free Lawn Care Quote</h1>
    
    <p>Ready to transform your outdoor space? Get a free, no-obligation quote for any of our lawn care and landscaping services.</p>
    
    <h2>Request Your Quote</h2>
    <p>For the fastest and most accurate quote, visit our interactive quote wizard on the main site:</p>
    <p><a href="https://lawncarekuna.com/get-quote" class="cta">Go to Quote Wizard</a></p>
    
    <h2>What to Expect</h2>
    <ol>
      <li><strong>Enter Your Address</strong> - We'll use satellite imagery to measure your property</li>
      <li><strong>Select Services</strong> - Choose from lawn care, landscaping, irrigation, and more</li>
      <li><strong>Get Instant Estimate</strong> - See pricing immediately based on your property</li>
      <li><strong>Schedule Service</strong> - Book online or call to confirm</li>
    </ol>
    
    <h2>Our Most Popular Services</h2>
    <ul>
      <li><a href="/html/services/lawn-mowing.html">Lawn Mowing</a> - Weekly and bi-weekly service</li>
      <li><a href="/html/services/aeration.html">Core Aeration</a> - Essential for Idaho's clay soil</li>
      <li><a href="/html/services/fertilization.html">Fertilization</a> - Custom nutrient programs</li>
      <li><a href="/html/services/weed-control.html">Weed Control</a> - Eliminate dandelions and crabgrass</li>
      <li><a href="/html/services/sprinkler-blowout.html">Sprinkler Blowout</a> - Winterize your irrigation</li>
      <li><a href="/html/services/seasonal-cleanup.html">Seasonal Cleanup</a> - Spring and fall service</li>
    </ul>
    
    <h2>Prefer to Talk?</h2>
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'get-quote.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generatePrivacyPolicyPage(): void {
  const meta: PageMeta = {
    title: 'Privacy Policy | Lawn Care Kuna',
    description: 'Privacy policy for Lawn Care Kuna. Learn how we collect, use, and protect your personal information.',
    canonicalPath: '/privacy-policy',
    schemaData: [webPageSchema('Privacy Policy', 'Privacy policy for Lawn Care Kuna', `${BASE_URL}/privacy-policy`)],
  };

  const content = `
    <h1>Privacy Policy</h1>
    
    <p><em>Last updated: January 2026</em></p>
    
    <h2>Introduction</h2>
    <p>Lawn Care Kuna ("we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
    
    <h2>Information We Collect</h2>
    <h3>Personal Information</h3>
    <p>We may collect personal information that you voluntarily provide to us, including:</p>
    <ul>
      <li>Name and contact information (email, phone number, address)</li>
      <li>Property information for service quotes</li>
      <li>Payment information when purchasing services</li>
      <li>Communications you send to us</li>
    </ul>
    
    <h3>Automatically Collected Information</h3>
    <p>When you visit our website, we may automatically collect:</p>
    <ul>
      <li>IP address and browser type</li>
      <li>Pages visited and time spent</li>
      <li>Referring website</li>
      <li>Device information</li>
    </ul>
    
    <h2>How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
      <li>Provide and improve our services</li>
      <li>Process quotes and service requests</li>
      <li>Communicate with you about your service</li>
      <li>Send marketing communications (with your consent)</li>
      <li>Analyze website usage and improve user experience</li>
    </ul>
    
    <h2>Information Sharing</h2>
    <p>We do not sell your personal information. We may share information with:</p>
    <ul>
      <li>Service providers who assist our operations</li>
      <li>Law enforcement when required by law</li>
      <li>Business partners with your consent</li>
    </ul>
    
    <h2>Data Security</h2>
    <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
    
    <h2>Your Rights</h2>
    <p>You have the right to:</p>
    <ul>
      <li>Access your personal information</li>
      <li>Request correction of inaccurate data</li>
      <li>Request deletion of your data</li>
      <li>Opt out of marketing communications</li>
    </ul>
    
    <h2>Contact Us</h2>
    <p>If you have questions about this Privacy Policy, contact us:</p>
    <ul>
      <li>Email: <a href="mailto:hello@lawncarekuna.com">hello@lawncarekuna.com</a></li>
      <li>Phone: <a href="tel:+12083522011">(208) 352-2011</a></li>
    </ul>
  `;

  writeHtml(path.join(OUTPUT_DIR, 'privacy-policy.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generateTermsOfServicePage(): void {
  const meta: PageMeta = {
    title: 'Terms of Service | Lawn Care Kuna',
    description: 'Terms of service for Lawn Care Kuna. Read our terms and conditions for using our lawn care and landscaping services.',
    canonicalPath: '/terms-of-service',
    schemaData: [webPageSchema('Terms of Service', 'Terms of service for Lawn Care Kuna', `${BASE_URL}/terms-of-service`)],
  };

  const content = `
    <h1>Terms of Service</h1>
    
    <p><em>Last updated: January 2026</em></p>
    
    <h2>Agreement to Terms</h2>
    <p>By accessing or using Lawn Care Kuna's website and services, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.</p>
    
    <h2>Services</h2>
    <p>Lawn Care Kuna provides lawn care and landscaping services including but not limited to:</p>
    <ul>
      <li>Lawn mowing and maintenance</li>
      <li>Fertilization and weed control</li>
      <li>Aeration and overseeding</li>
      <li>Landscaping design and installation</li>
      <li>Irrigation services</li>
      <li>Seasonal cleanup and holiday lighting</li>
    </ul>
    
    <h2>Quotes and Pricing</h2>
    <p>Quotes provided through our website are estimates based on the information provided. Final pricing may vary based on actual property conditions. All prices are subject to change without notice.</p>
    
    <h2>Service Scheduling</h2>
    <p>Services are scheduled based on availability. Weather conditions may affect service timing. We will make reasonable efforts to notify you of any schedule changes.</p>
    
    <h2>Payment Terms</h2>
    <p>Payment is due upon completion of service unless other arrangements are made. We accept cash, check, credit card, Venmo, and PayPal.</p>
    
    <h2>Cancellation Policy</h2>
    <p>Please provide at least 24 hours notice for service cancellations. Repeated no-shows or last-minute cancellations may result in service termination.</p>
    
    <h2>Limitation of Liability</h2>
    <p>Lawn Care Kuna shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.</p>
    
    <h2>Intellectual Property</h2>
    <p>All content on this website, including text, graphics, logos, and images, is the property of Lawn Care Kuna and protected by copyright laws.</p>
    
    <h2>Changes to Terms</h2>
    <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.</p>
    
    <h2>Contact</h2>
    <p>Questions about these Terms of Service? Contact us:</p>
    <ul>
      <li>Email: <a href="mailto:hello@lawncarekuna.com">hello@lawncarekuna.com</a></li>
      <li>Phone: <a href="tel:+12083522011">(208) 352-2011</a></li>
    </ul>
  `;

  writeHtml(path.join(OUTPUT_DIR, 'terms-of-service.html'), htmlDocument(meta, content));
  stats.corePages++;
}

// ============================================
// SERVICE CATEGORY PAGES
// ============================================

function generateLawnCareCategoryPage(): void {
  const meta: PageMeta = {
    title: 'Lawn Care Services | Lawn Care Kuna | Treasure Valley',
    description: 'Professional lawn care services in Treasure Valley Idaho. Mowing, fertilization, aeration, weed control, overseeding and more. Licensed & insured.',
    canonicalPath: '/services/lawn-care',
    schemaData: [serviceSchema('Lawn Care Services', 'Professional lawn care services including mowing, fertilization, aeration, and weed control'), localBusinessSchema()],
  };

  const lawnCareServices = PRIORITY_SERVICES.filter(s => s.category === 'lawn-care');
  const serviceLinks = lawnCareServices.map(s =>
    `<li><a href="/html/services/${s.slug}.html">${escapeHtml(s.name)}</a> - ${escapeHtml(s.shortDescription)}</li>`
  ).join('\n');

  const content = `
    <h1>Professional Lawn Care Services in Treasure Valley</h1>
    
    <p>Lawn Care Kuna provides comprehensive lawn care services designed specifically for Idaho's unique climate and soil conditions. Our licensed professionals use commercial-grade equipment and proven techniques to keep your lawn healthy, green, and beautiful year-round.</p>
    
    <h2>Our Lawn Care Services</h2>
    <ul>
      ${serviceLinks}
    </ul>
    
    <h2>Why Idaho Lawns Need Professional Care</h2>
    <p>The Treasure Valley's semi-arid climate presents unique challenges for lawn health:</p>
    <ul>
      <li><strong>Clay Soil</strong> - Heavy clay soil compacts easily, restricting root growth and water penetration</li>
      <li><strong>Hot, Dry Summers</strong> - Temperatures regularly exceed 95°F with minimal rainfall</li>
      <li><strong>Cold Winters</strong> - Freeze-thaw cycles stress lawns and irrigation systems</li>
      <li><strong>Alkaline Water</strong> - Hard water affects nutrient availability</li>
    </ul>
    
    <h2>Service Areas</h2>
    <p>We provide lawn care services throughout the Treasure Valley:</p>
    <ul>
      <li><a href="/html/services/lawn-mowing/kuna.html">Lawn Care in Kuna</a></li>
      <li><a href="/html/services/lawn-mowing/boise.html">Lawn Care in Boise</a></li>
      <li><a href="/html/services/lawn-mowing/meridian.html">Lawn Care in Meridian</a></li>
      <li><a href="/html/services/lawn-mowing/eagle.html">Lawn Care in Eagle</a></li>
      <li><a href="/html/services/lawn-mowing/star.html">Lawn Care in Star</a></li>
      <li><a href="/html/services/lawn-mowing/middleton.html">Lawn Care in Middleton</a></li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  ensureDir(path.join(OUTPUT_DIR, 'services'));
  writeHtml(path.join(OUTPUT_DIR, 'services', 'lawn-care.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generateLandscapingCategoryPage(): void {
  const meta: PageMeta = {
    title: 'Landscaping Services | Lawn Care Kuna | Treasure Valley',
    description: 'Professional landscaping services in Treasure Valley Idaho. Design, installation, hardscaping, irrigation, and outdoor living spaces. Licensed & insured.',
    canonicalPath: '/services/landscaping',
    schemaData: [serviceSchema('Landscaping Services', 'Professional landscaping design and installation services'), localBusinessSchema()],
  };

  const landscapingServices = PRIORITY_SERVICES.filter(s => 
    s.category.startsWith('landscaping-') || s.category === 'landscaping'
  );
  const serviceLinks = landscapingServices.map(s =>
    `<li><a href="/html/services/${s.slug}.html">${escapeHtml(s.name)}</a> - ${escapeHtml(s.shortDescription)}</li>`
  ).join('\n');

  const content = `
    <h1>Professional Landscaping Services in Treasure Valley</h1>
    
    <p>Transform your outdoor space with Lawn Care Kuna's comprehensive landscaping services. From design concept to final installation, our experienced team creates beautiful, functional landscapes that enhance your property's value and your quality of life.</p>
    
    <h2>Our Landscaping Services</h2>
    <ul>
      ${serviceLinks}
    </ul>
    
    <h2>Why Choose Professional Landscaping</h2>
    <ul>
      <li><strong>Expert Design</strong> - Landscapes designed for Idaho's climate and your lifestyle</li>
      <li><strong>Quality Materials</strong> - We source the best plants and materials for our region</li>
      <li><strong>Professional Installation</strong> - Proper installation ensures longevity</li>
      <li><strong>Increased Property Value</strong> - Quality landscaping adds significant value</li>
    </ul>
    
    <h2>Service Areas</h2>
    <p>We provide landscaping services throughout the Treasure Valley:</p>
    <ul>
      <li><a href="/html/areas/kuna.html">Landscaping in Kuna</a></li>
      <li><a href="/html/areas/boise.html">Landscaping in Boise</a></li>
      <li><a href="/html/areas/meridian.html">Landscaping in Meridian</a></li>
      <li><a href="/html/areas/eagle.html">Landscaping in Eagle</a></li>
      <li><a href="/html/areas/star.html">Landscaping in Star</a></li>
      <li><a href="/html/areas/middleton.html">Landscaping in Middleton</a></li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'services', 'landscaping.html'), htmlDocument(meta, content));
  stats.corePages++;
}

function generateChristmasLightsCategoryPage(): void {
  const meta: PageMeta = {
    title: 'Christmas Light Installation | Lawn Care Kuna | Treasure Valley',
    description: 'Professional Christmas light installation in Treasure Valley Idaho. Custom designs, commercial-grade lights, full-service installation and removal. Free quotes.',
    canonicalPath: '/services/christmas-lights',
    schemaData: [serviceSchema('Christmas Light Installation', 'Professional holiday lighting installation and removal services'), localBusinessSchema()],
  };

  const content = `
    <h1>Professional Christmas Light Installation in Treasure Valley</h1>
    
    <p>Make your home or business shine this holiday season with Lawn Care Kuna's professional Christmas light installation services. We handle everything from design to installation to removal, so you can enjoy a beautifully lit property without the hassle.</p>
    
    <h2>Our Christmas Light Services</h2>
    <ul>
      <li><strong>Custom Design</strong> - We create a lighting plan tailored to your property</li>
      <li><strong>Professional Installation</strong> - Safe, secure installation by trained crews</li>
      <li><strong>Commercial-Grade Lights</strong> - Durable LED lights that last season after season</li>
      <li><strong>Maintenance</strong> - We replace any bulbs that go out during the season</li>
      <li><strong>Removal & Storage</strong> - We take down and store your lights after the holidays</li>
    </ul>
    
    <h2>Why Choose Professional Installation</h2>
    <ul>
      <li><strong>Safety</strong> - No climbing ladders or working on roofs</li>
      <li><strong>Time Savings</strong> - Focus on enjoying the holidays</li>
      <li><strong>Professional Results</strong> - Even, beautiful lighting display</li>
      <li><strong>Energy Efficient</strong> - LED lights use less power</li>
    </ul>
    
    <h2>Service Areas</h2>
    <p>We install Christmas lights throughout the Treasure Valley:</p>
    <ul>
      <li><a href="/html/services/christmas-light-installation/kuna.html">Christmas Lights in Kuna</a></li>
      <li><a href="/html/services/christmas-light-installation/boise.html">Christmas Lights in Boise</a></li>
      <li><a href="/html/services/christmas-light-installation/meridian.html">Christmas Lights in Meridian</a></li>
      <li><a href="/html/services/christmas-light-installation/eagle.html">Christmas Lights in Eagle</a></li>
      <li><a href="/html/services/christmas-light-installation/star.html">Christmas Lights in Star</a></li>
      <li><a href="/html/services/christmas-light-installation/middleton.html">Christmas Lights in Middleton</a></li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'services', 'christmas-lights.html'), htmlDocument(meta, content));
  stats.corePages++;
}

// ============================================
// INDIVIDUAL SERVICE PAGES
// ============================================

function generateServicePage(service: ServiceData): void {
  const meta: PageMeta = {
    title: `${service.name} | Lawn Care Kuna | Free Quotes`,
    description: service.shortDescription,
    canonicalPath: `/services/${service.slug}`,
    schemaData: [
      serviceSchema(service.name, service.longDescription),
      breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
        { name: service.name, url: `/services/${service.slug}` },
      ]),
      ...(service.faqs && service.faqs.length > 0 ? [faqSchema(service.faqs)] : []),
    ],
  };

  const benefitsList = service.benefits?.length > 0 
    ? `<h2>Benefits</h2>\n${listHtml(service.benefits)}`
    : '';

  const processSteps = service.process?.length > 0
    ? `<h2>Our Process</h2>\n${processStepsHtml(service.process)}`
    : '';

  const faqSection = service.faqs?.length > 0
    ? faqSectionHtml(service.faqs)
    : '';

  const relatedServices = service.relatedServices?.length > 0
    ? `<h2>Related Services</h2>\n<ul>${service.relatedServices.map(slug => {
        const related = PRIORITY_SERVICES.find(s => s.slug === slug);
        return related ? `<li><a href="/html/services/${slug}.html">${escapeHtml(related.name)}</a></li>` : '';
      }).join('\n')}</ul>`
    : '';

  // City links for geo pages
  const cityLinks = CITIES.map(city =>
    `<li><a href="/html/services/${service.slug}/${city.slug}.html">${escapeHtml(service.name)} in ${escapeHtml(city.name)}</a></li>`
  ).join('\n');

  const content = `
    <h1>${escapeHtml(service.name)} Services in Treasure Valley</h1>
    
    <p>${escapeHtml(service.shortDescription)}</p>
    
    <h2>About Our ${escapeHtml(service.name)} Service</h2>
    <p>${convertToHtmlLinks(service.longDescription)}</p>
    
    ${benefitsList}
    
    ${processSteps}
    
    ${service.pricingGuidance ? `<h2>Pricing</h2>\n<p>${escapeHtml(service.pricingGuidance)}</p>` : ''}
    
    ${service.seasonality ? `<h2>Seasonality</h2>\n<p>${escapeHtml(service.seasonality)}</p>` : ''}
    
    ${faqSection}
    
    <h2>Service Areas</h2>
    <p>We provide ${service.name.toLowerCase()} services throughout the Treasure Valley:</p>
    <ul>
      ${cityLinks}
    </ul>
    
    ${relatedServices}
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'services', `${service.slug}.html`), htmlDocument(meta, content));
  stats.servicePages++;
}

// ============================================
// GEO-TARGETED SERVICE PAGES
// ============================================

function generateGeoServicePage(service: ServiceData, city: CityData): void {
  const meta: PageMeta = {
    title: `${service.name} in ${city.name}, ID | Lawn Care Kuna`,
    description: `Expert ${service.name.toLowerCase()} in ${city.name}, Idaho. Licensed pros, satisfaction guaranteed. Call (208) 352-2011 for a free quote. Serving ${city.name} & Treasure Valley!`,
    canonicalPath: `/services/${service.slug}/${city.slug}`,
    schemaData: [
      serviceSchema(service.name, service.longDescription, city.name),
      localBusinessSchema(city.name),
      breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
        { name: service.name, url: `/services/${service.slug}` },
        { name: city.name, url: `/services/${service.slug}/${city.slug}` },
      ]),
      ...(service.faqs && service.faqs.length > 0 ? [faqSchema(service.faqs)] : []),
    ],
  };

  const benefitsList = service.benefits?.length > 0 
    ? `<h2>Benefits of Professional ${escapeHtml(service.name)} in ${escapeHtml(city.name)}</h2>\n${listHtml(service.benefits)}`
    : '';

  const processSteps = service.process?.length > 0
    ? `<h2>Our ${escapeHtml(service.name)} Process</h2>\n${processStepsHtml(service.process)}`
    : '';

  const faqSection = service.faqs?.length > 0
    ? faqSectionHtml(service.faqs)
    : '';

  // Other cities for this service
  const otherCities = CITIES.filter(c => c.slug !== city.slug).map(c =>
    `<li><a href="/html/services/${service.slug}/${c.slug}.html">${escapeHtml(service.name)} in ${escapeHtml(c.name)}</a></li>`
  ).join('\n');

  const cityDescription = city.extendedDescription 
    ? `<h2>About ${escapeHtml(city.name)}, Idaho</h2>\n<p>${escapeHtml(city.extendedDescription)}</p>`
    : '';

  const localFactors = city.localFactors
    ? `<h2>Local Considerations in ${escapeHtml(city.name)}</h2>
       <ul>
         <li><strong>Climate:</strong> ${escapeHtml(city.localFactors.climate)}</li>
         <li><strong>Soil:</strong> ${escapeHtml(city.localFactors.soil)}</li>
         <li><strong>Common Needs:</strong> ${city.localFactors.commonNeeds.map(n => escapeHtml(n)).join(', ')}</li>
       </ul>`
    : '';

  const content = `
    <h1>${escapeHtml(service.name)} in ${escapeHtml(city.name)}, Idaho</h1>
    
    <p>Looking for professional ${service.name.toLowerCase()} in ${city.name}? Lawn Care Kuna provides expert ${service.name.toLowerCase()} services throughout ${city.name} and the surrounding Treasure Valley area.</p>
    
    <h2>About Our ${escapeHtml(service.name)} Service</h2>
    <p>${convertToHtmlLinks(service.longDescription)}</p>
    
    ${cityDescription}
    
    ${localFactors}
    
    ${benefitsList}
    
    ${processSteps}
    
    ${service.pricingGuidance ? `<h2>Pricing in ${escapeHtml(city.name)}</h2>\n<p>${escapeHtml(service.pricingGuidance)}</p>` : ''}
    
    ${faqSection}
    
    <h2>${escapeHtml(service.name)} in Other Areas</h2>
    <ul>
      ${otherCities}
    </ul>
    
    <h2>Other Services in ${escapeHtml(city.name)}</h2>
    <p>View all <a href="/html/areas/${city.slug}.html">lawn care services in ${escapeHtml(city.name)}</a>.</p>
    
    ${contactInfoHtml()}
  `;

  const serviceDir = path.join(OUTPUT_DIR, 'services', service.slug);
  ensureDir(serviceDir);
  writeHtml(path.join(serviceDir, `${city.slug}.html`), htmlDocument(meta, content));
  stats.geoPages++;
}

// ============================================
// AREA/CITY PAGES
// ============================================

function generateAreaPage(city: CityData): void {
  const meta: PageMeta = {
    title: `Lawn Care in ${city.name}, ID | Lawn Care Kuna | Free Quotes`,
    description: `Professional lawn care & landscaping in ${city.name}, Idaho. Licensed, insured, locally owned. Call (208) 352-2011 for your free quote. Serving all of ${city.name}!`,
    canonicalPath: `/areas/${city.slug}`,
    schemaData: [
      localBusinessSchema(city.name),
      webPageSchema(`Lawn Care in ${city.name}`, `Professional lawn care services in ${city.name}, Idaho`, `${BASE_URL}/areas/${city.slug}`),
      breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Service Areas', url: '/' },
        { name: city.name, url: `/areas/${city.slug}` },
      ]),
    ],
  };

  // All services available in this city
  const serviceLinks = PRIORITY_SERVICES.map(s =>
    `<li><a href="/html/services/${s.slug}/${city.slug}.html">${escapeHtml(s.name)}</a> - ${escapeHtml(s.shortDescription)}</li>`
  ).join('\n');

  // Other cities
  const otherCities = CITIES.filter(c => c.slug !== city.slug).map(c =>
    `<li><a href="/html/areas/${c.slug}.html">Lawn Care in ${escapeHtml(c.name)}</a></li>`
  ).join('\n');

  const cityDescription = city.extendedDescription 
    ? `<p>${escapeHtml(city.extendedDescription)}</p>`
    : '';

  const neighborhoods = city.neighborhoods?.length > 0
    ? `<h2>Neighborhoods We Serve in ${escapeHtml(city.name)}</h2>\n<p>${city.neighborhoods.join(', ')}</p>`
    : '';

  const landmarks = city.landmarks?.length > 0
    ? `<h2>Local Landmarks</h2>\n<p>We serve properties near ${city.landmarks.join(', ')} and throughout ${city.name}.</p>`
    : '';

  const localFactors = city.localFactors
    ? `<h2>Lawn Care Considerations in ${escapeHtml(city.name)}</h2>
       <ul>
         <li><strong>Climate:</strong> ${escapeHtml(city.localFactors.climate)}</li>
         <li><strong>Soil:</strong> ${escapeHtml(city.localFactors.soil)}</li>
         <li><strong>Common Needs:</strong> ${city.localFactors.commonNeeds.map(n => escapeHtml(n)).join(', ')}</li>
       </ul>
       ${city.serviceConsiderations ? `<p>${escapeHtml(city.serviceConsiderations)}</p>` : ''}`
    : '';

  const content = `
    <h1>Professional Lawn Care in ${escapeHtml(city.name)}, Idaho</h1>
    
    <p>Lawn Care Kuna proudly serves homeowners and businesses throughout ${city.name} with comprehensive lawn care and landscaping services. As a locally owned company, we understand the unique challenges of maintaining beautiful outdoor spaces in ${city.name}'s climate.</p>
    
    ${cityDescription}
    
    ${localFactors}
    
    <h2>Services Available in ${escapeHtml(city.name)}</h2>
    <ul>
      ${serviceLinks}
    </ul>
    
    ${neighborhoods}
    
    ${landmarks}
    
    <h2>Other Service Areas</h2>
    <p>We also serve:</p>
    <ul>
      ${otherCities}
    </ul>
    
    ${contactInfoHtml()}
  `;

  const areasDir = path.join(OUTPUT_DIR, 'areas');
  ensureDir(areasDir);
  writeHtml(path.join(areasDir, `${city.slug}.html`), htmlDocument(meta, content));
  stats.areaPages++;
}

// ============================================
// BLOG PAGES
// ============================================

function generateBlogIndexPage(): void {
  const meta: PageMeta = {
    title: 'Lawn Care Blog | Expert Tips for Idaho Lawns | Lawn Care Kuna',
    description: 'Expert lawn care tips, seasonal guides, and landscaping advice for Idaho homeowners. Learn about lawn maintenance, irrigation, fertilization, and more.',
    canonicalPath: '/blog',
    schemaData: [webPageSchema('Lawn Care Blog', 'Expert lawn care tips for Idaho homeowners', `${BASE_URL}/blog`)],
  };

  // Group posts by category
  const postsByCategory: Record<string, BlogPostData[]> = {};
  BLOG_POSTS.forEach(post => {
    if (!postsByCategory[post.category]) {
      postsByCategory[post.category] = [];
    }
    postsByCategory[post.category].push(post);
  });

  let categoryContent = '';
  for (const [category, posts] of Object.entries(postsByCategory)) {
    const postLinks = posts.map(p =>
      `<li><a href="/html/blog/${p.slug}.html">${escapeHtml(p.title)}</a> - ${escapeHtml(p.excerpt.substring(0, 100))}...</li>`
    ).join('\n');
    
    categoryContent += `
      <h3>${escapeHtml(category)}</h3>
      <ul>
        ${postLinks}
      </ul>
    `;
  }

  const content = `
    <h1>Lawn Care Blog</h1>
    
    <p>Expert tips and seasonal guides for beautiful Idaho lawns. Browse our collection of ${BLOG_POSTS.length} articles covering lawn maintenance, landscaping, irrigation, and more.</p>
    
    <h2>Articles by Category</h2>
    ${categoryContent}
    
    ${contactInfoHtml()}
  `;

  const blogDir = path.join(OUTPUT_DIR, 'blog');
  ensureDir(blogDir);
  writeHtml(path.join(blogDir, 'index.html'), htmlDocument(meta, content));
  stats.blogPages++;
}

function generateBlogPostPage(post: BlogPostData): void {
  const canonicalUrl = `${BASE_URL}/blog/${post.slug}`;
  const meta: PageMeta = {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    canonicalPath: `/blog/${post.slug}`,
    schemaData: [
      articleSchema(post.title, post.metaDescription || post.excerpt, post.author, post.publishedAt, canonicalUrl),
      breadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: post.title, url: `/blog/${post.slug}` },
      ]),
      ...(post.faqs && post.faqs.length > 0 ? [faqSchema(post.faqs)] : []),
    ],
  };

  const publishDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tags = post.tags?.length > 0
    ? `<p><strong>Tags:</strong> ${post.tags.map(t => escapeHtml(t)).join(', ')}</p>`
    : '';

  const faqSection = post.faqs?.length > 0
    ? faqSectionHtml(post.faqs)
    : '';

  // Convert internal links in content to HTML mirror links
  const processedContent = convertToHtmlLinks(post.content);

  const content = `
    <article>
      <h1>${escapeHtml(post.title)}</h1>
      
      <p><em>Published: ${publishDate} | By: ${escapeHtml(post.author)} | Category: ${escapeHtml(post.category)}</em></p>
      
      ${tags}
      
      <hr>
      
      ${processedContent}
      
      ${faqSection}
    </article>
    
    <h2>More Articles</h2>
    <p><a href="/html/blog/index.html">Browse all ${BLOG_POSTS.length} articles</a></p>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(OUTPUT_DIR, 'blog', `${post.slug}.html`), htmlDocument(meta, content));
  stats.blogPages++;
}

// ============================================
// COMMERCIAL PAGES
// ============================================

function generateCommercialPages(): void {
  const commercialDir = path.join(OUTPUT_DIR, 'commercial');
  ensureDir(commercialDir);

  // Commercial index page
  const commercialMeta: PageMeta = {
    title: 'Commercial Lawn Care | Lawn Care Kuna | Business Services',
    description: 'Commercial lawn care and landscaping services for businesses in Treasure Valley Idaho. HOA, municipal, and property management services.',
    canonicalPath: '/commercial',
    schemaData: [localBusinessSchema()],
  };

  const commercialContent = `
    <h1>Commercial Lawn Care Services</h1>
    
    <p>Lawn Care Kuna provides professional commercial lawn care and landscaping services for businesses, property managers, HOAs, and municipalities throughout the Treasure Valley.</p>
    
    <h2>Commercial Services</h2>
    <ul>
      <li><a href="/html/commercial/hoa-services.html">HOA Services</a> - Community and homeowner association maintenance</li>
      <li><a href="/html/commercial/municipal-services.html">Municipal Services</a> - Government and public space maintenance</li>
    </ul>
    
    <h2>Why Choose Lawn Care Kuna for Commercial Properties</h2>
    <ul>
      <li><strong>Reliable Service</strong> - Consistent, professional care on schedule</li>
      <li><strong>Licensed & Insured</strong> - Full coverage for commercial properties</li>
      <li><strong>Flexible Scheduling</strong> - Early morning or weekend service available</li>
      <li><strong>Volume Pricing</strong> - Competitive rates for large properties</li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(commercialDir, 'index.html'), htmlDocument(commercialMeta, commercialContent));
  stats.commercialPages++;

  // HOA Services page
  const hoaMeta: PageMeta = {
    title: 'HOA Lawn Care Services | Lawn Care Kuna',
    description: 'Professional HOA lawn care and landscaping services in Treasure Valley Idaho. Community maintenance, common area care, and HOA-compliant services.',
    canonicalPath: '/commercial/hoa-services',
    schemaData: [serviceSchema('HOA Lawn Care Services', 'Professional lawn care and landscaping for homeowner associations'), localBusinessSchema()],
  };

  const hoaContent = `
    <h1>HOA Lawn Care Services in Treasure Valley</h1>
    
    <p>Lawn Care Kuna provides comprehensive lawn care and landscaping services for homeowner associations throughout the Treasure Valley. We understand the unique needs of community maintenance and work with HOA boards to maintain beautiful, well-maintained common areas.</p>
    
    <h2>Our HOA Services</h2>
    <ul>
      <li>Common area lawn maintenance</li>
      <li>Entrance and amenity landscaping</li>
      <li>Irrigation system management</li>
      <li>Seasonal cleanup and maintenance</li>
      <li>Tree and shrub care</li>
      <li>Holiday lighting for common areas</li>
    </ul>
    
    <h2>Why HOAs Choose Lawn Care Kuna</h2>
    <ul>
      <li><strong>Consistent Quality</strong> - Professional results every visit</li>
      <li><strong>Reliable Scheduling</strong> - Service you can count on</li>
      <li><strong>Communication</strong> - Regular updates to board members</li>
      <li><strong>Competitive Pricing</strong> - Volume discounts for communities</li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(commercialDir, 'hoa-services.html'), htmlDocument(hoaMeta, hoaContent));
  stats.commercialPages++;

  // Municipal Services page
  const municipalMeta: PageMeta = {
    title: 'Municipal Lawn Care Services | Lawn Care Kuna',
    description: 'Professional municipal lawn care and landscaping services in Treasure Valley Idaho. Parks, public spaces, government facilities.',
    canonicalPath: '/commercial/municipal-services',
    schemaData: [serviceSchema('Municipal Lawn Care Services', 'Professional lawn care for government and public spaces'), localBusinessSchema()],
  };

  const municipalContent = `
    <h1>Municipal Lawn Care Services in Treasure Valley</h1>
    
    <p>Lawn Care Kuna provides professional lawn care and landscaping services for municipal properties, parks, and public spaces throughout the Treasure Valley. We work with local governments to maintain beautiful, safe, and well-maintained public areas.</p>
    
    <h2>Our Municipal Services</h2>
    <ul>
      <li>Park and recreation area maintenance</li>
      <li>Government facility landscaping</li>
      <li>Public space maintenance</li>
      <li>Right-of-way and median maintenance</li>
      <li>Emergency storm cleanup</li>
      <li>Seasonal maintenance programs</li>
    </ul>
    
    <h2>Why Municipalities Choose Lawn Care Kuna</h2>
    <ul>
      <li><strong>Licensed & Insured</strong> - Full compliance with government requirements</li>
      <li><strong>Reliable Service</strong> - Consistent, professional maintenance</li>
      <li><strong>Safety Focused</strong> - Trained crews with proper equipment</li>
      <li><strong>Transparent Pricing</strong> - Clear, competitive quotes</li>
    </ul>
    
    ${contactInfoHtml()}
  `;

  writeHtml(path.join(commercialDir, 'municipal-services.html'), htmlDocument(municipalMeta, municipalContent));
  stats.commercialPages++;
}

// ============================================
// MAIN GENERATION FUNCTION
// ============================================

async function main(): Promise<void> {
  console.log('🌿 Starting HTML Mirror Generation...\n');
  
  // Clean and prepare output directory
  console.log('📁 Cleaning output directory...');
  cleanOutputDir();
  
  // Generate core pages
  console.log('📄 Generating core pages...');
  generateHomePage();
  generateAboutPage();
  generateContactPage();
  generateServicesIndexPage();
  generatePricingPage();
  generateGetQuotePage();
  generatePrivacyPolicyPage();
  generateTermsOfServicePage();
  
  // Generate service category pages
  console.log('📂 Generating service category pages...');
  generateLawnCareCategoryPage();
  generateLandscapingCategoryPage();
  generateChristmasLightsCategoryPage();
  
  // Generate individual service pages
  console.log(`🛠️  Generating ${PRIORITY_SERVICES.length} service pages...`);
  for (const service of PRIORITY_SERVICES) {
    generateServicePage(service);
  }
  
  // Generate geo-targeted pages
  console.log(`🗺️  Generating ${PRIORITY_SERVICES.length * CITIES.length} geo-targeted pages...`);
  for (const service of PRIORITY_SERVICES) {
    for (const city of CITIES) {
      generateGeoServicePage(service, city);
    }
  }
  
  // Generate area pages
  console.log(`📍 Generating ${CITIES.length} area pages...`);
  for (const city of CITIES) {
    generateAreaPage(city);
  }
  
  // Generate blog pages
  console.log(`📝 Generating blog index and ${BLOG_POSTS.length} blog posts...`);
  generateBlogIndexPage();
  for (const post of BLOG_POSTS) {
    generateBlogPostPage(post);
  }
  
  // Generate commercial pages
  console.log('🏢 Generating commercial pages...');
  generateCommercialPages();
  
  // Print summary
  console.log('\n✅ HTML Mirror Generation Complete!\n');
  console.log('📊 Summary:');
  console.log(`   Core pages:       ${stats.corePages}`);
  console.log(`   Service pages:    ${stats.servicePages}`);
  console.log(`   Geo pages:        ${stats.geoPages}`);
  console.log(`   Area pages:       ${stats.areaPages}`);
  console.log(`   Blog pages:       ${stats.blogPages}`);
  console.log(`   Commercial pages: ${stats.commercialPages}`);
  console.log(`   ─────────────────────────`);
  console.log(`   Total files:      ${stats.total}`);
  console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
}

main().catch(console.error);
