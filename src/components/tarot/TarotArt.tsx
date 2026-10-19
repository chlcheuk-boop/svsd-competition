import { AnimalShapes } from './Animals';
import type { Quadrant } from '../../types';

export const QUADRANT_INFO: Record<Quadrant, { numeral: string; name: string; accent: string; story: string; axis: string; animal: string }> = {
  1: { numeral: 'I', name: 'The Mirror', accent: 'sky', story: 'similar media · similar connections', axis: 'similar media · similar connections', animal: 'butterfly' },
  2: { numeral: 'II', name: 'The Lens', accent: 'tangerine', story: 'similar media · dissimilar connections', axis: 'similar media · dissimilar connections', animal: 'dragonfly' },
  3: { numeral: 'III', name: 'The Parallel', accent: 'lime', story: 'dissimilar media · similar connections', axis: 'dissimilar media · similar connections', animal: 'bird' },
  4: { numeral: 'IV', name: 'The Stranger', accent: 'pink', story: 'dissimilar media · dissimilar connections', axis: 'dissimilar media · dissimilar connections', animal: 'whale' },
};



/** The quadrant's animal, drawn as a solid geometric mark. viewBox 0 0 100 140. */
export function TarotIllustration({ q, color = 'var(--ink)', size = 1 }: { q: Quadrant; color?: string; size?: number }) {
  return (
    <svg viewBox="0 0 100 140" width={100 * size} height={140 * size} aria-hidden="true" style={{ overflow: 'visible' }}>
      <g transform="translate(2 18) scale(0.96)">
        <AnimalShapes q={q} fill={color} cut="var(--card-white)" />
      </g>
      <path d="M14 128 H86" stroke={color} strokeWidth="2.5" strokeLinecap="square" />
      <path d="M26 134 H74" stroke={color} strokeWidth="1.2" strokeDasharray="2 3" />
    </svg>
  );
}

/** Card back: fine-line stars and stitch marks on one accent color. */
export function TarotBack({ q }: { q: Quadrant }) {
  const info = QUADRANT_INFO[q];
  const stars: [number, number, number][] = [];
  let seed = q * 97;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 26; i++) stars.push([10 + rnd() * 80, 10 + rnd() * 155, 1 + rnd() * 1.8]);
  const ink = q === 2 || q === 4 ? 'rgba(255,255,255,.75)' : 'rgba(67, 32, 5,.5)';
  return (
    <svg viewBox="0 0 100 175" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <rect width="100" height="175" fill={`var(--${info.accent})`} />
      <rect x="5" y="5" width="90" height="165" fill="none" stroke={ink} strokeWidth=".6" />
      <rect x="7.5" y="7.5" width="85" height="160" fill="none" stroke={ink} strokeWidth=".4" strokeDasharray="1.4 1.6" />
      {stars.map(([x, y, r], i) => (
        <path key={i} d={`M${x - r},${y} L${x + r},${y} M${x},${y - r} L${x},${y + r}`} stroke={ink} strokeWidth=".5" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="87.5" r="19" fill="none" stroke={ink} strokeWidth=".6" />
      <circle cx="50" cy="87.5" r="15" fill="none" stroke={ink} strokeWidth=".6" strokeDasharray="1.2 1.8" />
      <g transform="translate(39 76.5) scale(0.22)">
        <AnimalShapes q={q} fill={q === 2 || q === 4 ? '#fffaf6' : '#432005'} cut={`var(--${info.accent})`} />
      </g>
      <path d="M50 70.5 v-10 M50 104.5 v10" stroke={ink} strokeWidth=".5" strokeDasharray="1 1.6" />
    </svg>
  );
}
