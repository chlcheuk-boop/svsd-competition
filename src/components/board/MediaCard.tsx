import type { Accent, Media } from '../../types';
import { MediaArt } from './MediaArt';
import { MiniStamp } from '../ui/MiniStamp';
import { person } from '../../data/people';
import { sizeOf } from '../../lib/geometry';
import { fmtEventDate, isWords } from '../../lib/mediaKinds';
import './media-card.css';

function PlayGlyph() {
  return (
    <svg className="play-glyph" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="15" fill="rgba(255,250,246,.9)" />
      <path d="M16.5 13.5l10.2 6.6-10.1 6.5z" fill="none" stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

const HOLE_R = 4.2;
const HOLE_GAP = 13;

/** A postage-stamp outline: a rectangle with round perforation bites along every edge. */
export function perforatedPath(w: number, h: number, r = HOLE_R, gap = HOLE_GAP) {
  const nx = Math.max(2, Math.round(w / gap));
  const ny = Math.max(2, Math.round(h / gap));
  const sx = w / nx;
  const sy = h / ny;
  // walking clockwise, every bite curves into the card (sweep 0)
  const bite = (x1: number, y1: number, x2: number, y2: number) => `L${x1.toFixed(1)},${y1.toFixed(1)} A${r},${r} 0 0 0 ${x2.toFixed(1)},${y2.toFixed(1)} `;
  let d = 'M0,0 ';
  for (let i = 0; i < nx; i++) { const c = sx * (i + 0.5); d += bite(c - r, 0, c + r, 0); }
  d += `L${w},0 `;
  for (let i = 0; i < ny; i++) { const c = sy * (i + 0.5); d += bite(w, c - r, w, c + r); }
  d += `L${w},${h} `;
  for (let i = nx - 1; i >= 0; i--) { const c = sx * (i + 0.5); d += bite(c + r, h, c - r, h); }
  d += `L0,${h} `;
  for (let i = ny - 1; i >= 0; i--) { const c = sy * (i + 0.5); d += bite(0, c + r, 0, c - r); }
  return d + 'Z';
}

const ACCENTS: Accent[] = ['pink', 'sky', 'lime', 'tangerine', 'peach'];
const hash = (s: string) => s.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);
/** the reason tab's outline color: one of the five accents, steady per card */
export const reasonAccent = (m: Pick<Media, 'id'>) => ACCENTS[hash(m.id) % ACCENTS.length];

const fmtDate = (iso?: string) => {
  if (!iso) return '';
  const [y, mo, d] = iso.slice(0, 10).split('-');
  return y && mo && d ? `${mo}/${d}/${y}` : '';
};

/** One card for everything on the board: a perforated stamp with an image window, title, date and its reason. */
export function MediaCard({ m, showStamp = true }: { m: Media; showStamp?: boolean }) {
  const { w, h } = sizeOf(m);
  const via = m.via ? person(m.via) : undefined;
  const words = isWords(m.type) && !m.imageData;

  return (
    <div className={`paper-card stamp-card ${words ? 'is-words' : ''}`} style={{ width: w, height: h }}>
      <svg className="stamp-edge" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <path d={perforatedPath(w, h)} />
      </svg>
      <div className="stamp-window">
        {words ? (
          <blockquote className={`stamp-quote ${m.type === 'moment' ? 'is-moment' : ''}`}>{m.quote ?? m.title}</blockquote>
        ) : m.type === 'event' && !m.art && !m.imageData ? (
          <div className="stamp-event">
            <span>{fmtEventDate(m.when).month}</span>
            <strong>{fmtEventDate(m.when).day}</strong>
          </div>
        ) : (
          <>
            <MediaArt art={m.art} imageData={m.imageData} title={m.title} />
            {m.type === 'video' && <PlayGlyph />}
          </>
        )}
      </div>
      <div className="card-caption">
        <h3 className="card-title">{words ? m.subtitle || m.title : m.title}</h3>
        <span className="card-date">{fmtDate(m.when ?? m.addedAt)}</span>
      </div>
      {m.why && (
        <span className="reason-tab" style={{ ['--reason' as string]: `var(--${reasonAccent(m)})` }}>
          <span>{m.why}</span>
        </span>
      )}
      {showStamp && via && (
        <span className="corner-stamp" title={`added via a Crossing with ${via.name.split(' ')[0]}`}>
          <MiniStamp personId={via.id} size={26} />
        </span>
      )}
    </div>
  );
}
