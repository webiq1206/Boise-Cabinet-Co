'use client';
import {useState, type ReactNode} from 'react';
import {ArrowUpRight,Check} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import {Accordion,AccordionItem,AccordionTrigger,AccordionContent} from '@/components/ui/accordion';
import {FAQSection} from '@/components/FAQSection';
import {DOOR_STYLES} from '@/shared/catalog/generated/doorStyles';
import { CABINET_WORKMANSHIP_WARRANTY, IDAHO_REGISTERED_CONTRACTOR, MANUFACTURER_WARRANTY_PASS_THROUGH } from '@/shared/claims';
import { CTA_QUOTE_HREF, CTA_REQUEST_QUOTE } from '@/shared/ctaCopy';
import { SITE_CONFIG } from '@/shared/siteConfig';
import { FamilyButton } from '@/components/family/Button';
import { brandStyle } from '@/components/family/brandStyle';
import { CabinetHeroVideo } from './CabinetHeroVideo';
import { type ProofItem } from '@/components/family/ProofStrip';
import { DOPL_LICENSE_SEARCH, FAMILY_BRAND } from '@/lib/familyBrand';
import {steps,differentiators,additionalRooms} from './cabinet-content';
import dynamic from 'next/dynamic';
// The planning range runs the estimate engine, which carries the full finish
// library. Server-rendered as before, but its own chunk: the homepage hydrates
// first, and the logo link's prefetch of "/" on every other page no longer
// downloads and evaluates the finish library.
const KitchenPlanningRange = dynamic(() => import('./KitchenPlanningRange').then((m) => m.KitchenPlanningRange));

const rooms = [
 {name:'Kitchen',alt:'White oak kitchen island with woven pendants, cream perimeter cabinets and open shelves',title:'The heart of your home.',image:'/family/drive/landscape-1-white-oak-kitchen-island-with-pendants.webp',desc:'Base cabinets, uppers, pantries, and appliance panels designed as one coordinated kitchen.',details:'Bring storage, appliances, and everyday routines into one thoughtful layout. Explore pantry cabinets, deep drawers, island storage, and finishes that work together.',features:['Storage planned around the way you cook','Coordinated island and perimeter cabinetry','Door, finish, and hardware selections']},
 {name:'Bathroom',alt:'White oak bathroom vanity with brass hardware, a cream counter and wall-mounted brass faucets',title:'A better start to your day.',image:'/family/drive/landscape-3-white-oak-bathroom-vanity.webp',desc:'Vanities and drawer storage sized for your daily routine, with moisture-resistant options.',details:'Make your bathroom easier to use with a vanity planned around your space, storage needs, and plumbing. Coordinate drawer layouts, door styles, and finishes with the rest of the room.',features:['Single and double vanity configurations','Storage that keeps counters clear','Finish guidance for your room']},
 {name:'Mudroom & built-ins',alt:'Cream built-ins with arched lit niches above shaker cabinets beside a window seat',title:'Less clutter. More living.',image:'/family/drive/landscape-2-arched-built-ins-and-window-seat.webp',desc:'Bench seating, boot storage, and built-ins that make hardworking spaces feel considered.',details:'Put hardworking storage where you need it. Plan entry benches, laundry cabinetry, home office built-ins, entertainment storage, and custom pantry layouts.',features:['Storage sized to your room','Coordinated cabinetry throughout your home','Practical layouts for everyday routines']}
];
const finishes=[{name:'Bitter',family:'Warm neutral',image:'bitter.webp',code:''},{name:'Macaron Green',family:'Soft color',image:'green.webp',code:''},{name:'Breeze Beige',family:'Light neutral',image:'beige.webp',code:''},{name:'Pearl Black',family:'Deep contrast',image:'black.webp',code:''}];

/** Sourced facts that stay after the finish-count and door-count tiles were removed. */
const PROOF: ProofItem[] = [
 {label:'Consultation',text:'Free in-home design consultation',href:'#contact'},
 {label:'Registered',text:IDAHO_REGISTERED_CONTRACTOR,href:DOPL_LICENSE_SEARCH,linkTitle:'Idaho contractor registration 8381215',linkLabel:'Idaho contractor registration 8381215 (opens in a new tab)',newTab:true},
];

const HOME_ANSWER =
  "Get cabinets designed around your measurements and installed by our own crew. Boise Cabinet Co designs custom cabinets for Boise and the Treasure Valley, built to order. Homeowners and builders get kitchen cabinets, vanities and built-ins with a free in-home design consultation, a written price before work, and a written workmanship warranty on installation.";

