'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type TouchEvent } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { DoorFront } from '@/components/catalog/DoorFront';
import { localAlt } from '@/shared/localAlt';
import {
  DEFAULT_VISUALIZER_FINISH,
  DEFAULT_VISUALIZER_STYLE,
  DOOR_VISUALIZER_PATH,
  VISUALIZER_FAMILIES,
  visualizerHref,
  type DrawnDoorStyle,
  type VisualizerFamily,
  type VisualizerFinish,
  type VisualizerStyle,
} from '@/shared/doorVisualizerModel';

/** A finish as the homepage hands it over: the catalog entry plus the URLs to load (already versioned). */
export type HomePickerFinish = VisualizerFinish & { imageUrl: string; chipUrl: string };

const familyLabel = (family: VisualizerFamily) => VISUALIZER_FAMILIES.find((item) => item.id === family)?.label ?? family;
const searchHref = (finish: VisualizerFinish) => `/search?q=${encodeURIComponent(finish.name)}&finish=${finish.family}`;

/**
 * Homepage "Find your point of view" (owner, 19 and 21 November 2026): every
 * catalog finish on every catalog door style, as a cabinet door front drawn
 * in CSS (components/catalog/DoorFront.tsx) whose surface is the finish's own
 * catalog sample (a gloss is drawn from its clean surface, with the gloss in
 * CSS). On phones and tablets it is one app panel: the door, the family tabs,
 * the swatch tray and the door styles fit between the header and the bottom
 * bar, and a swipe on the door or an arrow moves to the next finish.
 *
 * The choices are native radios in a plain GET form to the door visualizer,
 * so without JavaScript a visitor still picks a finish and a style and opens
 * that door there. With JavaScript a choice only swaps state; the address of
 * the homepage never changes. One family's chips are on the page at a time,
 * at 160px and lazily loaded; only the chosen sample loads at full size.
 */
