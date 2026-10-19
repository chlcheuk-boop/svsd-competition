import type { Quadrant } from '../../types';

/**
 * The four quadrant marks, hand-inked on the style sheet and cut out as white-ink masks
 * (so they take any color, in CSS and in SVG alike).
 *   I   Rock     similar media · similar connections        → stacked stones
 *   II  Shell    similar media · dissimilar connections     → spiral shell
 *   III Pearl    dissimilar media · similar connections     → cloud
 *   IV  Ocean    dissimilar media · dissimilar connections  → wave
 * The file keeps its old name; the marks used to be animals.
 */
export const ANIMAL_NAME: Record<Quadrant, string> = { 1: 'stones', 2: 'shell', 3: 'cloud', 4: 'wave' };

const SRC: Record<Quadrant, { src: string; w: number; h: number }> = {
  1: { src: '/brand/stones.png', w: 87, h: 104 },
  2: { src: '/brand/spiral.png', w: 92, h: 92 },
  3: { src: '/brand/cloud.png', w: 152, h: 115 },
  4: { src: '/brand/wave.png', w: 128, h: 110 },
};

/** The mark inside a 100×100 box, filled with `fill`. (`cut` is kept for callers; the ink's own gaps show through.) */
export function AnimalShapes({ q, fill }: { q: Quadrant; fill: string; cut?: string }) {
  const id = `qmark-${q}`;
  return (
    <g>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <image href={SRC[q].src} x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet" />
        </mask>
      </defs>
      <rect width="100" height="100" fill={fill} mask={`url(#${id})`} />
    </g>
  );
}

/** Standalone mark, square. */
export function AnimalMark({ q, size = 24, color = 'var(--ink)', title }: {
  q: Quadrant; size?: number; color?: string; cut?: string; title?: string;
}) {
  const { src } = SRC[q];
  return (
    <span
      className="ink-icon"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={{ width: size, height: size, color, WebkitMaskImage: `url(${src})`, maskImage: `url(${src})` }}
    />
  );
}