const IDENTITY =
  'Boise Cabinet Co designs custom cabinets to your measurements, plans each order to your layout, finishes and hardware, and installs it with our own Treasure Valley crew.';

export function ApprovedHome({reviews=null}:{reviews?: ReactNode}){const [finish,setFinish]=useState<number|null>(null);return <div className="cabinet-approved">
  <section className="fam-hero" data-family-hero="" data-video-hero="" data-fit="viewport"
   data-desktop-from={FAMILY_BRAND.header.desktopFrom} data-scrim="standard"
   style={brandStyle()} aria-labelledby="family-hero-title">
   <CabinetHeroVideo />
   <div className="fam-hero-scrim" aria-hidden="true" />
   <div className="fam-hero-inner"><div className="fam-hero-copy">
    <p className="fam-hero-eyebrow">Custom cabinets · Treasure Valley, Idaho</p>
    <h1 className="fam-hero-title" id="family-hero-title">Custom cabinets in Boise,{' '}<span className="fam-hero-accent">Idaho</span></h1>
    <p className="fam-hero-answer" data-aeo="answer" data-speakable="summary">{HOME_ANSWER}</p>
    <p className="fam-hero-support">Kitchen cabinets, vanities, and built-ins.</p>
    <div className="fam-hero-actions">
     <FamilyButton href={CTA_QUOTE_HREF} variant="hero" size="lg" data-hero-cta="primary" data-cta="primary">{CTA_REQUEST_QUOTE}</FamilyButton>
     <a href={SITE_CONFIG.phoneHref} className="fam-hero-link">Call or text {SITE_CONFIG.phone}</a>
    </div>
    <p className="fam-hero-micro">Written price before work.</p>
   </div></div>
  </section>
  <section className="fam-proof" aria-label="The Boise Cabinet Co difference" style={brandStyle()}>
    <ul className="fam-container fam-proof-list" data-count={PROOF.length}>
      {PROOF.map((item) => (
        <li className="fam-proof-cell" key={item.label}>
          <p className="fam-proof-label">{item.label}</p>
          <p className="fam-proof-text">
            {item.href ? (
              <a
                href={item.href}
                title={item.linkTitle}
                aria-label={item.linkLabel}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener" : undefined}
              >
                {item.text}
              </a>
            ) : (
              item.text
            )}
          </p>
        </li>
      ))}
    </ul>
  </section>
  <section id="cabinetry" className="section wrap room-editorial">
 <div className="section-heading"><div><p className="eyebrow">CABINETRY, CONSIDERED</p><h2>Every room.<br/><em>Considered.</em></h2></div><p>Custom kitchen cabinets, bathroom vanities, and built-in storage. Choose your door style, finish, and hardware. We bring the layout and installation together with our own crew. Free in-home design consultation.</p></div>
 <Tabs defaultValue="kitchen" className="room-explorer"><TabsList className="room-tabs"><TabsTrigger value="kitchen">Kitchens</TabsTrigger><TabsTrigger value="bathroom">Bathrooms</TabsTrigger><TabsTrigger value="storage">Built-ins</TabsTrigger><TabsTrigger value="more">More rooms</TabsTrigger></TabsList>
 {rooms.map((r,i)=><TabsContent key={r.name} value={['kitchen','bathroom','storage'][i]}><div className="room-scene"><button className="room-scene-image" onClick={()=>window.location.assign(["/cabinets/kitchen","/cabinets/bathroom","/cabinets/mudroom"][i])} aria-label={'Explore '+r.name.toLowerCase()+' cabinetry'}><img src={r.image} alt={r.alt} loading="lazy" width="1200" height="628"/><span className="scene-explore">Explore this space <ArrowUpRight size={18}/></span></button><div className="room-scene-copy"><span className="eyebrow">0{i+1} / {r.name}</span><h3>{r.title}</h3><p>{r.desc}</p><button className="text-link" onClick={()=>window.location.assign(["/cabinets/kitchen","/cabinets/bathroom","/cabinets/mudroom"][i])}>Explore {r.name.toLowerCase()} <ArrowUpRight size={18}/></button></div></div></TabsContent>)}
 <TabsContent value="more"><div className="room-scene"><div className="room-scene-image"><img src="/family/drive/square-2-pantry-cabinet-with-open-shelves.webp" alt="Cream pantry cabinets with white oak open shelves holding glass storage jars" loading="lazy" width="1200" height="1200"/></div><div className="room-scene-copy"><span className="eyebrow">THINK BEYOND THE KITCHEN</span><h3>Every inch.<br/>Put to good use.</h3><Accordion type="single" collapsible className="other-room-list">{additionalRooms.map(([name,desc,url])=><AccordionItem value={name} key={name}><AccordionTrigger>{name}</AccordionTrigger><AccordionContent><p>{desc}</p><a className="text-link" href={''+url}>Explore {name.toLowerCase()} <ArrowUpRight size={16}/></a></AccordionContent></AccordionItem>)}</Accordion></div></div></TabsContent>
 </Tabs></section>
  {/* The showroom moment: the six door profiles the catalog carries, as a row of
      samples. The honesty note about finished work sits beside the catalog link. */}
  <section id="door-styles" className="section wrap" aria-labelledby="door-styles-heading">
    <div className="section-heading"><div><p className="eyebrow">DOOR STYLES</p><h2 id="door-styles-heading">Six profiles.<br/><em>One of them is yours.</em></h2></div>
    <p>From clean slab doors to distinctive shaker details, in 299 finishes. We will help you compare the construction and proportions in your own kitchen.</p></div>
    <div className="fr-doors">
      {DOOR_STYLES.map((d)=><a className="fr-door" key={d.name} href="/catalog"><span className="fr-door-media"><img src={`/generated/door-styles/${d.slug}.svg`} alt={`${d.name} cabinet door profile`} loading="lazy" width="320" height="400"/></span><b>{d.name}</b><span>Door profile</span></a>)}
    </div>
    <div className="fr-cards-more" id="projects-honest" aria-labelledby="projects-heading">
      <span id="projects-heading">Compare cabinet styles, finishes, and layouts for your home.</span>
      <a className="text-link" href="/design-ideas">Design ideas <ArrowUpRight size={18}/></a>
      <a className="text-link" href="/catalog">Explore the full catalog <ArrowUpRight size={18}/></a>
    </div>
  </section>
  <section id="finishes" className="finish-section">
   <div className="finish-photo"><img src="/family/drive/square-1-brass-cup-pull-detail.webp" alt="Brass cup pull on a cream shaker drawer beside a white oak panel" loading="lazy" width="1200" height="1200"/><div className="photo-label"><span>THE DETAILS MAKE IT YOURS.</span><span>Design & selections</span></div></div>
   <div className="finish-copy"><p className="eyebrow">FIND YOUR POINT OF VIEW</p><h2>A little texture.<br/>A little contrast.<br/><em>All you.</em></h2><p>299 finishes. Shaker, slab and more door styles. Matte solids, high-gloss colors, and woodgrain textures. Find the combination that makes your home feel like you.</p>
   <div className="finish-swatches"><div className="swatches">{finishes.map((f,i)=><button key={f.name} onClick={()=>setFinish(i)} aria-label={`Select ${f.name}`} aria-pressed={finish===i} className={finish===i?'selected':''}><span className="swatch-image"><img src={'/images/approved/'+f.image} alt={f.name} width="480" height="480"/></span>{finish===i&&<span><Check size={14}/></span>}</button>)}</div><div className="swatch-info" aria-live="polite"><b>{finish===null?'Find your finish':finishes[finish].name}</b><span>{finish===null?'Select a sample to explore':finishes[finish].code?`${finishes[finish].family} · ${finishes[finish].code}`:finishes[finish].family}</span></div><p className="sample-note">Explore a selection from our catalog. Confirm your finish with a physical sample.</p></div>
   <div className="finish-links"><a className="text-link light" href="/catalog">Explore the full catalog <ArrowUpRight size={18}/></a></div></div>
  </section>
  <section id="why-us" className="why-section section"><div className="wrap why-layout"><div className="sticky-intro"><p className="eyebrow">WHY BOISE CABINET CO</p><h2>Great cabinets.<br/><em>A better experience.</em></h2><p>One accountable team. A written scope before order. A job site that respects your home. Five things you can count on.</p></div><Accordion type="single" collapsible defaultValue="standard-0" className="standard-accordion">{differentiators.map(([title,desc],i)=><AccordionItem value={"standard-"+i} key={title}><AccordionTrigger>{title}</AccordionTrigger><AccordionContent>{desc}</AccordionContent></AccordionItem>)}</Accordion></div><div className="value-panel wrap"><figure className="value-photo"><img src="/family/drive/square-3-built-in-coffee-bar-cabinet.webp" alt="Built-in white oak coffee bar cabinet with an espresso machine and open shelf" loading="lazy" width="1200" height="1200"/><figcaption>WHITE OAK COFFEE BAR</figcaption></figure><div className="value-copy"><p className="eyebrow">WHERE YOUR MONEY GOES</p><h2>Don&apos;t pay for our overhead.<br/><em>Pay for the cabinets.</em></h2><ul><li>Big offices, fancy showrooms, truck fleets, and layers of management add cost.</li><li>We keep the operation lean so more of your budget goes into better materials and the cabinetry in your home.</li></ul><a className="text-link" href="/estimate">{CTA_REQUEST_QUOTE} <ArrowUpRight size={18}/></a></div></div></section>
  <section id="process" className="section wrap process-editorial"><div className="process-overview"><p className="eyebrow">FROM IDEA TO INSTALLATION</p><h2>A clear plan.<br/><em>At every step.</em></h2><ul><li>{IDENTITY}</li><li>Know what happens next, what needs your approval, and where your project stands.</li></ul><a className="text-link" href="/estimate">{CTA_REQUEST_QUOTE} <ArrowUpRight size={18}/></a></div><Accordion type="single" collapsible defaultValue="step-0" className="process-accordion">{steps.map((s,i)=><AccordionItem value={'step-'+i} key={s.tag}><AccordionTrigger><span className="process-index">0{i+1}</span><span>{s.title}</span></AccordionTrigger><AccordionContent><p>{s.desc}</p></AccordionContent></AccordionItem>)}</Accordion></section>
  <section id="inspiration" className="craft-section"><div className="craft-photo"><img src="/images/approved/drawer-oak.webp" alt="Natural oak drawer and organized utensil storage" loading="lazy" width="1448" height="1086"/><span className="craft-caption">THE BEAUTY IS IN THE EVERYDAY DETAILS</span></div><div className="craft-copy"><p className="eyebrow">WHAT YOU ARE BUYING</p><h2>Beautiful outside.<br/><em>Thoughtful inside.</em></h2><p>Frameless Euro construction. Soft-close hardware. Hand-checked finishes. Made to order for everyday life.</p><Accordion type="single" collapsible className="craft-details"><AccordionItem value="construction"><AccordionTrigger>Box and drawer construction</AccordionTrigger><AccordionContent>Frameless boxes with plywood or melamine-faced cores by line, full-extension drawers, and soft-close hinges. See the <a href="/construction">construction page</a> for the specification of each line.</AccordionContent></AccordionItem><AccordionItem value="hardware"><AccordionTrigger>Hardware you feel every day</AccordionTrigger><AccordionContent>Soft-close doors and full-extension drawer storage, with selections coordinated around your routines.</AccordionContent></AccordionItem><AccordionItem value="warranty"><AccordionTrigger>Warranty claims handled by us</AccordionTrigger><AccordionContent>{MANUFACTURER_WARRANTY_PASS_THROUGH}. {CABINET_WORKMANSHIP_WARRANTY}. <a href="/warranty">See the warranty page</a> for current terms.</AccordionContent></AccordionItem></Accordion><button className="text-link" onClick={()=>window.location.assign("/catalog")}>Explore design inspiration <ArrowUpRight size={18}/></button></div></section>
  <section id="who-hiring" className="section wrap" aria-labelledby="who-hiring-heading">
    <div className="fr-founder">
      <img className="people-safe-photo" src="/images/about/perkins-family-meridian-idaho.webp" alt="Nick Perkins with his wife and five children at a pumpkin patch in Meridian, Idaho" width={2560} height={1920} loading="lazy" style={{objectFit:'contain',aspectRatio:'4 / 3'}}/>
      <div>
        <p className="eyebrow">WHO YOU ARE HIRING</p>
        <h2 id="who-hiring-heading">Nick Perkins, founder.</h2>
        <ul>
          <li>Construction project manager with a bachelor&apos;s degree in Construction with an emphasis in Project Management.</li>
          <li>More than a decade of custom homes, remodels and developments. Husband, father of five. The family moved to the Treasure Valley in 2025.</li>
        </ul>
        <blockquote>&ldquo;Work hard. Keep your word. Treat people right.&rdquo;</blockquote>
        <p><a className="text-link" href="/about">Read Nick&apos;s story <ArrowUpRight size={18}/></a></p>
      </div>
    </div>
  </section>
  {reviews}
  <section className="builder-band wrap"><div><p className="eyebrow">FOR BUILDERS, REMODELERS & DESIGNERS</p><h2>Your plans.<br/><em>Our cabinet expertise.</em></h2></div><div><p>One home or a full project pipeline. Let&apos;s coordinate the cabinet package, selections, and installation scope around your plans.</p><FamilyButton href="/estimate" data-cta="primary" variant="primary" size="lg">{CTA_REQUEST_QUOTE}</FamilyButton><button className="text-link estimate-secondary" onClick={()=>window.location.assign("/builders")}>Let&apos;s work together <ArrowUpRight size={18}/></button></div></section>
  <KitchenPlanningRange />
  <FAQSection/>
 </div>;}
