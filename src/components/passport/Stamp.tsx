import type { PassportStamp, StampShape } from '../../types';
import { person } from '../../data/people';
import { QUADRANT_INFO } from '../tarot/TarotArt';

export const STAMP_INK: Record<string, string> = {
  tangerine: '#C93A21',
  pink: '#D45C74',
  sky: '#3A8DB8',
  lime: '#B08A0D',
  peach: '#D45C74',
  ink: '#432005',
};

const SIZE: Record<StampShape, { w: number; h: number }> = {
  circle: { w: 176, h: 176 },
  rounded: { w: 206, h: 136 },
  oval: { w: 212, h: 146 },
  hexagon: { w: 184, h: 168 },
  perforated: { w: 158, h: 192 },
  triangle: { w: 206, h: 184 },
};
export const stampSize = (s: StampShape) => SIZE[s];

function perforatedPath(w: number, h: number, r = 4.2, step = 12) {
  // a postage-stamp edge: semicircle bites along every side
  let d = `M0,0 `;
  for (let x = step; x < w; x += step) d += `L${x - r},0 A${r},${r} 0 0 0 ${x + r},0 `;
  d += `L${w},0 `;
  for (let y = step; y < h; y += step) d += `L${w},${y - r} A${r},${r} 0 0 0 ${w},${y + r} `;
  d += `L${w},${h} `;
  for (let x = w - step; x > 0; x -= step) d += `L${x + r},${h} A${r},${r} 0 0 0 ${x - r},${h} `;
  d += `L0,${h} `;
  for (let y = h - step; y > 0; y -= step) d += `L0,${y + r} A${r},${r} 0 0 0 0,${y - r} `;
  return d + 'Z';
}

const fmt = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

/** A rubber-stamp impression: one ink color, rough edges, uneven fade. */
export function Stamp({ s, scale = 1 }: { s: PassportStamp; scale?: number }) {
  const p = person(s.personId)!;
  const ink = STAMP_INK[s.color] ?? STAMP_INK.ink;
  const { w, h } = SIZE[s.shape];
  const info = QUADRANT_INFO[s.quadrant];
  const common = { fill: 'none', stroke: ink };

  let frame: JSX.Element;
  let text = { x: 0, y: 0, w: 0, h: 0 };
  switch (s.shape) {
    case 'circle':
      frame = (
        <>
          <circle cx={w / 2} cy={h / 2} r={w / 2 - 3} {...common} strokeWidth={3} />
          <circle cx={w / 2} cy={h / 2} r={w / 2 - 10} {...common} strokeWidth={1} />
          <path id={`arc-${s.id}`} d={`M ${w / 2 - 66},${h / 2} A 66 66 0 0 1 ${w / 2 + 66},${h / 2}`} fill="none" />
          <text fill={ink} fontFamily="General Sans, sans-serif" fontSize="10.5" letterSpacing="1.5">
            <textPath href={`#arc-${s.id}`} startOffset="50%" textAnchor="middle">
              {`${p.name.toUpperCase()} · ${p.city.toUpperCase()}`}
            </textPath>
          </text>
        </>
      );
      text = { x: 34, y: 66, w: w - 68, h: 70 };
      break;
    case 'oval':
      frame = (
        <>
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 3} ry={h / 2 - 3} {...common} strokeWidth={3} />
          <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - 10} ry={h / 2 - 10} {...common} strokeWidth={1} strokeDasharray="3 2" />
        </>
      );
      text = { x: 30, y: 22, w: w - 60, h: h - 44 };
      break;
    case 'rounded':
      frame = (
        <>
          <rect x={2} y={2} width={w - 4} height={h - 4} rx={16} {...common} strokeWidth={3} />
          <rect x={9} y={9} width={w - 18} height={h - 18} rx={10} {...common} strokeWidth={1} />
        </>
      );
      text = { x: 20, y: 16, w: w - 40, h: h - 32 };
      break;
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${w / 2 + (w / 2 - 3) * Math.cos(a)},${h / 2 + (h / 2 - 3) * Math.sin(a)}`;
      }).join(' ');
      const pts2 = Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return `${w / 2 + (w / 2 - 11) * Math.cos(a)},${h / 2 + (h / 2 - 11) * Math.sin(a)}`;
      }).join(' ');
      frame = (
        <>
          <polygon points={pts} {...common} strokeWidth={3} strokeLinejoin="round" />
          <polygon points={pts2} {...common} strokeWidth={1} strokeLinejoin="round" />
        </>
      );
      text = { x: 40, y: 26, w: w - 80, h: h - 52 };
      break;
    }
    case 'perforated':
      frame = (
        <>
          <path d={perforatedPath(w, h)} fill={ink} opacity={0.1} />
          <path d={perforatedPath(w, h)} {...common} strokeWidth={1.2} />
          <rect x={10} y={10} width={w - 20} height={h - 20} {...common} strokeWidth={2} />
          <text x={w - 16} y={30} textAnchor="end" fill={ink} fontFamily="KoPub Batang, serif" fontSize="18">{info.numeral}</text>
        </>
      );
      text = { x: 18, y: 36, w: w - 36, h: h - 54 };
      break;
    case 'triangle':
      frame = (
        <>
          <polygon points={`${w / 2},3 ${w - 3},${h - 3} 3,${h - 3}`} {...common} strokeWidth={3} strokeLinejoin="round" />
          <polygon points={`${w / 2},16 ${w - 16},${h - 10} 16,${h - 10}`} {...common} strokeWidth={1} strokeLinejoin="round" />
        </>
      );
      text = { x: 50, y: 74, w: w - 100, h: h - 88 };
      break;
  }

  const showNumeral = s.shape !== 'perforated';
  const compact = s.shape === 'triangle' || s.shape === 'circle';

  return (
    <svg width={w * scale} height={h * scale} viewBox={`0 0 ${w} ${h}`} className="stamp-svg" role="img"
      aria-label={`Stamp from ${p.name}, ${p.city}, ${fmt(s.date)}: ${s.excerpt}`}>
      <g filter="url(#ink-bleed)">{frame}</g>
      <g filter="url(#ink-soft)">
        <foreignObject x={text.x} y={text.y} width={text.w} height={text.h}>
          <div className={`stamp-text ${compact ? 'compact' : ''}`} style={{ color: ink }}>
            {s.shape !== 'circle' && <span className="st-name">{p.name.split(' ')[0].toUpperCase()} · {p.city.toUpperCase()}</span>}
            <span className="st-excerpt">“{s.excerpt}”</span>
            <span className="st-meta">
              {fmt(s.date)}
              {showNumeral && <b> · {info.numeral}</b>}
            </span>
          </div>
        </foreignObject>
      </g>
    </svg>
  );
}
