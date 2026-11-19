import type { CSSProperties } from 'react';

/**
 * A cabinet door front drawn in CSS (app/finish-picker.css). Its surface is a
 * finish's own catalog sample, passed as the `--fp-tex` custom property; it is
 * never a recoloured photograph and never a flat colour.
 *
 * The homepage picker draws it bare and switches Shaker and Slab in CSS. The
 * door visualizer passes `profile`, one of the six catalog door styles
 * (app/door-visualizer.css draws each from the catalog's own picture of it).
 */
export function DoorFront({ style, profile }: { style: CSSProperties; profile?: string }) {
  return (
    <span className={`fp-door${profile ? ` fp-profile-${profile}` : ''}`} style={style}>
      <span className="fp-skin"><span className="fp-half" /><span className="fp-half fp-half-b" /></span>
      {profile ? <span className="fp-centre"><span className="fp-centre-in" /></span> : null}
      <span className="fp-sheen" />
      <span className="fp-panel" />
      <span className="fp-joint fp-joint-t" />
      <span className="fp-joint fp-joint-b" />
      {profile ? <><span className="fp-miter fp-miter-tl" /><span className="fp-miter fp-miter-tr" /><span className="fp-miter fp-miter-bl" /><span className="fp-miter fp-miter-br" /><span className="fp-bead" /></> : null}
      <span className="fp-pull" />
    </span>
  );
}
