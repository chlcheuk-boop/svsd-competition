import type { Quadrant } from '../../types';

export const QUADRANT_INFO: Record<Quadrant, { numeral: string; name: string; accent: string; story: string; axis: string }> = {
  1: { numeral: 'I', name: 'The Mirror', accent: 'sky', story: 'parallel roads', axis: 'similar collection · similar connections' },
  2: { numeral: 'II', name: 'The Lens', accent: 'tangerine', story: 'a fork', axis: 'similar collection · different connections' },
  3: { numeral: 'III', name: 'The Parallel', accent: 'lime', story: 'convergence', axis: 'different collection · similar connections' },
  4: { numeral: 'IV', name: 'The Stranger', accent: 'pink', story: 'an unmapped meeting', axis: 'different collection · different connections' },
};

const line = { fill: 'none', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

function star(cx: number, cy: number, r: number) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)} `;
  }
  return d + 'Z';
}

/** Original single-color line illustrations, one per quadrant. viewBox 0 0 100 140. */
export function TarotIllustration({ q, color = 'var(--ink)', size = 1 }: { q: Quadrant; color?: string; size?: number }) {
  const s = { ...line, stroke: color };
  let g: JSX.Element;
  if (q === 1) {
    // The Mirror: two parallel roads under one sun
    g = (
      <>
        <circle cx="50" cy="34" r="11" {...s} />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return <path key={i} d={`M${50 + Math.cos(a) * 15},${34 + Math.sin(a) * 15} L${50 + Math.cos(a) * (i % 2 ? 19 : 21)},${34 + Math.sin(a) * (i % 2 ? 19 : 21)}`} {...s} />;
        })}
        <path d="M10 64 C 30 63.4, 70 64.6, 90 63.8" {...s} />
        <path d="M18 132 L43 64.5 M34 132 L46.5 64.4" {...s} />
        <path d="M66 132 L53.5 64.3 M82 132 L57 64.2" {...s} />
        <path d="M26 116 v-8 m0 2 l-3 4 m3 -4 l3 4 m-3 -6 a2 2 0 1 1 0.1 0" {...s} />
        <path d="M74 116 v-8 m0 2 l-3 4 m3 -4 l3 4 m-3 -6 a2 2 0 1 1 0.1 0" {...s} />
        <path d="M40 92 l2 -6 M60 92 l-2 -6 M38 102 l1.6 -4 M62 102 l-1.6 -4" {...s} strokeDasharray="1 3" />
      </>
    );
  } else if (q === 2) {
    // The Lens: an eye inside a lens, one road splitting into two
    g = (
      <>
        <circle cx="50" cy="42" r="23" {...s} />
        <circle cx="50" cy="42" r="19.5" {...s} strokeDasharray="1 3.2" />
        <path d="M33 42 Q50 29 67 42 Q50 55 33 42Z" {...s} />
        <circle cx="50" cy="42" r="5.5" {...s} />
        <circle cx="51.5" cy="40.5" r="1" fill={color} />
        <path d="M66.5 58.5 L78 70.5" {...s} strokeWidth={3} />
        <path d="M44 134 L47 106 Q 42 94 22 84" {...s} />
        <path d="M56 134 L53 106 Q 60 94 80 86" {...s} />
        <path d="M50 132 L50 108 M50 106 Q 44 96 33 90 M50 106 Q 56 96 67 91" {...s} strokeDasharray="2 3.4" />
        <path d="M14 82 l4 -1 M84 84 l4 1" {...s} />
      </>
    );
  } else if (q === 3) {
    // The Parallel: a wavy road and a straight road meeting at a star
    g = (
      <>
        <path d={star(50, 32, 11)} {...s} />
        <path d="M50 14 v-6 M50 50 v5 M32 32 h-6 M68 32 h6" {...s} strokeDasharray="1 2.5" />
        <path d="M14 134 C 34 124, 8 110, 26 98 S 30 74, 40 64 S 46 50, 47.5 44" {...s} />
        <path d="M86 134 L52.5 44" {...s} />
        <path d="M78 116 l4 -1.5 M70 94 l4 -1.4 M62 74 l3.6 -1.3" {...s} />
        <path d="M22 120 l-4 -1 M20 102 l-4 -.5 M32 80 l-3.5 -1.5" {...s} />
      </>
    );
  } else {
    // The Stranger: two boats under two separate constellations
    g = (
      <>
        <path d="M76 18 a9 9 0 1 0 6 15 a7 7 0 1 1 -6 -15z" {...s} />
        <path d="M14 30 L24 22 L34 34 L28 46" {...s} strokeDasharray="1 2.6" />
        {[[14, 30], [24, 22], [34, 34], [28, 46]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill={color} />
        ))}
        <path d="M58 58 L70 50 L84 60" {...s} strokeDasharray="1 2.6" />
        {[[58, 58], [70, 50], [84, 60]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill={color} />
        ))}
        <path d="M46 20 l0 3 M44.5 21.5 l3 0 M88 80 l0 3 M86.5 81.5 l3 0 M12 70 l0 3 M10.5 71.5 l3 0" {...s} />
        <path d="M8 104 Q 16 101 24 104 T 40 104 T 56 104 T 72 104 T 92 104" {...s} />
        <path d="M14 118 Q 22 115 30 118 T 46 118 M58 126 Q 66 123 74 126 T 90 126" {...s} />
        <path d="M20 100 Q 28 108 38 100 Z M29 100 V82 L38 96" {...s} />
        <path d="M62 100 Q 70 108 80 100 Z M71 100 V86 L63 97" {...s} />
      </>
    );
  }
  return (
    <svg viewBox="0 0 100 140" width={100 * size} height={140 * size} aria-hidden="true" style={{ overflow: 'visible' }}>
      {g}
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
  const ink = q === 2 || q === 4 ? 'rgba(255,255,255,.75)' : 'rgba(46,44,42,.5)';
  return (
    <svg viewBox="0 0 100 175" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      <rect width="100" height="175" fill={`var(--${info.accent})`} />
      <rect x="5" y="5" width="90" height="165" fill="none" stroke={ink} strokeWidth=".6" />
      <rect x="7.5" y="7.5" width="85" height="160" fill="none" stroke={ink} strokeWidth=".4" strokeDasharray="1.4 1.6" />
      {stars.map(([x, y, r], i) => (
        <path key={i} d={`M${x - r},${y} L${x + r},${y} M${x},${y - r} L${x},${y + r}`} stroke={ink} strokeWidth=".5" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="87.5" r="17" fill="none" stroke={ink} strokeWidth=".6" />
      <circle cx="50" cy="87.5" r="13" fill="none" stroke={ink} strokeWidth=".6" strokeDasharray="1.2 1.8" />
      <path d="M38 90 C 44 76, 56 100, 62 84" fill="none" stroke={ink} strokeWidth=".8" strokeLinecap="round" />
      <path d="M50 70.5 v-10 M50 104.5 v10" stroke={ink} strokeWidth=".5" strokeDasharray="1 1.6" />
    </svg>
  );
}
