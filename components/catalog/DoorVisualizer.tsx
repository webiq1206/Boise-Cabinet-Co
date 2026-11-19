"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Check, Link2, Search } from "lucide-react";
import { DoorFront } from "@/components/catalog/DoorFront";
import { familyButtonClass } from "@/components/family/Button";
import { localAlt } from "@/shared/localAlt";
import {
  DOOR_VISUALIZER_PATH,
  VISUALIZER_FAMILIES,
  visualizerHref,
  visualizerQuoteLine,
  type DrawnDoorStyle,
  type VisualizerFamily,
  type VisualizerFinish,
  type VisualizerSelection,
  type VisualizerStyle,
} from "@/shared/doorVisualizerModel";

/** The /estimate form's draft (KitchenCabinetsQuoteForm, sessionStorage, this tab only). */
const QUOTE_DRAFT_KEY = "brc_estimate_quote_v1";

/** How many chips a family shows before "Show all". */
const CHIP_PAGE = 60;

/** A finish as the page hands it over: the catalog entry plus the URLs to load (already versioned). */
export type VisualizerFinishView = VisualizerFinish & { imageUrl: string; chipUrl: string };

const familyLabel = (family: VisualizerFamily) => VISUALIZER_FAMILIES.find((item) => item.id === family)?.label ?? family;

/**
 * The door visualizer: every catalog finish on every catalog door style, as a
 * cabinet door front drawn in CSS whose surface is the finish's own catalog
 * sample (components/catalog/DoorFront.tsx).
 *
 * The page renders the door a URL names on the server, so a shared link shows
 * its door before and without JavaScript; the controls are one GET form of
 * native radios and plain links. Here a choice only swaps state and rewrites
 * the address, so nothing reloads. One family's chips are on the page at a
 * time, at 160px and lazily loaded; only the chosen sample loads at full size.
 */
