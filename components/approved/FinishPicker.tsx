import type { CSSProperties } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { DoorFront } from '@/components/catalog/DoorFront';
import { FinishSwipe } from '@/components/approved/FinishSwipe';
import { versionedSrc } from '@/lib/images/imageVersion';
import { localAlt } from '@/shared/localAlt';
import type { HomeFinish, HomeFinishFamily } from '@/shared/homeFinishes';

const FAMILY_ORDER: HomeFinishFamily[] = ['matte', 'gloss', 'woodgrain'];

/**
 * Homepage "Find your point of view" (owner, 19 November 2026): choosing a
 * finish shows that finish. Each option is a real catalog finish; the large
 * panel is a cabinet door front drawn in CSS whose surface is that finish's
 * own catalog sample, never a recoloured photograph and never a flat colour.
 * A second radio pair switches the drawn profile between Shaker and Slab.
 *
 * The options are native radios in one group, so arrow keys move between them
 * and the choice is announced. The panel and the details follow the checked
 * radio in CSS (:has), which means it works before and without JavaScript and
 * nothing is re-rendered. Every sample has its place reserved, so nothing
 * moves when the choice changes. The links are plain links.
 *
 * Phones and tablets (owner, 21 November 2026: "it should look feel and
 * function like a mobile application"): the heading comes first, then the
 * door, the swatch tray and the profile switch as one panel sized to fit
 * between the header and the bottom bar (app/finish-picker.css, max-width
 * 1000px). FinishSwipe adds swipe and arrow buttons once the page is
 * interactive; without it every choice still works.
 */
export function FinishPicker({ finishes }: { finishes: readonly HomeFinish[] }) {
  if (!finishes.length) return null;
  const total = finishes[0] ? FAMILY_ORDER.reduce((sum, family) => sum + (finishes.find((f) => f.family === family)?.familyCount ?? 0), 0) : 0;
  return (
    <section id="finishes" className="finish-section fp">
      <div className="fp-view">
      <div className="finish-photo fp-stage" aria-hidden="true">
        {finishes.map((finish, index) => (
          <figure className={`fp-sample fp-s${index} fp-${finish.family}`} key={finish.slug}>
            {/* A cabinet door front drawn in CSS. Its surface is this finish's own catalog sample. */}
            <DoorFront style={{ '--fp-tex': `url("${versionedSrc(finish.image)}")` } as CSSProperties} />
            <figcaption>
              <b>{finish.name}</b>
              <span>{finish.familyLabel} finish</span>
            </figcaption>
          </figure>
        ))}
      </div>
      <FinishSwipe />
      </div>
      <div className="finish-copy">
        <p className="eyebrow">FIND YOUR POINT OF VIEW</p>
        <h2>A little texture.<br />A little contrast.<br /><em>All you.</em></h2>
        <p>
          {total} finishes. Shaker, slab and more door styles. Matte solids, high-gloss colors, and woodgrain textures.
          Choose one to see it on a door.
        </p>
        <fieldset className="fp-group">
          <legend className="sr-only">Choose a finish to see its sample</legend>
          <div className="fp-row">
            {FAMILY_ORDER.map((family) => {
              const members = finishes.map((finish, index) => ({ finish, index })).filter(({ finish }) => finish.family === family);
              if (!members.length) return null;
              return (
                <div className="fp-family" key={family}>
                  <span className="fp-family-label">
                    {members[0].finish.familyLabel} <span>{members[0].finish.familyCount}</span>
                  </span>
                  <div className="fp-chips">
                    {members.map(({ finish, index }) => (
                      <label className="fp-opt" key={finish.slug}>
                        <input type="radio" name="home-finish" value={finish.slug} className={`fp-in fp-in${index}`} data-clarity-mask="True" defaultChecked={index === 0} />
                        <span className="fp-chip">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={versionedSrc(finish.image)} alt={localAlt(`${finish.name} ${finish.familyLabel.toLowerCase()} cabinet finish sample`)} width={480} height={480} loading="lazy" decoding="async" />
                        </span>
                        <span className="sr-only">{finish.name}, {finish.familyLabel.toLowerCase()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
        <div className="fp-meta">
        <fieldset className="fp-profile">
          <legend className="sr-only">Door profile</legend>
          <label><input type="radio" name="home-profile" value="shaker" className="fp-pr fp-pr-shaker" data-clarity-mask="True" defaultChecked /><span>Shaker</span></label>
          <label><input type="radio" name="home-profile" value="slab" className="fp-pr fp-pr-slab" data-clarity-mask="True" /><span>Slab</span></label>
        </fieldset>
        <div className="fp-details">
          {finishes.map((finish, index) => (
            <div className={`fp-detail fp-d${index}`} key={finish.slug}>
              <p className="fp-name">
                <b>{finish.name}</b>
                <span>{finish.familyLabel}</span>
              </p>
              <p className="fp-actions">
                <a className="text-link light" href={finish.href}>See this finish <ArrowUpRight size={16} aria-hidden="true" /></a>
                <a className="text-link light" href={finish.familyHref}>
                  See all {finish.familyCount} {finish.familyLabel.toLowerCase()} finishes <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </p>
            </div>
          ))}
        </div>
        </div>
        <p className="sample-note">Catalog samples shown on screen. Confirm your finish with a physical sample.</p>
        <div className="finish-links">
          <a className="text-link light" href="/catalog/door-visualizer">Try all {total} finishes on six door styles <ArrowUpRight size={18} aria-hidden="true" /></a>
          <a className="text-link light" href="/catalog">Explore the full catalog <ArrowUpRight size={18} aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}
