import { ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { IMAGE_VARIANTS } from '@/shared/generated/imageVariants';

/**
 * Room and city heroes ship a full original plus width derivatives.
 * The default room src is the 1080 file so the LCP request is not the original.
 * Marketing heroes use the 768 and 1280 files listed in IMAGE_VARIANTS.
 */
/** Ada's full-size files are soft. Normal widths must use the sharp variants. */
const SHARP_VARIANT_SRCS = new Set([
  '/images/marketing/cabinet-door-samples.webp',
  '/images/marketing/kitchen-wood-island.webp',
]);

export function heroImageAttrs(src: string) {
  const match = /^(.*)\.webp$/.exec(src);
  if (match && SHARP_VARIANT_SRCS.has(src)) {
    const root = match[1];
    return {
      src: `${root}-1280.webp`,
      srcSet: `${root}-768.webp 768w, ${root}-1280.webp 1280w`,
      sizes: '(max-width: 768px) 100vw, 50vw',
    };
  }
  if (!match || /-\d+\.webp$/.test(src)) return { src };
  const root = match[1];
  const responsive = src.startsWith('/images/catalog/rooms/') || src.startsWith('/images/areas/');
  if (responsive) {
    const widths = IMAGE_VARIANTS[src];
    if (widths?.length) {
      const srcSet = [...widths.map((w) => `${root}-${w}.webp ${w}w`), `${src} 1600w`].join(', ');
      const preferred = widths.includes(1080) ? `${root}-1080.webp` : src;
      return { src: preferred, srcSet, sizes: '(max-width: 700px) 100vw, 50vw' };
    }
    return {
      src: `${root}-1080.webp`,
      srcSet: `${root}-640.webp 640w, ${root}-1080.webp 1080w, ${src} 1600w`,
      sizes: '(max-width: 700px) 100vw, 50vw',
    };
  }
  if (src.startsWith('/images/marketing/')) {
    const widths = IMAGE_VARIANTS[src];
    if (!widths?.length) return { src };
    return {
      src: widths.includes(1280) ? `${root}-1280.webp` : src,
      srcSet: [...widths.map((w) => `${root}-${w}.webp ${w}w`), `${src} 1536w`].join(', '),
      sizes: '(max-width: 768px) 100vw, 50vw',
    };
  }
  return { src };
}

/** Public-page layout. Application routes retain their dedicated interfaces. */
export function InteriorPage({children,kind='detail'}:{children:ReactNode;kind?:string}) {
  return <div className={`approved-interior interior-${kind}`}>{children}</div>;
}

export function InteriorEstimateLink({label='Get my online estimate'}:{label?:string}) {
  return <a className="interior-estimate-link" href="/estimate">{label}<ArrowUpRight size={18} aria-hidden="true"/></a>;
}

/** The approved split-detail and editorial-introduction compositions. */
export function InteriorHero({children,imageSrc,imageAlt='',layout='split',estimateAction=false,className=''}:{children:ReactNode;imageSrc?:string;imageAlt?:string;layout?:'split'|'editorial'|'contact';estimateAction?:boolean;className?:string}) {
  return <section className={`interior-hero interior-hero-${layout}${imageSrc?'':' interior-hero-text'}${className?` ${className}`:''}`}>
    <div className="interior-hero-copy">{children}{estimateAction&&<div className="interior-hero-action"><InteriorEstimateLink/></div>}</div>
    {imageSrc&&<div className="interior-hero-image"><img {...heroImageAttrs(imageSrc)} alt={imageAlt} width={1400} height={1100} fetchPriority="high" loading="eager" decoding="sync"/></div>}
  </section>;
}

/** Reusable secondary column, with the estimator as its single dominant action. */
export function InteriorProjectAside({children}:{children?:ReactNode}) {
  return <aside className="interior-project-aside"><p className="interior-eyebrow">YOUR PROJECT. REVIEWED BY OUR TEAM.</p><h2>Start with<br/><em>what you know.</em></h2><p>Describe your project and share plans or photos for our team to review.</p><InteriorEstimateLink/>{children}<a className="interior-text-link" href="/contact">Talk through the details<ArrowUpRight size={16} aria-hidden="true"/></a></aside>;
}

export function InteriorDocument({heading,children,contents=[]}:{heading:ReactNode;children:ReactNode;contents?:{id:string;label:string}[]}) {
  return <div className="interior-document"><header className="interior-document-heading">{heading}</header><div className="interior-document-grid"><aside className="interior-document-index">{contents.length>0&&<nav aria-label="On this page"><p className="interior-eyebrow">ON THIS PAGE</p>{contents.map(item=><a href={`#${item.id}`} key={item.id}>{item.label}</a>)}</nav>}<InteriorEstimateLink/></aside><div className="interior-document-main">{children}</div></div></div>;
}
