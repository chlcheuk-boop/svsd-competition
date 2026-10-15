import type { Accent } from '../../types';

export const YARN_HEX: Record<Accent, { base: string; deep: string; light: string }> = {
  tangerine: { base: '#E05E31', deep: '#A9411C', light: '#F59A72' },
  peach: { base: '#EFBF9F', deep: '#C98E68', light: '#FBE4D4' },
  lime: { base: '#B9C85A', deep: '#7F8C2E', light: '#DDE69B' },
  sky: { base: '#8FBDE6', deep: '#4F86B8', light: '#D2E6F8' },
  pink: { base: '#EE7A93', deep: '#B9475F', light: '#F8B4C3' },
  ink: { base: '#3A3735', deep: '#141312', light: '#8A847E' },
};

/** A strand of yarn: base fiber, dark twist marks and a light highlight so it reads as twisted fiber. */
export function YarnStrand({
  d, color, width = 3, opacity = 1, mask, className,
}: { d: string; color: Accent; width?: number; opacity?: number; mask?: string; className?: string }) {
  const c = YARN_HEX[color] ?? YARN_HEX.tangerine;
  return (
    <g opacity={opacity} mask={mask} className={className} style={{ pointerEvents: 'none' }}>
      <path d={d} fill="none" style={{ stroke: 'rgba(46,44,42,.13)' }} strokeWidth={width + 1.4} strokeLinecap="round" transform="translate(0 2.2)" />
      <path d={d} fill="none" style={{ stroke: c.base }} strokeWidth={width} strokeLinecap="round" />
      <path d={d} fill="none" style={{ stroke: c.deep }} strokeWidth={width} strokeLinecap="butt" strokeDasharray="1.1 3.1" opacity={0.42} />
      <path d={d} fill="none" style={{ stroke: c.light }} strokeWidth={width * 0.36} strokeLinecap="round" strokeDasharray="2.4 2" opacity={0.85} transform="translate(-0.3 -0.7)" />
    </g>
  );
}
