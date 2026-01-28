/**
 * HTML Template Functions for Static SEO Mirror
 * Generates semantic HTML with proper SEO elements for crawler/LLM indexing
 */

const BASE_URL = 'https://lawncarekuna.com';
const BUSINESS_NAME = 'Lawn Care Kuna';
const BUSINESS_PHONE = '(208) 352-2011';
const BUSINESS_EMAIL = 'hello@lawncarekuna.com';
const BUSINESS_ADDRESS = {
  street: '2283 N Coopers Hawk Ave',
  city: 'Kuna',
  state: 'Idaho',
  zip: '83634',
};

export interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string; // e.g., '/services/aeration' - WITHOUT /html/
  schemaData?: object[];
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Breadcrumb {
  name: string;
  url: string; // App URL (canonical)
  htmlUrl: string; // HTML mirror URL
}

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert internal app links to HTML mirror links within content
 * Transforms /services/aeration -> /html/services/aeration.html
 */
export function convertToHtmlLinks(content: string): string {
  // Match href="/..." links that aren't external or already /html/
  return content.replace(
    /href="\/(?!html\/|api\/|admin\/|subcontractor\/|quote-status\/)([^"]+)"/g,
    (match, path) => {
      // Clean trailing slashes and add .html
      const cleanPath = path.replace(/\/$/, '');
      if (cleanPath === '') {
        return 'href="/html/index.html"';
      }
      return `href="/html/${cleanPath}.html"`;
    }
  );
}

/**
 * Generate base HTML document wrapper
 */
export function htmlDocument(meta: PageMeta, content: string): string {
  const canonicalUrl = `${BASE_URL}${meta.canonicalPath}`;
  const schemas = meta.schemaData || [];
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeHtml(meta.description)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">
  
  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(meta.title)}">
  <meta property="og:description" content="${escapeHtml(meta.description)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${BUSINESS_NAME}">
  <meta property="og:locale" content="en_US">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(meta.title)}">
  <meta name="twitter:description" content="${escapeHtml(meta.description)}">
  
  <!-- Structured Data -->