export function DoorVisualizer({
  finishes,
  styles,
  initial,
}: {
  finishes: readonly VisualizerFinishView[];
  styles: readonly VisualizerStyle[];
  initial: VisualizerSelection & { all?: boolean };
}) {
  const [finishSlug, setFinishSlug] = useState(initial.finish);
  const [style, setStyle] = useState<DrawnDoorStyle>(initial.style);
  const [family, setFamily] = useState<VisualizerFamily>(initial.family);
  const [query, setQuery] = useState(initial.q);
  const [showAll, setShowAll] = useState(Boolean(initial.all));
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = finishes.find((item) => item.slug === finishSlug) ?? finishes[0];
  const activeStyle = styles.find((item) => item.slug === style) ?? styles[0];
  const counts = useMemo(() => {
    const result: Record<VisualizerFamily, number> = { matte: 0, gloss: 0, woodgrain: 0 };
    for (const item of finishes) result[item.family] += 1;
    return result;
  }, [finishes]);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return finishes.filter((item) => item.family === family && (!needle || item.name.toLowerCase().includes(needle)));
  }, [finishes, family, query]);
  // One page of chips at a time: a family's first sixty (and the chosen finish),
  // or everything that matches a search. "Show all" brings the rest.
  const paged = !showAll && !query.trim() && visible.length > CHIP_PAGE;
  const shown = paged
    ? [...visible.slice(0, CHIP_PAGE), ...visible.slice(CHIP_PAGE).filter((item) => item.slug === finish.slug)]
    : visible;
  const selectedIsVisible = shown.some((item) => item.slug === finish.slug);
  const shareHref = visualizerHref({ finish: finish.slug, style });

  useEffect(() => setMounted(true), []);
  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  // The address always names the door on screen, so it can be copied or reloaded.
  useEffect(() => {
    if (!mounted) return;
    const href = visualizerHref({ finish: finish.slug, style, family: family === finish.family ? undefined : family });
    if (`${window.location.pathname}${window.location.search}` !== href) window.history.replaceState(null, "", href);
  }, [mounted, finish.slug, finish.family, style, family]);

  function chooseFinish(next: VisualizerFinishView) {
    setFinishSlug(next.slug);
    // A style the catalog does not offer on this finish falls back to the shaker every finish has.
    if (!next.styles.includes(style)) setStyle("modern-shaker");
  }

  function carryIntoQuote() {
    try {
      const line = visualizerQuoteLine(finish, activeStyle);
      const raw = sessionStorage.getItem(QUOTE_DRAFT_KEY);
      const draft = (raw ? JSON.parse(raw) : {}) as { project?: string };
      const kept = (draft.project ?? "").replace(/Door style: [^.]+\. Finish: [^.]+\.\s*/g, "").trim();
      sessionStorage.setItem(QUOTE_DRAFT_KEY, JSON.stringify({ ...draft, project: kept ? `${line} ${kept}` : line }));
    } catch {
      /* storage unavailable: the form simply opens empty */
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${shareHref}`);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  }

  const unavailable = styles.filter((item) => !finish.styles.includes(item.slug));

  return (
    <div className="dv">
      <div className="dv-stage">
        <figure className={`dv-figure${finish.family === "gloss" ? " fp-gloss" : ""}`}>
          <DoorFront profile={style} style={{ "--fp-tex": `url("${finish.imageUrl}")` } as CSSProperties} />
          <figcaption aria-live="polite" aria-atomic="true">
            <b>{finish.name}</b>
            <span>{familyLabel(finish.family)} finish, {activeStyle.name} door</span>
          </figcaption>
        </figure>
      </div>

      <div className="dv-side">
        <form className="dv-controls" method="get" action={DOOR_VISUALIZER_PATH} onSubmit={(event) => event.preventDefault()}>
          <fieldset className="dv-fieldset">
            <legend className="dv-legend">Door style</legend>
            <div className="dv-styles">
              {styles.map((item) => {
                const offered = finish.styles.includes(item.slug);
                return (
                  <label key={item.slug} className={`dv-style${offered ? "" : " is-unavailable"}`}>
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
            {/* The line's place is kept, so choosing a woodgrain moves nothing below it. */}
            <div className="dv-notes">
              {unavailable.map((item) => (
                <p className="dv-note" key={item.slug}>
                  {item.name} is offered in {item.families.map((id) => familyLabel(id).toLowerCase()).join(" and ")} finishes.
                </p>
              ))}
            </div>
          </fieldset>

          <fieldset className="dv-fieldset">
            <legend className="dv-legend">Finish</legend>
            <nav className="dv-families" aria-label="Finish family">
              {VISUALIZER_FAMILIES.map((item) => (
                <a
                  key={item.id}
                  href={visualizerHref({ finish: finish.slug, style, family: item.id })}
                  aria-current={family === item.id ? "true" : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    setFamily(item.id);
                    setQuery("");
                  }}
                >
                  {item.label} <span>{counts[item.id]}</span>
                </a>
              ))}
            </nav>
            <input type="hidden" name="family" value={family} data-clarity-mask="True" />
            <label className="dv-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search {familyLabel(family).toLowerCase()} finishes by name</span>
              <input
                type="search"
                name="q"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${counts[family]} ${familyLabel(family).toLowerCase()} finishes`}
                autoComplete="off"
                maxLength={60}
                data-clarity-mask="True"
              />
            </label>
            <p className="dv-count" role="status">
              {paged
                ? `Showing ${CHIP_PAGE} of ${counts[family]} ${familyLabel(family).toLowerCase()} finishes`
                : visible.length === counts[family]
                  ? `${counts[family]} ${familyLabel(family).toLowerCase()} finishes`
                  : `${visible.length} of ${counts[family]} ${familyLabel(family).toLowerCase()} finishes`}
            </p>
            <div className="dv-chips" role="radiogroup" aria-label={`${familyLabel(family)} finishes`}>
              {shown.map((item) => (
                <label key={item.slug} className="dv-chip" title={item.name}>
                  <input
                    type="radio"
                    name="finish"
                    value={item.slug}
                    checked={finish.slug === item.slug}
                    onChange={() => chooseFinish(item)}
                    data-clarity-mask="True"
                  />
                  <span className="dv-chip-face">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.chipUrl}
                      alt={localAlt(`${item.name} ${familyLabel(item.family).toLowerCase()} cabinet finish sample`)}
                      width={160}
                      height={160}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className="sr-only">{item.name}</span>
                </label>
              ))}
              {visible.length === 0 ? <p className="dv-empty">No {familyLabel(family).toLowerCase()} finish has that name.</p> : null}
            </div>
            {/* The row keeps its place, so switching family moves nothing below it. */}
            <div className="dv-more-row">
              {paged ? (
                <a
                  className="dv-link dv-more"
                  href={`${visualizerHref({ finish: finish.slug, style, family })}&all=1`}
                  onClick={(event) => {
                    event.preventDefault();
                    setShowAll(true);
                  }}
                >
                  Show all {visible.length} {familyLabel(family).toLowerCase()} finishes
                </a>
              ) : null}
            </div>
            {showAll ? <input type="hidden" name="all" value="1" data-clarity-mask="True" /> : null}
            {/* Keeps the door on screen when the form is sent without picking a chip. */}
            {selectedIsVisible ? null : <input type="hidden" name="finish" value={finish.slug} data-clarity-mask="True" />}
          </fieldset>
          <noscript>
            <button type="submit" className={familyButtonClass({ variant: "secondary", size: "md" })}>Show this door</button>
          </noscript>
        </form>

        <div className="dv-result">
          <p className="dv-name">
            <b>{finish.name}</b>
            <span>{familyLabel(finish.family)} finish, {activeStyle.name} door</span>
          </p>
          <div className="dv-actions">
            <a
              className={familyButtonClass({ variant: "primary", size: "lg" })}
              href="/estimate#estimate-request"
              onClick={carryIntoQuote}
            >
              Request a quote with this finish
            </a>
            <a className="dv-link" href={`/search?q=${encodeURIComponent(finish.name)}&finish=${finish.family}`}>
              See cabinets in this finish <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            {mounted ? (
              <button type="button" className="dv-link dv-copy" onClick={copyLink}>
                {copied ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
                <span aria-live="polite">{copied ? "Link copied" : "Copy a link to this door"}</span>
              </button>
            ) : null}
          </div>
          <p className="dv-sample-note">Catalog samples shown on screen. Confirm your finish with a physical sample.</p>
        </div>
      </div>
    </div>
  );
}
