import type { Quadrant } from '../../types';

/**
 * The four match animals, drawn like sticker marks: solid geometric silhouettes
 * (circles, ellipses, triangles, rounded bars) with a few cut-out details.
 * All shapes live in a 100×100 box.
 *   I   Mirror   → butterfly  (a symmetric mirror image)
 *   II  Lens     → dragonfly  (compound eyes)
 *   III Parallel → bird       (flies alongside, migration)
 *   IV  Stranger → whale      (from somewhere unmapped and deep)
 */
export const ANIMAL_NAME: Record<Quadrant, string> = { 1: 'butterfly', 2: 'dragonfly', 3: 'bird', 4: 'whale' };

export function AnimalShapes({ q, fill, cut }: { q: Quadrant; fill: string; cut: string }) {
  if (q === 1) {
    return (
      <g>
        <circle cx="29" cy="38" r="21" fill={fill} />
        <circle cx="71" cy="38" r="21" fill={fill} />
        <circle cx="34" cy="66" r="14" fill={fill} />
        <circle cx="66" cy="66" r="14" fill={fill} />
        <circle cx="27" cy="34" r="7" fill={cut} />
        <circle cx="73" cy="34" r="7" fill={cut} />
        <circle cx="27" cy="34" r="3" fill={fill} />
        <circle cx="73" cy="34" r="3" fill={fill} />
        <circle cx="35" cy="68" r="4" fill={cut} />
        <circle cx="65" cy="68" r="4" fill={cut} />
        <rect x="45" y="28" width="10" height="52" rx="5" fill={fill} />
        <rect x="48.5" y="30" width="3" height="46" rx="1.5" fill={cut} opacity=".35" />
        <path d="M47 29 L37 12 M53 29 L63 12" stroke={fill} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="37" cy="12" r="4" fill={fill} />
        <circle cx="63" cy="12" r="4" fill={fill} />
      </g>
    );
  }
  if (q === 2) {
    return (
      <g>
        <ellipse cx="27" cy="40" rx="24" ry="8" fill={fill} transform="rotate(-10 27 40)" />
        <ellipse cx="73" cy="40" rx="24" ry="8" fill={fill} transform="rotate(10 73 40)" />
        <ellipse cx="29" cy="54" rx="21" ry="7" fill={fill} transform="rotate(10 29 54)" />
        <ellipse cx="71" cy="54" rx="21" ry="7" fill={fill} transform="rotate(-10 71 54)" />
        <path d="M10 42 L44 37 M90 42 L56 37 M12 52 L44 50 M88 52 L56 50" stroke={cut} strokeWidth="1.6" strokeLinecap="round" />
        <rect x="45" y="30" width="10" height="64" rx="5" fill={fill} />
        <path d="M45 62 h10 M45 70 h10 M45 78 h10 M45 86 h10" stroke={cut} strokeWidth="2" />
        <circle cx="50" cy="24" r="12" fill={fill} />
        <circle cx="44" cy="21" r="6" fill={cut} />
        <circle cx="56" cy="21" r="6" fill={cut} />
        <circle cx="44.5" cy="21.5" r="3" fill={fill} />
        <circle cx="55.5" cy="21.5" r="3" fill={fill} />
      </g>
    );
  }
  if (q === 3) {
    return (
      <g>
        <path d="M30 60 L4 74 L10 58 Z" fill={fill} />
        <circle cx="44" cy="56" r="25" fill={fill} />
        <circle cx="66" cy="36" r="15" fill={fill} />
        <path d="M78 31 L96 37 L78 43 Z" fill={fill} />
        <circle cx="69" cy="33" r="5" fill={cut} />
        <circle cx="70" cy="33" r="2.5" fill={fill} />
        <path d="M26 50 Q 42 44 58 52 L 40 70 Z" fill={cut} />
        <path d="M30 54 L 52 54 M33 59 L 48 59" stroke={fill} strokeWidth="2" strokeLinecap="round" />
        <path d="M40 80 L37 95 M50 80 L53 95" stroke={fill} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M31 95 h10 M48 95 h10" stroke={fill} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      <path d="M24 60 Q 24 34 58 34 Q 92 34 92 60 L 92 64 Q 92 82 70 82 L 30 82 Q 24 82 24 72 Z" fill={fill} />
      <path d="M26 66 L4 48 L14 64 L2 72 Z" fill={fill} />
      <path d="M30 76 L86 76" stroke={cut} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M40 70 L82 70" stroke={cut} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="76" cy="58" r="5.5" fill={cut} />
      <circle cx="77" cy="58" r="2.6" fill={fill} />
      <rect x="62" y="20" width="5" height="12" rx="2.5" fill={fill} />
      <circle cx="56" cy="16" r="4.5" fill={fill} />
      <circle cx="64.5" cy="10" r="4.5" fill={fill} />
      <circle cx="73" cy="16" r="4.5" fill={fill} />
    </g>
  );
}

/** Standalone mark, square. */
export function AnimalMark({ q, size = 24, color = 'var(--ink)', cut = 'var(--card-white)', title }: {
  q: Quadrant; size?: number; color?: string; cut?: string; title?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <AnimalShapes q={q} fill={color} cut={cut} />
    </svg>
  );
}