${schemas.map(s => `  <script type="application/ld+json">${JSON.stringify(s, null, 2)}</script>`).join('\n')}
  
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { color: #166534; margin-bottom: 0.5em; }
    h2 { color: #15803d; margin-top: 1.5em; border-bottom: 2px solid #dcfce7; padding-bottom: 0.3em; }
    h3 { color: #22c55e; }
    a { color: #16a34a; }
    ul, ol { padding-left: 1.5em; }
    .breadcrumbs { font-size: 0.9em; color: #666; margin-bottom: 1em; }
    .breadcrumbs a { color: #16a34a; text-decoration: none; }
    .breadcrumbs a:hover { text-decoration: underline; }
    .contact-info { background: #f0fdf4; padding: 1em; border-radius: 8px; margin: 1em 0; }
    .faq-section { margin-top: 2em; }
    .faq-item { margin-bottom: 1.5em; }
    .faq-question { font-weight: bold; color: #166534; }
    .cta { background: #166534; color: white; padding: 1em 2em; display: inline-block; text-decoration: none; border-radius: 6px; margin: 1em 0; }
    .cta:hover { background: #15803d; }
    footer { margin-top: 3em; padding-top: 1em; border-top: 1px solid #ddd; font-size: 0.9em; color: #666; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 0.75em; text-align: left; }
    th { background: #f0fdf4; }
  </style>
</head>
<body>
  <nav class="breadcrumbs" aria-label="Breadcrumb"></nav>
  
  <main>
${content}
  </main>
  
  <footer>
    <p><strong>${BUSINESS_NAME}</strong></p>
    <p>Phone: <a href="tel:+12083522011">${BUSINESS_PHONE}</a> | Email: <a href="mailto:${BUSINESS_EMAIL}">${BUSINESS_EMAIL}</a></p>
    <p>${BUSINESS_ADDRESS.street}, ${BUSINESS_ADDRESS.city}, ${BUSINESS_ADDRESS.state} ${BUSINESS_ADDRESS.zip}</p>
    <p><a href="/html/privacy-policy.html">Privacy Policy</a> | <a href="/html/terms-of-service.html">Terms of Service</a></p>
    <p>&copy; ${new Date().getFullYear()} ${BUSINESS_NAME}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

/**
 * Generate breadcrumb navigation HTML
 */
export function breadcrumbsHtml(breadcrumbs: Breadcrumb[]): string {
  const items = breadcrumbs.map((crumb, i) => {
    const isLast = i === breadcrumbs.length - 1;
    if (isLast) {
      return `<span>${escapeHtml(crumb.name)}</span>`;
    }
    return `<a href="${crumb.htmlUrl}">${escapeHtml(crumb.name)}</a>`;
  });
  return items.join(' &gt; ');
}

/**
 * Generate FAQ section HTML
 */
export function faqSectionHtml(faqs: FAQ[]): string {
  if (!faqs || faqs.length === 0) return '';
  
  const faqItems = faqs.map(faq => `
    <div class="faq-item">
      <p class="faq-question">${escapeHtml(faq.question)}</p>
      <p>${escapeHtml(faq.answer)}</p>
    </div>
  `).join('\n');
  
  return `
    <section class="faq-section">
      <h2>Frequently Asked Questions</h2>
      ${faqItems}
    </section>
  `;
}

/**
 * Generate contact info section HTML
 */
export function contactInfoHtml(): string {
  return `
    <div class="contact-info">
      <h3>Contact Us</h3>
      <p><strong>Phone:</strong> <a href="tel:+12083522011">${BUSINESS_PHONE}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${BUSINESS_EMAIL}">${BUSINESS_EMAIL}</a></p>
      <p><strong>Address:</strong> ${BUSINESS_ADDRESS.street}, ${BUSINESS_ADDRESS.city}, ${BUSINESS_ADDRESS.state} ${BUSINESS_ADDRESS.zip}</p>
      <p><strong>Service Areas:</strong> Kuna, Boise, Meridian, Eagle, Star, Middleton</p>
      <p><a href="/html/get-quote.html" class="cta">Get a Free Quote</a></p>
    </div>
  `;
}

/**
 * Generate list HTML from array of strings
 */
export function listHtml(items: string[], ordered = false): string {
  const tag = ordered ? 'ol' : 'ul';
  const listItems = items.map(item => `<li>${escapeHtml(item)}</li>`).join('\n');
  return `<${tag}>\n${listItems}\n</${tag}>`;
}

/**
 * Generate process/steps HTML
 */
export function processStepsHtml(steps: Array<{ step: number; title: string; description: string }>): string {
  const stepItems = steps.map(s => 
    `<li><strong>${escapeHtml(s.title)}:</strong> ${escapeHtml(s.description)}</li>`
  ).join('\n');
  
  return `
    <h3>Our Process</h3>
    <ol>
      ${stepItems}
    </ol>
  `;
}

/**
 * Generate Schema.org LocalBusiness
 */
export function localBusinessSchema(city?: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: BUSINESS_NAME,
    description: `Professional lawn care and landscaping services in ${city || 'Kuna'} and the Treasure Valley, Idaho.`,
    image: `${BASE_URL}/favicon.png`,
    '@id': BASE_URL,
    url: BASE_URL,
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.city,
      addressRegion: BUSINESS_ADDRESS.state,
      postalCode: BUSINESS_ADDRESS.zip,
      addressCountry: 'US',
    },
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.9,
      reviewCount: 247,
    },
  };
}

/**
 * Generate Schema.org WebSite
 */
export function webSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_NAME,
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/services/{search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Schema.org Service
 */
export function serviceSchema(serviceName: string, description: string, city?: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    description: description,
    provider: {
      '@type': 'LocalBusiness',
      name: BUSINESS_NAME,
      telephone: BUSINESS_PHONE,
    },
    areaServed: city ? {
      '@type': 'City',
      name: city,
      addressRegion: 'ID',
      addressCountry: 'US',
    } : ['Kuna', 'Boise', 'Meridian', 'Eagle', 'Star', 'Middleton'].map(c => ({
      '@type': 'City',
      name: c,
    })),
    serviceType: serviceName,
  };
}

/**
 * Generate Schema.org Article for blog posts
 */
export function articleSchema(
  title: string,
  description: string,
  author: string,
  publishedAt: string,
  canonicalUrl: string
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: author,
    },
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/favicon.png`,
      },
    },
    datePublished: publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };
}

/**
 * Generate Schema.org BreadcrumbList
 */
export function breadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.url}`,
    })),
  };
}

/**
 * Generate Schema.org FAQPage
 */
export function faqSchema(faqs: FAQ[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Schema.org WebPage
 */
export function webPageSchema(name: string, description: string, canonicalUrl: string): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: name,
    description: description,
    mainEntityOfPage: canonicalUrl,
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_NAME,
    },
  };
}