export function HomeDoorPicker({
  finishes,
  styles,
}: {
  finishes: readonly HomePickerFinish[];
  styles: readonly VisualizerStyle[];
}) {
  const initial = finishes.find((item) => item.slug === DEFAULT_VISUALIZER_FINISH) ?? finishes[0];
  const [finishSlug, setFinishSlug] = useState(initial.slug);
  const [style, setStyle] = useState<DrawnDoorStyle>(DEFAULT_VISUALIZER_STYLE);
  const [family, setFamily] = useState<VisualizerFamily>(initial.family);
  const [mounted, setMounted] = useState(false);
  const tray = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  const finish = finishes.find((item) => item.slug === finishSlug) ?? initial;
  const activeStyle = styles.find((item) => item.slug === style) ?? styles[0];
  const counts = useMemo(() => {
    const result: Record<VisualizerFamily, number> = { matte: 0, gloss: 0, woodgrain: 0 };
    for (const item of finishes) result[item.family] += 1;
    return result;
  }, [finishes]);
  const shown = useMemo(() => finishes.filter((item) => item.family === family), [finishes, family]);
  const total = finishes.length;

  useEffect(() => setMounted(true), []);

  // The tray follows the choice, without moving the page.
  useEffect(() => {
    const row = tray.current;
    const chip = row?.querySelector<HTMLElement>(`[data-slug="${finish.slug}"]`);
    if (!row || !chip) return;
    const pad = 24;
    const left = chip.offsetLeft - row.offsetLeft;
    const top = chip.offsetTop - row.offsetTop;
    if (row.scrollWidth > row.clientWidth) {
      if (left - pad < row.scrollLeft) row.scrollTo({ left: Math.max(0, left - pad), behavior: 'smooth' });
      else if (left + chip.offsetWidth + pad > row.scrollLeft + row.clientWidth) row.scrollTo({ left: left + chip.offsetWidth + pad - row.clientWidth, behavior: 'smooth' });
    } else if (row.scrollHeight > row.clientHeight) {
      if (top - 8 < row.scrollTop) row.scrollTo({ top: Math.max(0, top - 8), behavior: 'smooth' });
      else if (top + chip.offsetHeight + 8 > row.scrollTop + row.clientHeight) row.scrollTo({ top: top + chip.offsetHeight + 8 - row.clientHeight, behavior: 'smooth' });
    }
  }, [finish.slug, family]);

  function choose(next: VisualizerFinish) {
    setFinishSlug(next.slug);
    // A style the catalog does not offer on this finish falls back to the shaker every finish has.
    if (!next.styles.includes(style)) setStyle(DEFAULT_VISUALIZER_STYLE);
  }

  function step(direction: 1 | -1) {
    const list = shown.length ? shown : finishes;
    const at = list.findIndex((item) => item.slug === finish.slug);
    const next = at < 0 ? list[0] : list[(at + direction + list.length) % list.length];
    choose(next);
  }

  function onTouchStart(event: TouchEvent) {
    if (event.touches.length !== 1) return;
    touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  function onTouchEnd(event: TouchEvent) {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    step(dx < 0 ? 1 : -1);
  }

  return (
    <section id="finishes" className="finish-section fp">
      <div className="fp-view">
        <div className="finish-photo fp-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <figure className={`fp-sample fp-${finish.family}${finish.family === 'gloss' ? ' fp-gloss' : ''}`} aria-hidden="true">
            <DoorFront profile={style} style={{ '--fp-tex': `url("${finish.imageUrl}")` } as CSSProperties} />
            <figcaption>
              <b>{finish.name}</b>
              <span>{familyLabel(finish.family)} finish, {activeStyle.name}</span>
            </figcaption>
          </figure>
        </div>
        {mounted ? (
          <>
            <button type="button" className="fp-nav fp-nav-prev" aria-label={`Previous ${familyLabel(family).toLowerCase()} finish`} onClick={() => step(-1)}>
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
            <button type="button" className="fp-nav fp-nav-next" aria-label={`Next ${familyLabel(family).toLowerCase()} finish`} onClick={() => step(1)}>
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
      <div className="finish-copy">
        <p className="eyebrow">FIND YOUR POINT OF VIEW</p>
        <h2>A little texture.<br />A little contrast.<br /><em>All you.</em></h2>
        <p className="fp-intro">
          {total} finishes on {styles.length} door styles. Matte solids, high-gloss colors, and woodgrain textures.
          Choose one to see it on a door.
        </p>
        <form className="fp-form" method="get" action={DOOR_VISUALIZER_PATH} onSubmit={(event) => event.preventDefault()}>
          <nav className="fp-tabs" aria-label="Finish family">
            {VISUALIZER_FAMILIES.map((item) => (
              <a
                key={item.id}
                href={visualizerHref({ finish: finish.slug, style, family: item.id })}
                aria-current={family === item.id ? 'true' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  setFamily(item.id);
                }}
              >
                {item.label} <span>{counts[item.id]}</span>
              </a>
            ))}
          </nav>
          <fieldset className="fp-group">
            <legend className="sr-only">{familyLabel(family)} finishes</legend>
            <div className="fp-row" ref={tray}>
              {shown.map((item) => (
                <label className={`fp-opt${item.family === 'gloss' ? ' fp-opt-gloss' : ''}`} key={item.slug} data-slug={item.slug} title={item.name}>
                  <input
                    type="radio"
                    name="finish"
                    value={item.slug}
                    className="fp-in"
                    checked={finish.slug === item.slug}
                    onChange={() => choose(item)}
                    data-clarity-mask="True"
                  />
                  <span className="fp-chip">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.chipUrl} alt={localAlt(`${item.name} ${familyLabel(item.family).toLowerCase()} cabinet finish sample`)} width={160} height={160} loading="lazy" decoding="async" />
                  </span>
                  <span className="sr-only">{item.name}</span>
                </label>
              ))}
            </div>
            {/* Keeps the door on screen when the form is sent from another family's tab. */}
            {shown.some((item) => item.slug === finish.slug) ? null : <input type="hidden" name="finish" value={finish.slug} data-clarity-mask="True" />}
          </fieldset>
          <fieldset className="fp-styles">
            <legend className="sr-only">Door style</legend>
            <div className="fp-styles-row">
              {styles.map((item) => {
                const offered = finish.styles.includes(item.slug);
                return (
                  <label key={item.slug} className={`fp-style${offered ? '' : ' is-unavailable'}`} title={offered ? item.name : `${item.name} is offered in ${item.families.map((id) => familyLabel(id).toLowerCase()).join(' and ')} finishes`}>
                    <input
                      type="radio"
                      name="style"
                      value={item.slug}
                      checked={style === item.slug}
                      disabled={!offered}
                      onChange={() => setStyle(item.slug)}
                      data-clarity-mask="True"
                    />
                    <span>{item.name}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <noscript>
            <button type="submit" className="fp-submit">Show this door</button>
          </noscript>
        </form>
        <div className="fp-meta">
          <p className="fp-name" aria-live="polite" aria-atomic="true">
            <b>{finish.name}</b>
            <span>{familyLabel(finish.family)} finish, {activeStyle.name} door</span>
          </p>
          <p className="fp-actions">
            <a className="text-link light" href={searchHref(finish)}>See this finish <ArrowUpRight size={16} aria-hidden="true" /></a>
            <a className="text-link light" href={visualizerHref({ finish: finish.slug, style })}>Full door visualizer <ArrowUpRight size={16} aria-hidden="true" /></a>
          </p>
        </div>
        <p className="sample-note">Catalog samples shown on screen. Confirm your finish with a physical sample.</p>
        <div className="finish-links">
          <a className="text-link light" href="/catalog">Explore the full catalog <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
